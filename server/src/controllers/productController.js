import Product from "../models/Product.js";

export const getProducts = async (req, res) => {
  const { category, supplierId, search } = req.query;

  const filter = {
    companyId: req.user.companyId,
    isActive: true,
    isAvailable: true,
  };

  if (category) {
    filter.category = category;
  }

  if (supplierId) {
    filter.supplierId = supplierId;
  }

  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  const products = await Product.find(filter)
    .populate("supplierId", "name code email orderMethod")
    .sort({ category: 1, name: 1 });

  res.status(200).json({
    success: true,
    count: products.length,
    products,
  });
};
