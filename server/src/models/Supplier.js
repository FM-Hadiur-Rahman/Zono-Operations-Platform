import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company is required"],
    },
    name: {
      type: String,
      required: [true, "Supplier name is required"],
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Supplier code is required"],
      trim: true,
      uppercase: true,
    },
    contactPerson: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    orderMethod: {
      type: String,
      enum: ["email", "whatsapp", "manual"],
      default: "email",
    },
    deliveryDays: {
      type: [String],
      default: [],
    },
    minimumOrderAmount: {
      type: Number,
      default: 0,
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

supplierSchema.index({ companyId: 1, code: 1 }, { unique: true });

const Supplier = mongoose.model("Supplier", supplierSchema);

export default Supplier;
