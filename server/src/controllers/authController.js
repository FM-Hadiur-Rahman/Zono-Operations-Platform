import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email })
    .populate("companyId", "name slug")
    .populate("locationId", "name code city");

  if (!user) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error("User account is inactive");
  }

  user.lastLoginAt = new Date();
  await user.save();

  res.status(200).json({
    success: true,
    message: "Login successful",
    token: generateToken(user._id),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.companyId,
      location: user.locationId,
      lastLoginAt: user.lastLoginAt,
    },
  });
};

export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};
