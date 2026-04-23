import Company from "../models/Company.js";
import User from "../models/User.js";
import Location from "../models/Location.js";

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export const createCompany = async (req, res) => {
  const {
    companyName,
    slug,
    contactEmail,
    country = "Germany",
    ownerName,
    ownerEmail,
    ownerPassword,
    firstLocation,
  } = req.body;

  if (
    !companyName ||
    !contactEmail ||
    !ownerName ||
    !ownerEmail ||
    !ownerPassword
  ) {
    res.status(400);
    throw new Error("Company and owner fields are required");
  }

  const companySlug = slug ? slugify(slug) : slugify(companyName);

  const existingCompany = await Company.findOne({ slug: companySlug });
  if (existingCompany) {
    res.status(400);
    throw new Error("Company slug already exists");
  }

  const existingOwner = await User.findOne({ email: ownerEmail.toLowerCase() });
  if (existingOwner) {
    res.status(400);
    throw new Error("Owner email already exists");
  }

  const company = await Company.create({
    name: companyName,
    slug: companySlug,
    contactEmail,
    country,
  });

  let createdLocation = null;

  if (firstLocation?.name && firstLocation?.code) {
    createdLocation = await Location.create({
      companyId: company._id,
      name: firstLocation.name,
      code: firstLocation.code,
      addressLine1: firstLocation.addressLine1 || "",
      addressLine2: firstLocation.addressLine2 || "",
      city: firstLocation.city || "",
      postalCode: firstLocation.postalCode || "",
      country: firstLocation.country || country,
      deliveryNotes: firstLocation.deliveryNotes || "",
      isActive: true,
    });
  }

  const owner = await User.create({
    companyId: company._id,
    name: ownerName,
    email: ownerEmail.toLowerCase(),
    password: ownerPassword,
    role: "owner",
  });

  res.status(201).json({
    success: true,
    message: "Company created successfully",
    data: {
      company: {
        id: company._id,
        name: company.name,
        slug: company.slug,
        contactEmail: company.contactEmail,
        country: company.country,
      },
      owner: {
        id: owner._id,
        name: owner.name,
        email: owner.email,
        role: owner.role,
      },
      location: createdLocation
        ? {
            id: createdLocation._id,
            name: createdLocation.name,
            code: createdLocation.code,
            city: createdLocation.city,
          }
        : null,
    },
  });
};

export const getCompanies = async (req, res) => {
  const companies = await Company.find({})
    .select("name slug contactEmail country isActive createdAt")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: companies.length,
    companies,
  });
};

export const getCompanyById = async (req, res) => {
  const { id } = req.params;

  const company = await Company.findById(id).select(
    "name slug contactEmail country isActive createdAt",
  );

  if (!company) {
    res.status(404);
    throw new Error("Company not found");
  }

  const owners = await User.find({ companyId: company._id, role: "owner" })
    .select("name email isActive createdAt")
    .sort({ createdAt: -1 });

  const locations = await Location.find({ companyId: company._id })
    .select("name code city country isActive createdAt")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    company,
    owners,
    locations,
  });
};

export const toggleCompanyStatus = async (req, res) => {
  const { id } = req.params;

  const company = await Company.findById(id);

  if (!company) {
    res.status(404);
    throw new Error("Company not found");
  }

  company.isActive = !company.isActive;
  await company.save();

  res.status(200).json({
    success: true,
    message: `Company ${company.isActive ? "activated" : "deactivated"} successfully`,
    company: {
      id: company._id,
      name: company.name,
      isActive: company.isActive,
    },
  });
};
