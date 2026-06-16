import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        name: String,
        image: String,
        price: Number,
        salePrice: Number,
        sku: String,
        quantity: { type: Number, min: 1 }
      }
    ],
    shippingAddress: {
      name: String,
      phone: String,
      country: String,
      city: String,
      street: String,
      details: String
    },
    country: { type: String, default: "YE" },
    currency: { type: String, default: "YER" },
    coupon: {
      code: String,
      discount: { type: Number, default: 0 }
    },
    subtotal: { type: Number, required: true },
    discountTotal: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["cod", "paypal", "jaib", "floosk", "kuraimi", "demo_card", "cash"], default: "cod" },
    paymentStatus: { type: String, enum: ["unpaid", "awaiting_confirmation", "paid", "rejected", "pending", "failed"], default: "unpaid" },
    paymentProof: {
      image: String,
      transactionNumber: String,
      note: String,
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      reviewedAt: Date
    },
    status: {
      type: String,
      enum: ["new", "pending", "processing", "shipped", "delivered", "cancelled", "shipping"],
      default: "new"
    },
    statusHistory: [
      {
        status: String,
        note: String,
        date: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
