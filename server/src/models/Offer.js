import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["general", "products", "categories"], default: "general" },
    discountType: { type: String, enum: ["percent", "fixed"], default: "percent" },
    value: { type: Number, required: true, min: 0 },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    startsAt: Date,
    endsAt: Date,
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("Offer", offerSchema);
