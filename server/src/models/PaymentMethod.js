import mongoose from "mongoose";

const paymentMethodSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, enum: ["cod", "paypal", "wallet", "bank"], required: true },
    isActive: { type: Boolean, default: true },
    accountName: String,
    accountNumber: String,
    qrCode: String,
    instructions: String,
    translations: {
      ar: { name: String, instructions: String },
      en: { name: String, instructions: String }
    }
  },
  { timestamps: true }
);

export default mongoose.model("PaymentMethod", paymentMethodSchema);
