import { Router } from "express";
import asyncHandler from "express-async-handler";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);

router.get("/", asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  res.json(cart || { user: req.user._id, items: [] });
}));

router.put("/", asyncHandler(async (req, res) => {
  for (const item of req.body.items || []) {
    const product = await Product.findById(item.product);
    if (!product || item.quantity > product.stock) {
      res.status(400);
      throw new Error("توجد كمية غير متاحة في السلة");
    }
  }
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    { items: req.body.items || [] },
    { upsert: true, new: true, runValidators: true }
  ).populate("items.product");
  res.json(cart);
}));

router.delete("/", asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] }, { upsert: true });
  res.json({ message: "تم إفراغ السلة" });
}));

export default router;
