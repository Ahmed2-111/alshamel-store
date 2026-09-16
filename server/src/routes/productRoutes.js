import { Router } from "express";
import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";
import Review from "../models/Review.js";
import { adminOnly, protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { logActivity } from "../middleware/activity.js";

const router = Router();

function slugify(value = "") {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

function uploadedFileUrl(req, filename) {
  const baseUrl = process.env.PUBLIC_API_URL || `${req.protocol}://${req.get("host")}`;
  return `${baseUrl.replace(/\/$/, "")}/uploads/${filename}`;
}

function cleanOptionalFields(data) {
  ["sku", "brand", "video", "slug"].forEach((key) => {
    if (typeof data[key] === "string" && !data[key].trim()) delete data[key];
  });
  return data;
}

async function uniqueSlug(value, ignoredProductId) {
  const base = slugify(value) || `product-${Date.now()}`;
  let candidate = base;
  let index = 2;
  while (await Product.exists({ slug: candidate, ...(ignoredProductId ? { _id: { $ne: ignoredProductId } } : {}) })) {
    candidate = `${base}-${index}`;
    index += 1;
  }
  return candidate;
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 12, 50);
    const filter = { isActive: true };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.featured) filter.featured = true;
    if (req.query.search) filter.$text = { $search: req.query.search };
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }
    const sortMap = { newest: "-createdAt", priceAsc: "price", priceDesc: "-price", popular: "-sold" };
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name slug")
        .sort(sortMap[req.query.sort] || "-createdAt")
        .skip((page - 1) * limit)
        .limit(limit),
      Product.countDocuments(filter)
    ]);
    res.json({ products, page, pages: Math.ceil(total / limit), total });
  })
);

router.get(
  "/admin/all",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const products = await Product.find().populate("category", "name").sort("-createdAt");
    res.json(products);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const query = req.params.id.match(/^[0-9a-fA-F]{24}$/) ? { _id: req.params.id } : { slug: req.params.id };
    const product = await Product.findOne(query).populate("category", "name slug");
    if (!product) {
      res.status(404);
      throw new Error("المنتج غير موجود");
    }
    const reviews = await Review.find({ product: product._id, isApproved: true })
      .populate("user", "name")
      .sort("-createdAt");
    res.json({ product, reviews });
  })
);

router.post(
  "/",
  protect,
  adminOnly,
  upload.array("images", 6),
  asyncHandler(async (req, res) => {
    const body = cleanOptionalFields({ ...req.body });
    const uploaded = req.files?.map((file) => uploadedFileUrl(req, file.filename)) || [];
    const bodyImages = Array.isArray(body.images) ? body.images : typeof body.images === "string" ? body.images.split(",").map((x) => x.trim()).filter(Boolean) : [];
    const images = uploaded.length ? uploaded.filter((file) => !file.match(/\.(mp4|mov|webm|avi)$/i)) : bodyImages;
    const finalImages = images.length ? images : ["/brand/store-interior.jpg"];
    const video = uploaded.find((file) => file.match(/\.(mp4|mov|webm|avi)$/i)) || body.video;
    const slug = await uniqueSlug(body.slug || body.name);
    const product = await Product.create({
      ...body,
      slug,
      colors: typeof body.colors === "string" ? body.colors.split(",").map((x) => x.trim()).filter(Boolean) : body.colors,
      sizes: typeof body.sizes === "string" ? body.sizes.split(",").map((x) => x.trim()).filter(Boolean) : body.sizes,
      images: finalImages,
      video
    });
    await logActivity(req, "create_product", "product", product._id, `created ${product.name}`);
    res.status(201).json(product);
  })
);

router.put(
  "/:id",
  protect,
  adminOnly,
  upload.array("images", 6),
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error("المنتج غير موجود");
    }
    const data = cleanOptionalFields({ ...req.body });
    if (req.files?.length) {
      const uploaded = req.files.map((file) => uploadedFileUrl(req, file.filename));
      const video = uploaded.find((file) => file.match(/\.(mp4|mov|webm|avi)$/i));
      data.images = uploaded.filter((file) => !file.match(/\.(mp4|mov|webm|avi)$/i));
      if (video) data.video = video;
    }
    if (typeof data.colors === "string") data.colors = data.colors.split(",").map((x) => x.trim());
    if (typeof data.sizes === "string") data.sizes = data.sizes.split(",").map((x) => x.trim());
    if (data.slug) data.slug = await uniqueSlug(data.slug, product._id);
    Object.assign(product, data);
    await product.save();
    await logActivity(req, "update_product", "product", product._id, `updated ${product.name}`);
    res.json(product);
  })
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error("المنتج غير موجود");
    }
    await logActivity(req, "delete_product", "product", product._id, `deleted ${product.name}`);
    res.json({ message: "تم حذف المنتج" });
  })
);

router.post(
  "/:id/reviews",
  protect,
  asyncHandler(async (req, res) => {
    const review = await Review.findOneAndUpdate(
      { product: req.params.id, user: req.user._id },
      { rating: req.body.rating, comment: req.body.comment },
      { upsert: true, new: true, runValidators: true }
    );
    const stats = await Review.aggregate([
      { $match: { product: review.product, isApproved: true } },
      { $group: { _id: "$product", rating: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);
    await Product.findByIdAndUpdate(req.params.id, {
      rating: stats[0]?.rating || 0,
      reviewCount: stats[0]?.count || 0
    });
    res.status(201).json(review);
  })
);

export default router;
