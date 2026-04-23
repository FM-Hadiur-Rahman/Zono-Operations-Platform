import mongoose from "mongoose";

const supplierOrderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    unit: {
      type: String,
      default: "pcs",
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    lineTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const supplierOrderSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    parentOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },
    createdByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    supplierOrderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    items: {
      type: [supplierOrderItemSchema],
      default: [],
    },
    totalItems: {
      type: Number,
      required: true,
      default: 0,
    },
    totalQuantity: {
      type: Number,
      required: true,
      default: 0,
    },
    subtotalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    currency: {
      type: String,
      default: "EUR",
      trim: true,
      uppercase: true,
    },
    status: {
      type: String,
      enum: ["pending", "sent", "acknowledged", "completed", "cancelled"],
      default: "pending",
    },
    deliveryDate: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const SupplierOrder = mongoose.model("SupplierOrder", supplierOrderSchema);

export default SupplierOrder;
