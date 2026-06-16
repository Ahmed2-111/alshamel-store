import { Router } from "express";
import asyncHandler from "express-async-handler";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import { adminOnly, protect } from "../middleware/auth.js";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const categories = await Category.find({ isActive: true }).lean();
    const counts = await Product.aggregate([{ $match: { isActive: true } }, { $group: { _id: "$category", count: { $sum: 1 } } }]);
    res.json(categories.map((category) => ({ ...category, productCount: counts.find((x) => String(x._id) === String(category._id))?.count || 0 })));
  })
);

router.post("/", protect, adminOnly, asyncHandler(async (req, res) => res.status(201).json(await Category.create(req.body))));
router.put("/:id", protect, adminOnly, asyncHandler(async (req, res) => res.json(await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }))));
router.delete("/:id", protect, adminOnly, asyncHandler(async (req, res) => {
  if (await Product.exists({ category: req.params.id })) {
    res.status(400);
    throw new Error("لا يمكن حذف تصنيف يحتوي على منتجات");
  }
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: "تم حذف التصنيف" });
}));

export default router;
