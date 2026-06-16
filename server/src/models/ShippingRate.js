import mongoose from "mongoose";

const shippingRateSchema = new mongoose.Schema(
  {
    country: { type: String, required: true },
    city: { type: String, default: "*" },
    currency: { type: String, default: "USD" },
    fee: { type: Number, required: true, min: 0 },
    freeAbove: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

shippingRateSchema.index({ country: 1, city: 1 }, { unique: true });

export default mongoose.model("ShippingRate", shippingRateSchema);
