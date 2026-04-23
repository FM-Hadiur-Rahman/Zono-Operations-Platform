import Location from "../models/Location.js";
import User from "../models/User.js";

export const getOwnerLocations = async (req, res) => {
  const companyId = req.user.companyId;

  const locations = await Location.find({ companyId })
    .select(
      "name code addressLine1 addressLine2 city postalCode country deliveryNotes isActive managerUserId createdAt",
    )
    .populate("managerUserId", "name email")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: locations.length,
    locations,
  });
};

export const createOwnerLocation = async (req, res) => {
  const companyId = req.user.companyId;

  const {
    name,
    code,
    addressLine1 = "",
    addressLine2 = "",
    city = "",
    postalCode = "",
    country = "Germany",
    deliveryNotes = "",
  } = req.body;

  if (!name || !code) {
    res.status(400);
    throw new Error("Location name and code are required");
  }

  const existingLocation = await Location.findOne({
    companyId,
    code: code.trim(),
  });

  if (existingLocation) {
    res.status(400);
    throw new Error("Location code already exists for this company");
  }

  const location = await Location.create({
    companyId,
    name: name.trim(),
    code: code.trim(),
    addressLine1,
    addressLine2,
    city,
    postalCode,
    country,
    deliveryNotes,
    isActive: true,
  });

  res.status(201).json({
    success: true,
    message: "Location created successfully",
    location,
  });
};

export const updateOwnerLocation = async (req, res) => {
  const companyId = req.user.companyId;
  const { id } = req.params;

  const location = await Location.findOne({ _id: id, companyId });

  if (!location) {
    res.status(404);
    throw new Error("Location not found");
  }

  const {
    name,
    code,
    addressLine1,
    addressLine2,
    city,
    postalCode,
    country,
    deliveryNotes,
    isActive,
  } = req.body;

  if (code && code !== location.code) {
    const existingCode = await Location.findOne({
      companyId,
      code: code.trim(),
      _id: { $ne: id },
    });

    if (existingCode) {
      res.status(400);
      throw new Error("Location code already exists for this company");
    }
  }

  location.name = name ?? location.name;
  location.code = code ?? location.code;
  location.addressLine1 = addressLine1 ?? location.addressLine1;
  location.addressLine2 = addressLine2 ?? location.addressLine2;
  location.city = city ?? location.city;
  location.postalCode = postalCode ?? location.postalCode;
  location.country = country ?? location.country;
  location.deliveryNotes = deliveryNotes ?? location.deliveryNotes;
  location.isActive =
    typeof isActive === "boolean" ? isActive : location.isActive;

  await location.save();

  res.status(200).json({
    success: true,
    message: "Location updated successfully",
    location,
  });
};

export const getOwnerUsers = async (req, res) => {
  const companyId = req.user.companyId;

  const users = await User.find({
    companyId,
    role: { $in: ["owner", "manager"] },
  })
    .select("name email role locationId isActive createdAt")
    .populate("locationId", "name code city")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: users.length,
    users,
  });
};

export const createOwnerManager = async (req, res) => {
  const companyId = req.user.companyId;
  const { name, email, password, locationId } = req.body;

  if (!name || !email || !password || !locationId) {
    res.status(400);
    throw new Error("Name, email, password, and location are required");
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    res.status(400);
    throw new Error("Email already exists");
  }

  const location = await Location.findOne({
    _id: locationId,
    companyId,
    isActive: true,
  });

  if (!location) {
    res.status(404);
    throw new Error("Assigned location not found");
  }

  const manager = await User.create({
    companyId,
    locationId,
    name: name.trim(),
    email: email.toLowerCase(),
    password,
    role: "manager",
  });

  if (!location.managerUserId) {
    location.managerUserId = manager._id;
    await location.save();
  }

  const createdManager = await User.findById(manager._id)
    .select("name email role locationId isActive createdAt")
    .populate("locationId", "name code city");

  res.status(201).json({
    success: true,
    message: "Manager created successfully",
    user: createdManager,
  });
};
