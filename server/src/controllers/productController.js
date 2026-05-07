import Product from "../models/Product.js";

export const getProducts = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch products",
    });
  }
};

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      unit,
      unitPrice,
      supplierId,
      sku,
      isAvailable,
    } = req.body;

    const product = await Product.create({
      companyId: req.user.companyId,
      name,
      description,
      category,
      unit,
      unitPrice,
      supplierId,
      sku,
      isAvailable: isAvailable ?? true,
      image: req.file
        ? {
            url: req.file.path,
            publicId: req.file.filename,
          }
        : {
            url: "",
            publicId: "",
          },
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create product",
    });
  }
};
