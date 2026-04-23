import Supplier from "../models/Supplier.js";
import Product from "../models/Product.js";

const roundMoney = (value) => Number((value || 0).toFixed(2));

export const getOwnerSuppliers = async (req, res) => {
  const companyId = req.user.companyId;

  const suppliers = await Supplier.find({ companyId })
    .select(
      "name code email orderMethod deliveryDays minimumOrderAmount isActive createdAt",
    )
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: suppliers.length,
    suppliers: suppliers.map((supplier) => ({
      _id: supplier._id,
      name: supplier.name,
      code: supplier.code,
      email: supplier.email,
      orderMethod: supplier.orderMethod,
      deliveryDays: supplier.deliveryDays || [],
      minimumOrderAmount: roundMoney(supplier.minimumOrderAmount || 0),
      isActive: supplier.isActive,
      createdAt: supplier.createdAt,
    })),
  });
};

export const createOwnerSupplier = async (req, res) => {
  const companyId = req.user.companyId;

  const {
    name,
    code,
    email,
    orderMethod = "email",
    deliveryDays = [],
    minimumOrderAmount = 0,
  } = req.body;

  if (!name || !code || !email) {
    res.status(400);
    throw new Error("Supplier name, code, and email are required");
  }

  const existingSupplier = await Supplier.findOne({
    companyId,
    code: code.trim(),
  });

  if (existingSupplier) {
    res.status(400);
    throw new Error("Supplier code already exists for this company");
  }

  const supplier = await Supplier.create({
    companyId,
    name: name.trim(),
    code: code.trim(),
    email: email.trim().toLowerCase(),
    orderMethod,
    deliveryDays,
    minimumOrderAmount,
    isActive: true,
  });

  res.status(201).json({
    success: true,
    message: "Supplier created successfully",
    supplier: {
      _id: supplier._id,
      name: supplier.name,
      code: supplier.code,
      email: supplier.email,
      orderMethod: supplier.orderMethod,
      deliveryDays: supplier.deliveryDays || [],
      minimumOrderAmount: roundMoney(supplier.minimumOrderAmount || 0),
      isActive: supplier.isActive,
      createdAt: supplier.createdAt,
    },
  });
};

export const updateOwnerSupplier = async (req, res) => {
  const companyId = req.user.companyId;
  const { id } = req.params;

  const supplier = await Supplier.findOne({ _id: id, companyId });

  if (!supplier) {
    res.status(404);
    throw new Error("Supplier not found");
  }

  const {
    name,
    code,
    email,
    orderMethod,
    deliveryDays,
    minimumOrderAmount,
    isActive,
  } = req.body;

  if (code && code !== supplier.code) {
    const existingSupplier = await Supplier.findOne({
      companyId,
      code: code.trim(),
      _id: { $ne: id },
    });

    if (existingSupplier) {
      res.status(400);
      throw new Error("Supplier code already exists for this company");
    }
  }

  supplier.name = name ?? supplier.name;
  supplier.code = code ?? supplier.code;
  supplier.email = email ? email.trim().toLowerCase() : supplier.email;
  supplier.orderMethod = orderMethod ?? supplier.orderMethod;
  supplier.deliveryDays = deliveryDays ?? supplier.deliveryDays;
  supplier.minimumOrderAmount =
    minimumOrderAmount ?? supplier.minimumOrderAmount;
  supplier.isActive =
    typeof isActive === "boolean" ? isActive : supplier.isActive;

  await supplier.save();

  res.status(200).json({
    success: true,
    message: "Supplier updated successfully",
    supplier: {
      _id: supplier._id,
      name: supplier.name,
      code: supplier.code,
      email: supplier.email,
      orderMethod: supplier.orderMethod,
      deliveryDays: supplier.deliveryDays || [],
      minimumOrderAmount: roundMoney(supplier.minimumOrderAmount || 0),
      isActive: supplier.isActive,
      createdAt: supplier.createdAt,
    },
  });
};

export const getOwnerProducts = async (req, res) => {
  const companyId = req.user.companyId;

  const products = await Product.find({ companyId })
    .populate("supplierId", "name code email orderMethod")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: products.length,
    products: products.map((product) => ({
      _id: product._id,
      name: product.name,
      sku: product.sku,
      category: product.category,
      description: product.description,
      unit: product.unit,
      price: roundMoney(product.price || 0),
      currency: product.currency || "EUR",
      isAvailable: product.isAvailable,
      isActive: product.isActive,
      createdAt: product.createdAt,
      supplierId: product.supplierId
        ? {
            _id: product.supplierId._id,
            name: product.supplierId.name,
            code: product.supplierId.code,
            email: product.supplierId.email,
            orderMethod: product.supplierId.orderMethod,
          }
        : null,
    })),
  });
};

