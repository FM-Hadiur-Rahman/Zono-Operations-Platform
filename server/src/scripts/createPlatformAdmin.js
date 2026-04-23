import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const existingPlatformAdmin = await User.findOne({
    email: "admin@zono.app",
  });

  if (existingPlatformAdmin) {
    console.log("Platform admin already exists");
    process.exit(0);
  }

  const platformAdmin = await User.create({
    name: "Zono Admin",
    email: "admin@zono.app",
    password: "password123",
    role: "platform_admin",
  });

  console.log("Platform admin created:", platformAdmin.email);
  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
