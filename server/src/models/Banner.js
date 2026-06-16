import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: String,
    image: { type: String, required: true },
    link: String,
    placement: { type: String, enum: ["hero", "home", "category", "checkout"], default: "home" },
    isActive: { type: Boolean, default: true },
    startsAt: Date,
    endsAt: Date,
    sortOrder: { type: Number, default: 0 },
    translations: {
      ar: { title: String, subtitle: String },
      en: { title: String, subtitle: String }
    }
  },
  { timestamps: true }
);

export default mongoose.model("Banner", bannerSchema);