export const createOwnerProduct = async (req, res) => {
  const companyId = req.user.companyId;

  const {
    supplierId,
    name,
    sku,
    category,
    description = "",
    unit,
    price,
    currency = "EUR",
  } = req.body;

  if (
    !supplierId ||
    !name ||
    !sku ||
    !category ||
    !unit ||
    price === undefined
  ) {
    res.status(400);
    throw new Error(
      "Supplier, name, SKU, category, unit, and price are required",
    );
  }

  const supplier = await Supplier.findOne({
    _id: supplierId,
    companyId,
    isActive: true,
  });

  if (!supplier) {
    res.status(404);
    throw new Error("Assigned supplier not found");
  }

  const existingProduct = await Product.findOne({
    companyId,
    sku: sku.trim(),
  });

  if (existingProduct) {
    res.status(400);
    throw new Error("Product SKU already exists for this company");
  }

  const parsedPrice = Number(price);
  if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
    res.status(400);
    throw new Error("Invalid product price");
  }

  const product = await Product.create({
    companyId,
    supplierId,
    name: name.trim(),
    sku: sku.trim(),
    category: category.trim(),
    description: description.trim(),
    unit: unit.trim(),
    price: parsedPrice,
    currency,
    isAvailable: true,
    isActive: true,
  });

  const createdProduct = await Product.findById(product._id).populate(
    "supplierId",
    "name code email orderMethod",
  );

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    product: {
      _id: createdProduct._id,
      name: createdProduct.name,
      sku: createdProduct.sku,
      category: createdProduct.category,
      description: createdProduct.description,
      unit: createdProduct.unit,
      price: roundMoney(createdProduct.price || 0),
      currency: createdProduct.currency || "EUR",
      isAvailable: createdProduct.isAvailable,
      isActive: createdProduct.isActive,
      createdAt: createdProduct.createdAt,
      supplierId: createdProduct.supplierId
        ? {
            _id: createdProduct.supplierId._id,
            name: createdProduct.supplierId.name,
            code: createdProduct.supplierId.code,
            email: createdProduct.supplierId.email,
            orderMethod: createdProduct.supplierId.orderMethod,
          }
        : null,
    },
  });
};

export const updateOwnerProduct = async (req, res) => {
  const companyId = req.user.companyId;
  const { id } = req.params;

  const product = await Product.findOne({ _id: id, companyId });

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const {
    supplierId,
    name,
    sku,
    category,
    description,
    unit,
    price,
    currency,
    isAvailable,
    isActive,
  } = req.body;

  if (supplierId && String(supplierId) !== String(product.supplierId)) {
    const supplier = await Supplier.findOne({
      _id: supplierId,
      companyId,
      isActive: true,
    });

    if (!supplier) {
      res.status(404);
      throw new Error("Assigned supplier not found");
    }

    product.supplierId = supplierId;
  }

  if (sku && sku !== product.sku) {
    const existingProduct = await Product.findOne({
      companyId,
      sku: sku.trim(),
      _id: { $ne: id },
    });

    if (existingProduct) {
      res.status(400);
      throw new Error("Product SKU already exists for this company");
    }
  }

  if (price !== undefined) {
    const parsedPrice = Number(price);
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      res.status(400);
      throw new Error("Invalid product price");
    }
    product.price = parsedPrice;
  }

  product.name = name ?? product.name;
  product.sku = sku ?? product.sku;
  product.category = category ?? product.category;
  product.description = description ?? product.description;
  product.unit = unit ?? product.unit;
  product.currency = currency ?? product.currency;
  product.isAvailable =
    typeof isAvailable === "boolean" ? isAvailable : product.isAvailable;
  product.isActive =
    typeof isActive === "boolean" ? isActive : product.isActive;

  await product.save();

  const updatedProduct = await Product.findById(product._id).populate(
    "supplierId",
    "name code email orderMethod",
  );

  res.status(200).json({
    success: true,
    message: "Product updated successfully",
    product: {
      _id: updatedProduct._id,
      name: updatedProduct.name,
      sku: updatedProduct.sku,
      category: updatedProduct.category,
      description: updatedProduct.description,
      unit: updatedProduct.unit,
      price: roundMoney(updatedProduct.price || 0),
      currency: updatedProduct.currency || "EUR",
      isAvailable: updatedProduct.isAvailable,
      isActive: updatedProduct.isActive,
      createdAt: updatedProduct.createdAt,
      supplierId: updatedProduct.supplierId
        ? {
            _id: updatedProduct.supplierId._id,
            name: updatedProduct.supplierId.name,
            code: updatedProduct.supplierId.code,
            email: updatedProduct.supplierId.email,
            orderMethod: updatedProduct.supplierId.orderMethod,
          }
        : null,
    },
  });
};
