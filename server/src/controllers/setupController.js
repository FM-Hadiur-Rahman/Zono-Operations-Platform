import Company from "../models/Company.js";
import User from "../models/User.js";
import Location from "../models/Location.js";
import Supplier from "../models/Supplier.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import SupplierOrder from "../models/SupplierOrder.js";

const createCompanyBundle = async ({
  name,
  slug,
  contactEmail,
  country = "Germany",
  locations,
  owner,
  managers,
}) => {
  const company = await Company.create({
    name,
    slug,
    contactEmail,
    country,
  });

  const createdLocations = [];
  const createdManagers = [];

  for (let i = 0; i < locations.length; i += 1) {
    const locationData = locations[i];

    const location = await Location.create({
      companyId: company._id,
      name: locationData.name,
      code: locationData.code,
      addressLine1: locationData.addressLine1,
      city: locationData.city,
      postalCode: locationData.postalCode,
      country,
      deliveryNotes: locationData.deliveryNotes || "Morning delivery preferred",
    });

    createdLocations.push(location);
  }

  const ownerUser = await User.create({
    companyId: company._id,
    name: owner.name,
    email: owner.email,
    password: owner.password,
    role: "owner",
  });

  for (let i = 0; i < managers.length; i += 1) {
    const managerData = managers[i];
    const location = createdLocations[i];

    const manager = await User.create({
      companyId: company._id,
      locationId: location._id,
      name: managerData.name,
      email: managerData.email,
      password: managerData.password,
      role: "manager",
    });

    location.managerUserId = manager._id;
    await location.save();

    createdManagers.push(manager);
  }

  const supplierA = await Supplier.create({
    companyId: company._id,
    name: `${name} Dairy Supplier`,
    code: `${slug.toUpperCase().slice(0, 3)}-SUP-A`,
    email: `orders-dairy@${slug}.demo`,
    orderMethod: "email",
    deliveryDays: ["Monday", "Wednesday", "Friday"],
    minimumOrderAmount: 20,
    isActive: true,
  });

  const supplierB = await Supplier.create({
    companyId: company._id,
    name: `${name} Bakery Supplier`,
    code: `${slug.toUpperCase().slice(0, 3)}-SUP-B`,
    email: `orders-bakery@${slug}.demo`,
    orderMethod: "email",
    deliveryDays: ["Tuesday", "Thursday", "Saturday"],
    minimumOrderAmount: 15,
    isActive: true,
  });

  const supplierC = await Supplier.create({
    companyId: company._id,
    name: `${name} Supplies Supplier`,
    code: `${slug.toUpperCase().slice(0, 3)}-SUP-C`,
    email: `orders-supplies@${slug}.demo`,
    orderMethod: "email",
    deliveryDays: ["Monday", "Thursday"],
    minimumOrderAmount: 25,
    isActive: true,
  });

  const products = await Product.insertMany([
    {
      companyId: company._id,
      supplierId: supplierA._id,
      name: "Fresh Milk 1L",
      sku: `${slug.toUpperCase()}-MILK-001`,
      category: "Dairy",
      description: "Fresh whole milk for daily café operations",
      unit: "pcs",
      price: 1.8,
      currency: "EUR",
      isAvailable: true,
      isActive: true,
    },
    {
      companyId: company._id,
      supplierId: supplierA._id,
      name: "Butter 250g",
      sku: `${slug.toUpperCase()}-BUTTER-001`,
      category: "Dairy",
      description: "Premium butter for breakfast and kitchen use",
      unit: "pcs",
      price: 2.1,
      currency: "EUR",
      isAvailable: true,
      isActive: true,
    },
    {
      companyId: company._id,
      supplierId: supplierB._id,
      name: "Croissant Butter",
      sku: `${slug.toUpperCase()}-CROISSANT-001`,
      category: "Bakery",
      description: "Classic butter croissant",
      unit: "pcs",
      price: 1.6,
      currency: "EUR",
      isAvailable: true,
      isActive: true,
    },
    {
      companyId: company._id,
      supplierId: supplierB._id,
      name: "Baguette",
      sku: `${slug.toUpperCase()}-BAGUETTE-001`,
      category: "Bakery",
      description: "Fresh baguette for sandwiches and service",
      unit: "pcs",
      price: 1.9,
      currency: "EUR",
      isAvailable: true,
      isActive: true,
    },
    {
      companyId: company._id,
      supplierId: supplierC._id,
      name: "Napkins Pack",
      sku: `${slug.toUpperCase()}-NAPKIN-001`,
      category: "Supplies",
      description: "Disposable napkins for front-of-house use",
      unit: "pcs",
      price: 3.2,
      currency: "EUR",
      isAvailable: true,
      isActive: true,
    },
    {
      companyId: company._id,
      supplierId: supplierC._id,
      name: "Cleaning Gloves",
      sku: `${slug.toUpperCase()}-GLOVE-001`,
      category: "Supplies",
      description: "Protective gloves for daily café cleaning routines",
      unit: "pcs",
      price: 4.5,
      currency: "EUR",
      isAvailable: true,
      isActive: true,
    },
  ]);

  return {
    company,
    locations: createdLocations,
    owner: ownerUser,
    managers: createdManagers,
    suppliers: [supplierA, supplierB, supplierC],
    productsCount: products.length,
  };
};

