import { Router } from "express";
import asyncHandler from "express-async-handler";
import Banner from "../models/Banner.js";
import Coupon from "../models/Coupon.js";
import Offer from "../models/Offer.js";
import PaymentMethod from "../models/PaymentMethod.js";
import ShippingRate from "../models/ShippingRate.js";
import StoreSetting from "../models/StoreSetting.js";
import ActivityLog from "../models/ActivityLog.js";
import { can, protect, staffOnly } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { logActivity } from "../middleware/activity.js";

const router = Router();
router.use(protect, staffOnly);

function crud(model, entity, permission) {
  const r = Router();
  r.get("/", can(permission), asyncHandler(async (req, res) => res.json(await model.find().sort("-createdAt"))));
  r.post("/", can(permission), asyncHandler(async (req, res) => {
    const item = await model.create(req.body);
    await logActivity(req, `create_${entity}`, entity, item._id, `created ${entity}`);
    res.status(201).json(item);
  }));
  r.put("/:id", can(permission), asyncHandler(async (req, res) => {
    const item = await model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    await logActivity(req, `update_${entity}`, entity, req.params.id, `updated ${entity}`);
    res.json(item);
  }));
  r.delete("/:id", can(permission), asyncHandler(async (req, res) => {
    await model.findByIdAndDelete(req.params.id);
    await logActivity(req, `delete_${entity}`, entity, req.params.id, `deleted ${entity}`);
    res.json({ message: "تم الحذف بنجاح" });
  }));
  return r;
}

router.use("/banners", crud(Banner, "banner", "marketing"));
router.use("/offers", crud(Offer, "offer", "marketing"));
router.use("/coupons", crud(Coupon, "coupon", "marketing"));
router.use("/shipping", crud(ShippingRate, "shipping_rate", "settings"));
router.use("/payment-methods", crud(PaymentMethod, "payment_method", "settings"));

router.post("/uploads", can("settings"), upload.array("files", 8), (req, res) => {
  res.status(201).json({ files: req.files.map((file) => `/uploads/${file.filename}`) });
});

router.get("/settings", can("settings"), asyncHandler(async (req, res) => {
  res.json(await StoreSetting.findOneAndUpdate({ key: "default" }, {}, { upsert: true, new: true, setDefaultsOnInsert: true }));
}));

router.put("/settings", can("settings"), asyncHandler(async (req, res) => {
  const settings = await StoreSetting.findOneAndUpdate({ key: "default" }, req.body, { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true });
  await logActivity(req, "update_settings", "settings", settings._id, "updated store settings");
  res.json(settings);
}));

router.get("/activity", can("reports"), asyncHandler(async (req, res) => res.json(await ActivityLog.find().populate("actor", "name email role").sort("-createdAt").limit(200))));

export default router;
