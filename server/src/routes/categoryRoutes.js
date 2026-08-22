import { Router } from "express";
import asyncHandler from "express-async-handler";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import { adminOnly, protect } from "../middleware/auth.js";

const router = Router();

const defaultCategories = [
  { name: "أظافر اصطناعية", translations: { en: { name: "Artificial Nails" } }, slug: "artificial-nails", sortOrder: 1, image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=900&q=85" },
  { name: "مستحضرات تجميل", translations: { en: { name: "Makeup" } }, slug: "makeup", sortOrder: 2, image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=85" },
  { name: "عطور", translations: { en: { name: "Perfumes" } }, slug: "perfumes", sortOrder: 3, image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=85" },
  { name: "حقائب", translations: { en: { name: "Bags" } }, slug: "bags", sortOrder: 4, image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=85" },
  { name: "نظارات", translations: { en: { name: "Eyewear" } }, slug: "eyewear", sortOrder: 5, image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=85" },
  { name: "إكسسوارات", translations: { en: { name: "Accessories" } }, slug: "accessories", sortOrder: 6, image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=85" },
  { name: "منتجات عناية", translations: { en: { name: "Care Products" } }, slug: "care-products", sortOrder: 7, image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=85" },
  { name: "هدايا", translations: { en: { name: "Gifts" } }, slug: "gifts", sortOrder: 8, image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=900&q=85" }
];

function slugify(value = "") {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

async function ensureDefaultCategories() {
  await Promise.all(defaultCategories.map((category) => Category.updateOne(
    { slug: category.slug },
    { $setOnInsert: category },
    { upsert: true }
  )));
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    await ensureDefaultCategories();
    const categories = await Category.find({ isActive: true }).lean();
    const counts = await Product.aggregate([{ $match: { isActive: true } }, { $group: { _id: "$category", count: { $sum: 1 } } }]);
    res.json(categories.map((category) => ({ ...category, productCount: counts.find((x) => String(x._id) === String(category._id))?.count || 0 })));
  })
);

router.post("/", protect, adminOnly, asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (!payload.slug && payload.name) payload.slug = slugify(payload.name);
  res.status(201).json(await Category.create(payload));
}));
router.put("/:id", protect, adminOnly, asyncHandler(async (req, res) => res.json(await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }))));
router.delete("/:id", protect, adminOnly, asyncHandler(async (req, res) => {
  if (await Product.exists({ category: req.params.id })) {
    await Category.findByIdAndUpdate(req.params.id, { isActive: false });
    return res.json({ message: "تم إخفاء التصنيف لأنه يحتوي على منتجات" });
  }
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: "تم حذف التصنيف" });
}));

export default router;
