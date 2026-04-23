import Location from "../models/Location.js";
import Supplier from "../models/Supplier.js";
import Order from "../models/Order.js";
import SupplierOrder from "../models/SupplierOrder.js";

const roundMoney = (value) => Number((value || 0).toFixed(2));

const getLastNMonths = (count = 6) => {
  const months = [];
  const now = new Date();

  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

    months.push({
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: date.toLocaleString("en-US", {
        month: "short",
        year: "2-digit",
      }),
      orders: 0,
      spend: 0,
    });
  }

  return months;
};

const buildMonthlyTrend = (orders, count = 6) => {
  const months = getLastNMonths(count);
  const monthMap = new Map(months.map((item) => [item.key, item]));

  for (const order of orders) {
    const date = new Date(order.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    if (!monthMap.has(key)) continue;

    const entry = monthMap.get(key);
    entry.orders += 1;
    entry.spend += order.subtotalAmount || 0;
  }

  return months.map((item) => ({
    ...item,
    spend: roundMoney(item.spend),
  }));
};

export const getOwnerDashboardStats = async (req, res) => {
  const companyId = req.user.companyId;

  const [
    locationsCount,
    suppliersCount,
    ordersCount,
    orders,
    locations,
    supplierOrders,
  ] = await Promise.all([
    Location.countDocuments({ companyId, isActive: true }),
    Supplier.countDocuments({ companyId, isActive: true }),
    Order.countDocuments({ companyId }),
    Order.find({ companyId })
      .select("subtotalAmount totalQuantity createdAt locationId")
      .populate("locationId", "name code city")
      .sort({ createdAt: -1 }),
    Location.find({ companyId, isActive: true })
      .select("name code city")
      .sort({ createdAt: 1 }),
    SupplierOrder.find({ companyId })
      .select("supplierId subtotalAmount totalQuantity status createdAt")
      .populate("supplierId", "name code")
      .sort({ createdAt: -1 }),
  ]);

  const totalSpend = roundMoney(
    orders.reduce((sum, order) => sum + (order.subtotalAmount || 0), 0),
  );

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const ordersThisWeek = orders.filter(
    (order) => new Date(order.createdAt) >= sevenDaysAgo,
  ).length;

  const branchMap = new Map();

  for (const location of locations) {
    branchMap.set(String(location._id), {
      id: location._id,
      name: location.name,
      code: location.code,
      city: location.city,
      orders: 0,
      spend: 0,
    });
  }

  for (const order of orders) {
    const locationId = order.locationId?._id
      ? String(order.locationId._id)
      : String(order.locationId);

    if (!branchMap.has(locationId)) continue;

    const entry = branchMap.get(locationId);
    entry.orders += 1;
    entry.spend += order.subtotalAmount || 0;
  }

  const branchOverview = Array.from(branchMap.values())
    .map((branch) => ({
      ...branch,
      spend: roundMoney(branch.spend),
      status:
        branch.orders >= 10 ? "Strong" : branch.orders >= 5 ? "Stable" : "Low",
    }))
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 6);

  const supplierMap = new Map();

  for (const supplierOrder of supplierOrders) {
    const supplierId = supplierOrder.supplierId?._id
      ? String(supplierOrder.supplierId._id)
      : String(supplierOrder.supplierId);

    if (!supplierId) continue;

    if (!supplierMap.has(supplierId)) {
      supplierMap.set(supplierId, {
        id: supplierOrder.supplierId?._id || supplierOrder.supplierId,
        name: supplierOrder.supplierId?.name || "Unknown Supplier",
        code: supplierOrder.supplierId?.code || "",
        orders: 0,
        totalQuantity: 0,
        totalAmount: 0,
        status: "Active",
        method: "Email",
      });
    }

    const entry = supplierMap.get(supplierId);
    entry.orders += 1;
    entry.totalQuantity += supplierOrder.totalQuantity || 0;
    entry.totalAmount += supplierOrder.subtotalAmount || 0;
  }

  const supplierOverview = Array.from(supplierMap.values())
    .map((supplier) => ({
      ...supplier,
      totalAmount: roundMoney(supplier.totalAmount),
    }))
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 6);

  const recentOrders = orders.slice(0, 5).map((order) => ({
    id: order._id,
    subtotalAmount: roundMoney(order.subtotalAmount || 0),
    totalQuantity: order.totalQuantity || 0,
    createdAt: order.createdAt,
    location: order.locationId
      ? {
          id: order.locationId._id,
          name: order.locationId.name,
          code: order.locationId.code,
          city: order.locationId.city,
        }
      : null,
  }));

  const monthlyTrend = buildMonthlyTrend(orders, 6);

  res.status(200).json({
    success: true,
    stats: {
      locations: locationsCount,
      suppliers: suppliersCount,
      ordersThisWeek,
      totalOrders: ordersCount,
      totalSpend,
      efficiencyScore: ordersCount > 0 ? 92 : 0,
    },
    branchOverview,
    supplierOverview,
    recentOrders,
    monthlyTrend,
  });
};

