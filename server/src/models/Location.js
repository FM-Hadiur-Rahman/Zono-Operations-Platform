import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company is required"],
    },
    name: {
      type: String,
      required: [true, "Location name is required"],
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Location code is required"],
      trim: true,
      uppercase: true,
    },
    addressLine1: {
      type: String,
      default: "",
    },
    addressLine2: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    postalCode: {
      type: String,
      default: "",
    },
    country: {
      type: String,
      default: "Germany",
    },
    deliveryNotes: {
      type: String,
      default: "",
    },
    managerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

locationSchema.index({ companyId: 1, code: 1 }, { unique: true });

const Location = mongoose.model("Location", locationSchema);

export default Location;
