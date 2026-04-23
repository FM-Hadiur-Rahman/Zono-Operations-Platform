import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id)
        .select("-password")
        .populate("companyId", "name slug")
        .populate("locationId", "name code city");

      if (!user) {
        res.status(401);
        throw new Error("User not found");
      }

      req.user = {
        ...user.toObject(),
        companyId: user.companyId?._id || user.companyId || null,
        locationId: user.locationId?._id || user.locationId || null,
        company: user.companyId
          ? {
              _id: user.companyId._id,
              name: user.companyId.name,
              slug: user.companyId.slug,
            }
          : null,
        location: user.locationId
          ? {
              _id: user.locationId._id,
              name: user.locationId.name,
              code: user.locationId.code,
              city: user.locationId.city,
            }
          : null,
      };

      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, invalid token");
    }
  } else {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized");
    }

    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error("Access denied");
    }

    next();
  };
};
