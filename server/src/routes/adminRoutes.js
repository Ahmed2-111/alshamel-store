import { Router } from "express";
import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import ActivityLog from "../models/ActivityLog.js";
import { logActivity } from "../middleware/activity.js";
import { adminOnly, protect } from "../middleware/auth.js";

const router = Router();
router.use(protect, adminOnly);

router.get(
  "/dashboard",
  asyncHandler(async (req, res) => {
    const [sales, orders, customers, products, lowStock, monthlySales, recentOrders] = await Promise.all([
      Order.aggregate([{ $match: { paymentStatus: "paid", status: { $ne: "cancelled" } } }, { $group: { _id: null, total: { $sum: "$total" } } }]),
      Order.countDocuments(),
      User.countDocuments({ role: "customer", isActive: true }),
      Product.countDocuments(),
      Product.find({ $expr: { $lte: ["$stock", "$lowStockThreshold"] } }).select("name stock lowStockThreshold images").limit(8),
      Order.aggregate([
        { $match: { paymentStatus: "paid", status: { $ne: "cancelled" }, createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 5)) } } },
        { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, sales: { $sum: "$total" }, orders: { $sum: 1 } } },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]),
      Order.find().populate("user", "name").sort("-createdAt").limit(5)
    ]);
    res.json({ totalSales: sales[0]?.total || 0, orderCount: orders, customerCount: customers, productCount: products, lowStock, monthlySales, recentOrders });
  })
);

router.get("/users", asyncHandler(async (req, res) => res.json(await User.find().sort("-createdAt"))));
router.post("/users", asyncHandler(async (req, res) => {
  const user = await User.create(req.body);
  await logActivity(req, "create_staff", "user", user._id, `created ${user.role}`);
  res.status(201).json(user);
}));
router.patch("/users/:id/role", asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role, permissions: req.body.permissions }, { new: true, runValidators: true });
  await logActivity(req, "update_user_role", "user", user._id, `updated role to ${user.role}`);
  res.json(user);
}));
router.patch("/users/:id/status", asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: req.body.isActive }, { new: true, runValidators: true });
  await logActivity(req, "update_user_status", "user", user._id, user.isActive ? "activated user" : "blocked user");
  res.json(user);
}));
router.get("/users/:id/orders", asyncHandler(async (req, res) => res.json(await Order.find({ user: req.params.id }).sort("-createdAt"))));
router.delete("/users/:id", asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  await logActivity(req, "delete_user", "user", req.params.id, `deleted ${user?.role || "user"}`);
  res.json({ message: "تم حذف المستخدم" });
}));
router.get("/activity", asyncHandler(async (req, res) => res.json(await ActivityLog.find().populate("actor", "name role").sort("-createdAt").limit(200))));

export default router;
