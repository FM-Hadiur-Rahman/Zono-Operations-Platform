import User from "../models/User.js";

export const createPlatformAdmin = async (req, res) => {
  const existingPlatformAdmin = await User.findOne({
    email: "admin@zono.app",
  });

  if (existingPlatformAdmin) {
    return res.status(200).json({
      success: true,
      message: "Platform admin already exists",
      platformAdmin: {
        id: existingPlatformAdmin._id,
        email: existingPlatformAdmin.email,
        role: existingPlatformAdmin.role,
      },
    });
  }

  const platformAdmin = await User.create({
    name: "Zono Admin",
    email: "admin@zono.app",
    password: "password123",
    role: "platform_admin",
  });

  res.status(201).json({
    success: true,
    message: "Platform admin created successfully",
    platformAdmin: {
      id: platformAdmin._id,
      email: platformAdmin.email,
      role: platformAdmin.role,
    },
  });
};
