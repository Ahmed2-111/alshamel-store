import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    translations: {
      ar: { name: String, description: String, shortDescription: String },
      en: { name: String, description: String, shortDescription: String }
    },
    shortDescription: String,
    brand: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    salePrice: { type: Number, min: 0 },
    discountPercent: { type: Number, min: 0, max: 100, default: 0 },
    compareAtPrice: { type: Number, min: 0 },
    images: [{ type: String, required: true }],
    video: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    lowStockThreshold: { type: Number, default: 5, min: 0 },
    sku: { type: String, unique: true, sparse: true },
    colors: [String],
    sizes: [String],
    weight: { type: Number, min: 0 },
    status: { type: String, enum: ["active", "draft", "archived", "out_of_stock"], default: "active" },
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    sold: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text", shortDescription: "text" });

productSchema.virtual("inStock").get(function () {
  return this.stock > 0;
});

productSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Product", productSchema);
