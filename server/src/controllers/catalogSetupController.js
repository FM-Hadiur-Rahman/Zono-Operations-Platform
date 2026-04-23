import Company from "../models/Company.js";
import Supplier from "../models/Supplier.js";
import Product from "../models/Product.js";

export const seedCatalogData = async (req, res) => {
  const company = await Company.findOne({ slug: "kaffee-kruemel" });

  if (!company) {
    res.status(404);
    throw new Error("Company not found. Seed base data first.");
  }

  const existingProducts = await Product.findOne({ companyId: company._id });

  if (existingProducts) {
    return res.status(200).json({
      success: true,
      message: "Catalog data already exists",
    });
  }

  const suppliers = await Supplier.insertMany([
    {
      companyId: company._id,
      name: "Dairy Supplier A",
      code: "SUP-A",
      contactPerson: "Anna Weber",
      email: "orders@supplier-a.de",
      orderMethod: "email",
      deliveryDays: ["Monday", "Wednesday", "Friday"],
    },
    {
      companyId: company._id,
      name: "Bakery Supplier B",
      code: "SUP-B",
      contactPerson: "Jonas Keller",
      email: "orders@supplier-b.de",
      orderMethod: "email",
      deliveryDays: ["Daily"],
    },
    {
      companyId: company._id,
      name: "Supplies Supplier C",
      code: "SUP-C",
      contactPerson: "Lisa Braun",
      email: "orders@supplier-c.de",
      orderMethod: "email",
      deliveryDays: ["Tuesday", "Thursday"],
    },
  ]);

  const supplierA = suppliers.find((s) => s.code === "SUP-A");
  const supplierB = suppliers.find((s) => s.code === "SUP-B");
  const supplierC = suppliers.find((s) => s.code === "SUP-C");

  const products = await Product.insertMany([
    {
      companyId: company._id,
      supplierId: supplierA._id,
      name: "Fresh Milk 1L",
      sku: "MILK-001",
      category: "Dairy",
      description: "Fresh whole milk for daily café operations",
      unit: "pcs",
      price: 1.8,
    },
    {
      companyId: company._id,
      supplierId: supplierA._id,
      name: "Butter 250g",
      sku: "BUTTER-001",
      category: "Dairy",
      description: "Premium butter for breakfast and kitchen use",
      unit: "pcs",
      price: 2.1,
    },
    {
      companyId: company._id,
      supplierId: supplierB._id,
      name: "Wholegrain Bread",
      sku: "BREAD-001",
      category: "Bakery",
      description: "Fresh bakery bread delivered for branch service",
      unit: "pcs",
      price: 2.4,
    },
    {
      companyId: company._id,
      supplierId: supplierB._id,
      name: "Croissant Butter",
      sku: "CROISSANT-001",
      category: "Bakery",
      description: "Classic butter croissant",
      unit: "pcs",
      price: 1.6,
    },
    {
      companyId: company._id,
      supplierId: supplierC._id,
      name: "Napkins Pack",
      sku: "NAPKIN-001",
      category: "Supplies",
      description: "Premium service napkins",
      unit: "pack",
      price: 3.2,
    },
    {
      companyId: company._id,
      supplierId: supplierC._id,
      name: "Paper Cups 50pcs",
      sku: "CUPS-001",
      category: "Supplies",
      description: "Takeaway hot drink paper cups",
      unit: "pack",
      price: 4.5,
    },
  ]);

  res.status(201).json({
    success: true,
    message: "Catalog seeded successfully",
    suppliersCount: suppliers.length,
    productsCount: products.length,
  });
};

export const resetCatalogData = async (req, res) => {
  const company = await Company.findOne({ slug: "kaffee-kruemel" });

  if (!company) {
    return res.status(200).json({
      success: true,
      message: "Company not found, nothing to reset",
    });
  }

  await Product.deleteMany({ companyId: company._id });
  await Supplier.deleteMany({ companyId: company._id });

  res.status(200).json({
    success: true,
    message: "Catalog data reset successfully",
  });
};
