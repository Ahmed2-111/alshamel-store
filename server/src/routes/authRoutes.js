import { Router } from "express";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import { createToken } from "../utils/token.js";
import { protect } from "../middleware/auth.js";

const router = Router();

const userPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  token: createToken(user._id)
});

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      res.status(400);
      throw new Error("الاسم والبريد وكلمة المرور مطلوبة");
    }
    if (await User.exists({ email: email.toLowerCase() })) {
      res.status(400);
      throw new Error("البريد الإلكتروني مسجل مسبقًا");
    }
    const user = await User.create({ name, email, password, phone });
    res.status(201).json(userPayload(user));
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email?.toLowerCase() }).select("+password");
    if (!user || !(await user.comparePassword(req.body.password || ""))) {
      res.status(401);
      throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    }
    if (!user.isActive) {
      res.status(403);
      throw new Error("تم تعطيل هذا الحساب");
    }
    res.json(userPayload(user));
  })
);

router.get("/me", protect, (req, res) => res.json(req.user));

router.put(
  "/me",
  protect,
  asyncHandler(async (req, res) => {
    req.user.name = req.body.name ?? req.user.name;
    req.user.phone = req.body.phone ?? req.user.phone;
    req.user.addresses = req.body.addresses ?? req.user.addresses;
    if (req.body.password) req.user.password = req.body.password;
    await req.user.save();
    res.json({ ...userPayload(req.user), message: "تم تحديث الحساب" });
  })
);

export default router;
