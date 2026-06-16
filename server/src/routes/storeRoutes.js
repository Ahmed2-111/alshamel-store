import { Router } from "express";
import asyncHandler from "express-async-handler";
import Banner from "../models/Banner.js";
import Category from "../models/Category.js";
import Coupon from "../models/Coupon.js";
import Offer from "../models/Offer.js";
import PaymentMethod from "../models/PaymentMethod.js";
import Product from "../models/Product.js";
import ShippingRate from "../models/ShippingRate.js";
import StoreSetting from "../models/StoreSetting.js";

const router = Router();

router.get(
  "/home",
  asyncHandler(async (req, res) => {
    const now = new Date();
    const activeWindow = { isActive: true, $and: [{ $or: [{ startsAt: null }, { startsAt: { $lte: now } }] }, { $or: [{ endsAt: null }, { endsAt: { $gte: now } }] }] };
    const [banners, categories, newProducts, bestSellers, deals, suggested, offers, settings, paymentMethods] = await Promise.all([
      Banner.find(activeWindow).sort("sortOrder -createdAt"),
      Category.find({ isActive: true }).sort("sortOrder name").limit(12),
      Product.find({ isActive: true, status: { $ne: "archived" } }).populate("category", "name slug").sort("-createdAt").limit(8),
      Product.find({ isActive: true }).populate("category", "name slug").sort("-sold -rating").limit(8),
      Product.find({ isActive: true, $or: [{ discountPercent: { $gt: 0 } }, { salePrice: { $gt: 0 } }] }).populate("category", "name slug").sort("-discountPercent").limit(8),
      Product.find({ isActive: true, featured: true }).populate("category", "name slug").sort("-rating").limit(8),
      Offer.find(activeWindow).limit(6),
      StoreSetting.findOne({ key: "default" }),
      PaymentMethod.find({ isActive: true }).select("-accountNumber")
    ]);
    res.json({ banners, categories, newProducts, bestSellers, deals, suggested, offers, settings, paymentMethods });
  })
);

router.get("/settings", asyncHandler(async (req, res) => res.json(await StoreSetting.findOne({ key: "default" }))));
router.get("/payment-methods", asyncHandler(async (req, res) => res.json(await PaymentMethod.find({ isActive: true }))));
router.get("/shipping-rates", asyncHandler(async (req, res) => res.json(await ShippingRate.find({ isActive: true }))));
router.post("/coupons/validate", asyncHandler(async (req, res) => {
  const coupon = await Coupon.findOne({ code: req.body.code?.toUpperCase(), isActive: true });
  const total = Number(req.body.total || 0);
  const now = new Date();
  if (!coupon || (coupon.startsAt && coupon.startsAt > now) || (coupon.endsAt && coupon.endsAt < now) || (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) || total < coupon.minOrderTotal) {
    res.status(400);
    throw new Error("الكوبون غير صالح");
  }
  const discount = coupon.discountType === "percent" ? Math.min(total * (coupon.value / 100), total) : Math.min(coupon.value, total);
  res.json({ code: coupon.code, discount, coupon });
}));

export default router;