export const getManagerDashboardStats = async (req, res) => {
  const companyId = req.user.companyId;
  const locationId = req.user.locationId;

  if (!locationId) {
    res.status(400);
    throw new Error("Manager location not found");
  }

  const [location, suppliersCount, orders, supplierOrders] = await Promise.all([
    Location.findOne({ _id: locationId, companyId, isActive: true }).select(
      "name code city",
    ),
    Supplier.countDocuments({ companyId, isActive: true }),
    Order.find({ companyId, locationId })
      .select("subtotalAmount totalQuantity createdAt")
      .sort({ createdAt: -1 }),
    SupplierOrder.find({ companyId, locationId })
      .select("supplierId subtotalAmount totalQuantity status createdAt")
      .populate("supplierId", "name code")
      .sort({ createdAt: -1 }),
  ]);

  if (!location) {
    res.status(404);
    throw new Error("Location not found");
  }

  const totalOrders = orders.length;
  const totalSpend = roundMoney(
    orders.reduce((sum, order) => sum + (order.subtotalAmount || 0), 0),
  );
  const totalQuantity = orders.reduce(
    (sum, order) => sum + (order.totalQuantity || 0),
    0,
  );

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const ordersThisWeek = orders.filter(
    (order) => new Date(order.createdAt) >= sevenDaysAgo,
  ).length;

  const supplierMap = new Map();

  for (const supplierOrder of supplierOrders) {
    const supplierId = supplierOrder.supplierId?._id
      ? String(supplierOrder.supplierId._id)
      : String(supplierOrder.supplierId);

    if (!supplierId) continue;

    if (!supplierMap.has(supplierId)) {
      supplierMap.set(supplierId, {
        id: supplierOrder.supplierId?._id || supplierOrder.supplierId,
        name: supplierOrder.supplierId?.name || "Unknown Supplier",
        code: supplierOrder.supplierId?.code || "",
        orders: 0,
        totalQuantity: 0,
        totalAmount: 0,
        status: "Active",
      });
    }

    const entry = supplierMap.get(supplierId);
    entry.orders += 1;
    entry.totalQuantity += supplierOrder.totalQuantity || 0;
    entry.totalAmount += supplierOrder.subtotalAmount || 0;
  }

  const supplierOverview = Array.from(supplierMap.values())
    .map((supplier) => ({
      ...supplier,
      totalAmount: roundMoney(supplier.totalAmount),
    }))
    .sort((a, b) => b.orders - a.orders);

  const recentOrders = orders.slice(0, 5).map((order) => ({
    id: order._id,
    subtotalAmount: roundMoney(order.subtotalAmount || 0),
    totalQuantity: order.totalQuantity || 0,
    createdAt: order.createdAt,
  }));

  const monthlyTrend = buildMonthlyTrend(orders, 6);

  res.status(200).json({
    success: true,
    stats: {
      locationName: location.name,
      locationCode: location.code,
      city: location.city,
      totalOrders,
      ordersThisWeek,
      totalSpend,
      totalQuantity,
      suppliers: suppliersCount,
    },
    supplierOverview,
    recentOrders,
    monthlyTrend,
  });
};

