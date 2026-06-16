import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    phone: { type: String, trim: true },
    role: { type: String, enum: ["customer", "employee", "admin", "super_admin"], default: "customer" },
    isActive: { type: Boolean, default: true },
    permissions: {
      products: { type: Boolean, default: false },
      categories: { type: Boolean, default: false },
      orders: { type: Boolean, default: false },
      customers: { type: Boolean, default: false },
      marketing: { type: Boolean, default: false },
      settings: { type: Boolean, default: false },
      staff: { type: Boolean, default: false },
      reports: { type: Boolean, default: false }
    },
    country: { type: String, default: "YE" },
    currency: { type: String, default: "YER" },
    avatar: String,
    addresses: [
      {
        label: String,
        city: String,
        country: String,
        street: String,
        details: String,
        phone: String,
        isDefault: { type: Boolean, default: false }
      }
    ]
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model("User", userSchema);
