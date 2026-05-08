import Order from "../models/Order.js";
import SupplierOrder from "../models/SupplierOrder.js";
import Product from "../models/Product.js";
import Supplier from "../models/Supplier.js";
import Location from "../models/Location.js";

const generateOrderNumber = () => {
  return `ORD-${Date.now()}`;
};

const generateSupplierOrderNumber = (supplierCode) => {
  return `SUP-${supplierCode}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

const roundMoney = (value) => Number(value.toFixed(2));

export const createOrder = async (req, res) => {
  const { items, notes = "" } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error("Order items are required");
  }

  const user = req.user;
  const companyId = user.companyId;
  const locationId = user.locationId;

  if (!locationId) {
    res.status(400);
    throw new Error("Manager location is required to create an order");
  }

  const location = await Location.findOne({
    _id: locationId,
    companyId,
    isActive: true,
  });

  if (!location) {
    res.status(404);
    throw new Error("Location not found");
  }

  const productIds = items.map((item) => item.productId);

  const products = await Product.find({
    _id: { $in: productIds },
    companyId,
    isActive: true,
    isAvailable: true,
  }).populate("supplierId", "name code email orderMethod");

  if (products.length !== items.length) {
    res.status(400);
    throw new Error("One or more products are invalid or unavailable");
  }

  const productMap = new Map(
    products.map((product) => [String(product._id), product]),
  );

  const normalizedItems = items.map((item) => {
    const product = productMap.get(String(item.productId));

    if (!product) {
      throw new Error(`Invalid product: ${item.productId}`);
    }

    const quantity = Number(item.quantity);

    if (!quantity || quantity < 1) {
      throw new Error(`Invalid quantity for product: ${product.name}`);
    }

    return {
      productId: product._id,
      supplierId: product.supplierId._id,
      name: product.name,
      sku: product.sku,
      unit: product.unit,
      quantity,
      unitPrice: roundMoney(product.price),
      lineTotal: roundMoney(quantity * product.price),
    };
  });

  const totalItems = normalizedItems.length;
  const totalQuantity = normalizedItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const subtotalAmount = roundMoney(
    normalizedItems.reduce((sum, item) => sum + item.lineTotal, 0),
  );

  const order = await Order.create({
    companyId,
    locationId,
    createdByUserId: user._id,
    orderNumber: generateOrderNumber(),
    items: normalizedItems,
    totalItems,
    totalQuantity,
    subtotalAmount,
    currency: "EUR",
    status: "split",
    notes,
  });

  const groupedBySupplier = normalizedItems.reduce((acc, item) => {
    const supplierKey = String(item.supplierId);

    if (!acc[supplierKey]) {
      acc[supplierKey] = [];
    }

    acc[supplierKey].push(item);
    return acc;
  }, {});

  const supplierIds = Object.keys(groupedBySupplier);

  const suppliers = await Supplier.find({
    _id: { $in: supplierIds },
    companyId,
    isActive: true,
  });

  const supplierMap = new Map(
    suppliers.map((supplier) => [String(supplier._id), supplier]),
  );

  const createdSupplierOrders = [];

  for (const supplierId of supplierIds) {
    const supplier = supplierMap.get(supplierId);

    if (!supplier) {
      continue;
    }

    const supplierItems = groupedBySupplier[supplierId];
    const supplierTotalItems = supplierItems.length;
    const supplierTotalQuantity = supplierItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    const supplierSubtotal = roundMoney(
      supplierItems.reduce((sum, item) => sum + item.lineTotal, 0),
    );

    const supplierOrder = await SupplierOrder.create({
      companyId,
      parentOrderId: order._id,
      supplierId: supplier._id,
      locationId,
      createdByUserId: user._id,
      supplierOrderNumber: generateSupplierOrderNumber(supplier.code),
      items: supplierItems.map((item) => ({
        productId: item.productId,
        name: item.name,
        sku: item.sku,
        unit: item.unit,
        quantity: item.quantity,
        unitPrice: roundMoney(item.unitPrice),
        lineTotal: roundMoney(item.lineTotal),
      })),
      totalItems: supplierTotalItems,
      totalQuantity: supplierTotalQuantity,
      subtotalAmount: supplierSubtotal,
      currency: "EUR",
      status: "pending",
      notes,
    });

    createdSupplierOrders.push({
      id: supplierOrder._id,
      supplierOrderNumber: supplierOrder.supplierOrderNumber,
      supplier: {
        id: supplier._id,
        name: supplier.name,
        code: supplier.code,
        email: supplier.email,
        orderMethod: supplier.orderMethod,
      },
      items: supplierItems.map((item) => ({
        productId: item.productId,
        name: item.name,
        sku: item.sku,
        unit: item.unit,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
      })),
      totalItems: supplierOrder.totalItems,
      totalQuantity: supplierOrder.totalQuantity,
      subtotalAmount: roundMoney(supplierOrder.subtotalAmount),
      status: supplierOrder.status,
    });
  }

  res.status(201).json({
    success: true,
    message: "Order created and split by supplier successfully",
    order: {
      id: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalItems: order.totalItems,
      totalQuantity: order.totalQuantity,
      subtotalAmount: roundMoney(order.subtotalAmount),
      currency: order.currency,
      location: {
        id: location._id,
        name: location.name,
        code: location.code,
        city: location.city,
      },
      supplierOrdersCount: createdSupplierOrders.length,
    },
    supplierOrders: createdSupplierOrders,
    summary: {
      totalSuppliers: createdSupplierOrders.length,
      totalItems,
      totalQuantity,
      subtotalAmount: roundMoney(subtotalAmount),
      currency: "EUR",
    },
  });
};

export const getOrders = async (req, res) => {
  const user = req.user;
  const companyId = user.companyId;
  const locationId = user.locationId;

  const filter = {
    companyId,
  };

  if (user.role === "manager") {
    filter.locationId = locationId;
  }

  const orders = await Order.find(filter)
    .populate("locationId", "name code city")
    .populate("createdByUserId", "name email role")
    .sort({ createdAt: -1 });

  const orderIds = orders.map((order) => order._id);

  const supplierOrders = await SupplierOrder.find({
    parentOrderId: { $in: orderIds },
  })
    .populate("supplierId", "name code email orderMethod")
    .populate("items.productId", "name sku category unit price image");

  const groupedSupplierOrders = supplierOrders.reduce((acc, supplierOrder) => {
    const key = String(supplierOrder.parentOrderId);
    if (!acc[key]) acc[key] = [];
    acc[key].push(supplierOrder);
    return acc;
  }, {});

  const result = orders.map((order) => ({
    id: order._id,
    orderNumber: order.orderNumber,
    status: order.status,
    totalItems: order.totalItems,
    totalQuantity: order.totalQuantity,
    subtotalAmount: roundMoney(order.subtotalAmount),
    currency: order.currency,
    notes: order.notes,
    createdAt: order.createdAt,
    location: order.locationId
      ? {
          id: order.locationId._id,
          name: order.locationId.name,
          code: order.locationId.code,
          city: order.locationId.city,
        }
      : null,
    createdBy: order.createdByUserId
      ? {
          id: order.createdByUserId._id,
          name: order.createdByUserId.name,
          email: order.createdByUserId.email,
          role: order.createdByUserId.role,
        }
      : null,
    supplierOrders:
      groupedSupplierOrders[String(order._id)]?.map((supplierOrder) => ({
        id: supplierOrder._id,
        supplierOrderNumber: supplierOrder.supplierOrderNumber,
        supplier: supplierOrder.supplierId
          ? {
              id: supplierOrder.supplierId._id,
              name: supplierOrder.supplierId.name,
              code: supplierOrder.supplierId.code,
              email: supplierOrder.supplierId.email,
              orderMethod: supplierOrder.supplierId.orderMethod,
            }
          : null,

        items: supplierOrder.items.map((item) => ({
          productId: item.productId?._id || item.productId,
          name: item.productId?.name || item.name,
          sku: item.productId?.sku || item.sku,
          category: item.productId?.category || "",
          unit: item.productId?.unit || item.unit,
          image: item.productId?.image || { url: "", publicId: "" },
          quantity: item.quantity,
          unitPrice: roundMoney(item.unitPrice),
          lineTotal: roundMoney(item.lineTotal),
        })),

        totalItems: supplierOrder.totalItems,
        totalQuantity: supplierOrder.totalQuantity,
        subtotalAmount: roundMoney(supplierOrder.subtotalAmount),
        status: supplierOrder.status,
      })) || [],
  }));

  res.status(200).json({
    success: true,
    count: result.length,
    orders: result,
  });
};

export const getOrderById = async (req, res) => {
  const user = req.user;
  const companyId = user.companyId;
  const locationId = user.locationId;
  const { id } = req.params;

  const filter = {
    _id: id,
    companyId,
  };

  if (user.role === "manager") {
    filter.locationId = locationId;
  }

  const order = await Order.findOne(filter)
    .populate("locationId", "name code city")
    .populate("createdByUserId", "name email role");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const supplierOrders = await SupplierOrder.find({
    parentOrderId: order._id,
  }).populate("supplierId", "name code email orderMethod");

  res.status(200).json({
    success: true,
    order: {
      id: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalItems: order.totalItems,
      totalQuantity: order.totalQuantity,
      subtotalAmount: roundMoney(order.subtotalAmount),
      currency: order.currency,
      notes: order.notes,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        productId: item.productId,
        supplierId: item.supplierId,
        name: item.name,
        sku: item.sku,
        unit: item.unit,
        quantity: item.quantity,
        unitPrice: roundMoney(item.unitPrice),
        lineTotal: roundMoney(item.lineTotal),
      })),
      location: order.locationId
        ? {
            id: order.locationId._id,
            name: order.locationId.name,
            code: order.locationId.code,
            city: order.locationId.city,
          }
        : null,
      createdBy: order.createdByUserId
        ? {
            id: order.createdByUserId._id,
            name: order.createdByUserId.name,
            email: order.createdByUserId.email,
            role: order.createdByUserId.role,
          }
        : null,
    },
    supplierOrders: supplierOrders.map((supplierOrder) => ({
      id: supplierOrder._id,
      supplierOrderNumber: supplierOrder.supplierOrderNumber,
      supplier: supplierOrder.supplierId
        ? {
            id: supplierOrder.supplierId._id,
            name: supplierOrder.supplierId.name,
            code: supplierOrder.supplierId.code,
            email: supplierOrder.supplierId.email,
            orderMethod: supplierOrder.supplierId.orderMethod,
          }
        : null,
      items: supplierOrder.items.map((item) => ({
        productId: item.productId,
        name: item.name,
        sku: item.sku,
        unit: item.unit,
        quantity: item.quantity,
        unitPrice: roundMoney(item.unitPrice),
        lineTotal: roundMoney(item.lineTotal),
      })),
      totalItems: supplierOrder.totalItems,
      totalQuantity: supplierOrder.totalQuantity,
      subtotalAmount: roundMoney(supplierOrder.subtotalAmount),
      status: supplierOrder.status,
      createdAt: supplierOrder.createdAt,
    })),
  });
};