export const getOwnerLocationsStats = async (req, res) => {
  const companyId = req.user.companyId;

  const [locations, orders] = await Promise.all([
    Location.find({ companyId, isActive: true })
      .select("name code city createdAt")
      .sort({ createdAt: 1 }),
    Order.find({ companyId }).select(
      "locationId subtotalAmount totalQuantity createdAt",
    ),
  ]);

  const locationMap = new Map();

  for (const location of locations) {
    locationMap.set(String(location._id), {
      id: location._id,
      name: location.name,
      code: location.code,
      city: location.city,
      totalOrders: 0,
      totalQuantity: 0,
      totalSpend: 0,
      lastOrderAt: null,
      status: "Low",
    });
  }

  for (const order of orders) {
    const locationId = String(order.locationId);
    if (!locationMap.has(locationId)) continue;

    const entry = locationMap.get(locationId);
    entry.totalOrders += 1;
    entry.totalQuantity += order.totalQuantity || 0;
    entry.totalSpend += order.subtotalAmount || 0;

    if (
      !entry.lastOrderAt ||
      new Date(order.createdAt) > new Date(entry.lastOrderAt)
    ) {
      entry.lastOrderAt = order.createdAt;
    }
  }

  const result = Array.from(locationMap.values())
    .map((location) => ({
      ...location,
      totalSpend: roundMoney(location.totalSpend),
      status:
        location.totalOrders >= 10
          ? "Strong"
          : location.totalOrders >= 5
            ? "Stable"
            : location.totalOrders > 0
              ? "Low"
              : "Inactive",
    }))
    .sort((a, b) => b.totalSpend - a.totalSpend);

  res.status(200).json({
    success: true,
    count: result.length,
    locations: result,
  });
};

export const getOwnerSuppliersStats = async (req, res) => {
  const companyId = req.user.companyId;

  const [suppliers, supplierOrders] = await Promise.all([
    Supplier.find({ companyId, isActive: true })
      .select(
        "name code email orderMethod deliveryDays minimumOrderAmount createdAt",
      )
      .sort({ createdAt: 1 }),
    SupplierOrder.find({ companyId }).select(
      "supplierId subtotalAmount totalQuantity status createdAt",
    ),
  ]);

  const supplierMap = new Map();

  for (const supplier of suppliers) {
    supplierMap.set(String(supplier._id), {
      id: supplier._id,
      name: supplier.name,
      code: supplier.code,
      email: supplier.email,
      orderMethod: supplier.orderMethod,
      deliveryDays: supplier.deliveryDays || [],
      minimumOrderAmount: supplier.minimumOrderAmount || 0,
      totalOrders: 0,
      totalQuantity: 0,
      totalAmount: 0,
      lastOrderAt: null,
      status: "Low",
    });
  }

  for (const supplierOrder of supplierOrders) {
    const supplierId = String(supplierOrder.supplierId);
    if (!supplierMap.has(supplierId)) continue;

    const entry = supplierMap.get(supplierId);
    entry.totalOrders += 1;
    entry.totalQuantity += supplierOrder.totalQuantity || 0;
    entry.totalAmount += supplierOrder.subtotalAmount || 0;

    if (
      !entry.lastOrderAt ||
      new Date(supplierOrder.createdAt) > new Date(entry.lastOrderAt)
    ) {
      entry.lastOrderAt = supplierOrder.createdAt;
    }
  }

  const result = Array.from(supplierMap.values())
    .map((supplier) => ({
      ...supplier,
      totalAmount: roundMoney(supplier.totalAmount),
      minimumOrderAmount: roundMoney(supplier.minimumOrderAmount),
      status:
        supplier.totalOrders >= 10
          ? "Strong"
          : supplier.totalOrders >= 5
            ? "Stable"
            : supplier.totalOrders > 0
              ? "Low"
              : "Inactive",
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount);

  res.status(200).json({
    success: true,
    count: result.length,
    suppliers: result,
  });
};