export const seedInitialData = async (req, res) => {
  const existingCompanies = await Company.find({
    slug: { $in: ["kaffee-kruemel", "backwerk", "mr-baker"] },
  });

  if (existingCompanies.length > 0) {
    return res.status(200).json({
      success: true,
      message: "Demo seed data already exists",
      companies: existingCompanies.map((company) => ({
        id: company._id,
        name: company.name,
        slug: company.slug,
      })),
    });
  }

  const kaffeeKruemel = await createCompanyBundle({
    name: "Kaffee Krümel",
    slug: "kaffee-kruemel",
    contactEmail: "info@kaffeekruemel.de",
    locations: [
      {
        name: "Düsseldorf Central",
        code: "DUS-01",
        addressLine1: "Sample Street 10",
        city: "Düsseldorf",
        postalCode: "40210",
      },
      {
        name: "Berlin Mitte",
        code: "BER-01",
        addressLine1: "Alexanderplatz 5",
        city: "Berlin",
        postalCode: "10178",
      },
      {
        name: "Cologne West",
        code: "CGN-01",
        addressLine1: "Aachener Straße 22",
        city: "Cologne",
        postalCode: "50674",
      },
    ],
    owner: {
      name: "Owner User",
      email: "owner@kaffeekruemel.de",
      password: "password123",
    },
    managers: [
      {
        name: "Düsseldorf Manager",
        email: "manager.duesseldorf@kaffeekruemel.de",
        password: "password123",
      },
      {
        name: "Berlin Manager",
        email: "manager.berlin@kaffeekruemel.de",
        password: "password123",
      },
      {
        name: "Cologne Manager",
        email: "manager.cologne@kaffeekruemel.de",
        password: "password123",
      },
    ],
  });

  const backWerk = await createCompanyBundle({
    name: "BackWerk",
    slug: "backwerk",
    contactEmail: "info@backwerk.de",
    locations: [
      {
        name: "Essen Branch",
        code: "ESS-01",
        addressLine1: "Limbecker Platz 8",
        city: "Essen",
        postalCode: "45127",
      },
      {
        name: "Dortmund Branch",
        code: "DTM-01",
        addressLine1: "Westenhellweg 44",
        city: "Dortmund",
        postalCode: "44137",
      },
      {
        name: "Bochum Branch",
        code: "BOC-01",
        addressLine1: "Kortumstraße 19",
        city: "Bochum",
        postalCode: "44787",
      },
    ],
    owner: {
      name: "BackWerk Owner",
      email: "owner@backwerk.de",
      password: "password123",
    },
    managers: [
      {
        name: "Essen Manager",
        email: "manager.essen@backwerk.de",
        password: "password123",
      },
      {
        name: "Dortmund Manager",
        email: "manager.dortmund@backwerk.de",
        password: "password123",
      },
      {
        name: "Bochum Manager",
        email: "manager.bochum@backwerk.de",
        password: "password123",
      },
    ],
  });

  const mrBaker = await createCompanyBundle({
    name: "Mr. Baker",
    slug: "mr-baker",
    contactEmail: "info@mrbaker.de",
    locations: [
      {
        name: "Mülheim Branch",
        code: "MUL-01",
        addressLine1: "Leineweberstraße 14",
        city: "Mülheim an der Ruhr",
        postalCode: "45468",
      },
      {
        name: "Duisburg Branch",
        code: "DUI-01",
        addressLine1: "Königstraße 31",
        city: "Duisburg",
        postalCode: "47051",
      },
      {
        name: "Oberhausen Branch",
        code: "OB-01",
        addressLine1: "Marktstraße 72",
        city: "Oberhausen",
        postalCode: "46045",
      },
    ],
    owner: {
      name: "Mr. Baker Owner",
      email: "owner@mrbaker.de",
      password: "password123",
    },
    managers: [
      {
        name: "Mülheim Manager",
        email: "manager.muelheim@mrbaker.de",
        password: "password123",
      },
      {
        name: "Duisburg Manager",
        email: "manager.duisburg@mrbaker.de",
        password: "password123",
      },
      {
        name: "Oberhausen Manager",
        email: "manager.oberhausen@mrbaker.de",
        password: "password123",
      },
    ],
  });

  res.status(201).json({
    success: true,
    message: "Demo multi-company seed data created successfully",
    data: {
      companies: [
        {
          id: kaffeeKruemel.company._id,
          name: kaffeeKruemel.company.name,
          slug: kaffeeKruemel.company.slug,
          owner: kaffeeKruemel.owner.email,
          managers: kaffeeKruemel.managers.map((m) => m.email),
          locations: kaffeeKruemel.locations.map((l) => l.name),
          suppliers: kaffeeKruemel.suppliers.map((s) => s.name),
          productsCount: kaffeeKruemel.productsCount,
        },
        {
          id: backWerk.company._id,
          name: backWerk.company.name,
          slug: backWerk.company.slug,
          owner: backWerk.owner.email,
          managers: backWerk.managers.map((m) => m.email),
          locations: backWerk.locations.map((l) => l.name),
          suppliers: backWerk.suppliers.map((s) => s.name),
          productsCount: backWerk.productsCount,
        },
        {
          id: mrBaker.company._id,
          name: mrBaker.company.name,
          slug: mrBaker.company.slug,
          owner: mrBaker.owner.email,
          managers: mrBaker.managers.map((m) => m.email),
          locations: mrBaker.locations.map((l) => l.name),
          suppliers: mrBaker.suppliers.map((s) => s.name),
          productsCount: mrBaker.productsCount,
        },
      ],
    },
  });
};

export const resetSeedData = async (req, res) => {
  const companies = await Company.find({
    slug: { $in: ["kaffee-kruemel", "backwerk", "mr-baker"] },
  });

  if (!companies.length) {
    return res.status(200).json({
      success: true,
      message: "No demo seed data found to reset",
    });
  }

  const companyIds = companies.map((company) => company._id);

  await SupplierOrder.deleteMany({ companyId: { $in: companyIds } });
  await Order.deleteMany({ companyId: { $in: companyIds } });
  await Product.deleteMany({ companyId: { $in: companyIds } });
  await Supplier.deleteMany({ companyId: { $in: companyIds } });
  await User.deleteMany({ companyId: { $in: companyIds } });
  await Location.deleteMany({ companyId: { $in: companyIds } });
  await Company.deleteMany({ _id: { $in: companyIds } });

  res.status(200).json({
    success: true,
    message: "Demo seed data reset successfully",
  });
};
