import { Router } from "express";
import asyncHandler from "express-async-handler";
import Cart from "../models/Cart.js";
import Coupon from "../models/Coupon.js";
import Notification from "../models/Notification.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import ShippingRate from "../models/ShippingRate.js";
import { adminOnly, protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { logActivity } from "../middleware/activity.js";

const router = Router();

const paymentStatusByMethod = {
  cod: "unpaid",
  paypal: "awaiting_confirmation",
  jaib: "awaiting_confirmation",
  floosk: "awaiting_confirmation",
  kuraimi: "awaiting_confirmation",
  demo_card: "paid",
  cash: "unpaid"
};

async function calculateShipping(country, city, subtotal) {
  const rate =
    (await ShippingRate.findOne({ country, city, isActive: true })) ||
    (await ShippingRate.findOne({ country, city: "*", isActive: true }));
  if (!rate) return subtotal >= 150 ? 0 : 15;
  return rate.freeAbove && subtotal >= rate.freeAbove ? 0 : rate.fee;
}

async function calculateCoupon(code, subtotal) {
  if (!code) return { coupon: undefined, discountTotal: 0 };
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  const now = new Date();
  if (!coupon || (coupon.startsAt && coupon.startsAt > now) || (coupon.endsAt && coupon.endsAt < now) || (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) || subtotal < coupon.minOrderTotal) {
    throw Object.assign(new Error("الكوبون غير صالح"), { status: 400 });
  }
  const discountTotal = coupon.discountType === "percent" ? Math.min(subtotal * (coupon.value / 100), subtotal) : Math.min(coupon.value, subtotal);
  coupon.usedCount += 1;
  await coupon.save();
  return { coupon: { code: coupon.code, discount: discountTotal }, discountTotal };
}

router.post(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const requestedItems = req.body.items || [];
    if (!requestedItems.length) {
      res.status(400);
      throw new Error("السلة فارغة");
    }

    const products = await Product.find({ _id: { $in: requestedItems.map((x) => x.product) } });
    const items = requestedItems.map((item) => {
      const product = products.find((x) => String(x._id) === String(item.product));
      if (!product || !product.isActive || product.status === "archived") {
        throw Object.assign(new Error("أحد المنتجات غير متاح"), { status: 400 });
      }
      const price = product.salePrice || product.price;
      return { product: product._id, name: product.name, image: product.images[0], price, salePrice: product.salePrice, sku: product.sku, quantity: Number(item.quantity) };
    });

    const reserved = [];
    try {
      for (const item of items) {
        const updated = await Product.findOneAndUpdate(
          { _id: item.product, stock: { $gte: item.quantity }, isActive: true },
          { $inc: { stock: -item.quantity, sold: item.quantity } },
          { new: true }
        );
        if (!updated) throw Object.assign(new Error(`الكمية المتاحة من ${item.name} غير كافية`), { status: 400 });
        reserved.push(item);
      }

      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const { coupon, discountTotal } = await calculateCoupon(req.body.couponCode, subtotal);
      const shippingAddress = req.body.shippingAddress || {};
      const country = req.body.country || shippingAddress.country || req.user.country || "YE";
      const currency = req.body.currency || req.user.currency || "YER";
      const shippingFee = await calculateShipping(country, shippingAddress.city || "*", subtotal - discountTotal);
      const paymentMethod = req.body.paymentMethod || "cod";
      const createdOrder = await Order.create({
        user: req.user._id,
        items,
        shippingAddress,
        country,
        currency,
        coupon,
        subtotal,
        discountTotal,
        shippingFee,
        total: Math.max(subtotal - discountTotal, 0) + shippingFee,
        paymentMethod,
        paymentStatus: paymentStatusByMethod[paymentMethod] || "unpaid",
        status: "new",
        statusHistory: [{ status: "new", note: "تم إنشاء الطلب" }]
      });
      await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
      await Notification.create({ user: req.user._id, title: "تم استلام طلبك", message: `رقم الطلب ${createdOrder._id}`, type: "order" });
      res.status(201).json(createdOrder);
    } catch (error) {
      for (const item of reserved) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, sold: -item.quantity } });
      }
      throw error;
    }
  })
);

router.post(
  "/:id/payment-proof",
  protect,
  upload.single("proof"),
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order || String(order.user) !== String(req.user._id)) {
      res.status(404);
      throw new Error("الطلب غير موجود");
    }
    order.paymentProof = {
      image: req.file ? `/uploads/${req.file.filename}` : req.body.image,
      transactionNumber: req.body.transactionNumber,
      note: req.body.note
    };
    order.paymentStatus = "awaiting_confirmation";
    await order.save();
    res.json(order);
  })
);

router.patch(
  "/:id/payment",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const allowed = ["unpaid", "awaiting_confirmation", "paid", "rejected", "pending", "failed"];
    if (!allowed.includes(req.body.paymentStatus)) {
      res.status(400);
      throw new Error("حالة الدفع غير صالحة");
    }
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error("الطلب غير موجود");
    }
    order.paymentStatus = req.body.paymentStatus;
    order.paymentProof.reviewedBy = req.user._id;
    order.paymentProof.reviewedAt = new Date();
    await order.save();
    await logActivity(req, "review_payment", "order", order._id, `payment ${req.body.paymentStatus}`);
    res.json(order);
  })
);

router.get("/mine", protect, asyncHandler(async (req, res) => res.json(await Order.find({ user: req.user._id }).sort("-createdAt"))));
router.get("/", protect, adminOnly, asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
  res.json(await Order.find(filter).populate("user", "name email phone").sort("-createdAt"));
}));

router.get(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate("user", "name email phone");
    if (!order || (!["admin", "super_admin"].includes(req.user.role) && String(order.user._id) !== String(req.user._id))) {
      res.status(404);
      throw new Error("الطلب غير موجود");
    }
    res.json(order);
  })
);

router.patch(
  "/:id/status",
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const allowed = ["new", "pending", "processing", "shipped", "delivered", "cancelled", "shipping"];
    if (!allowed.includes(req.body.status)) {
      res.status(400);
      throw new Error("حالة الطلب غير صالحة");
    }
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error("الطلب غير موجود");
    }
    if (req.body.status === "cancelled" && order.status !== "cancelled") {
      for (const item of order.items) await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, sold: -item.quantity } });
    }
    order.status = req.body.status;
    order.statusHistory.push({ status: req.body.status, note: req.body.note });
    await order.save();
    await Notification.create({ user: order.user, title: "تحديث حالة الطلب", message: `حالة طلبك الآن: ${req.body.status}`, type: "order" });
    await logActivity(req, "update_order_status", "order", order._id, `status ${req.body.status}`);
    res.json(order);
  })
);

export default router;
