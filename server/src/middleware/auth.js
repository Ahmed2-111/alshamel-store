import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function protect(req, res, next) {
  try {
    const token = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null;

    if (!token) return res.status(401).json({ message: "يرجى تسجيل الدخول أولًا" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) return res.status(401).json({ message: "المستخدم غير موجود" });
    next();
  } catch {
    res.status(401).json({ message: "جلسة غير صالحة أو منتهية" });
  }
}

export function adminOnly(req, res, next) {
  if (!["admin", "super_admin"].includes(req.user?.role)) {
    return res.status(403).json({ message: "هذه العملية متاحة للمشرف فقط" });
  }
  next();
}

export function staffOnly(req, res, next) {
  if (!["employee", "admin", "super_admin"].includes(req.user?.role)) {
    return res.status(403).json({ message: "هذه العملية متاحة لفريق الإدارة فقط" });
  }
  next();
}

export function can(permission) {
  return (req, res, next) => {
    if (req.user?.role === "super_admin" || req.user?.role === "admin" || req.user?.permissions?.[permission]) return next();
    return res.status(403).json({ message: "لا تملك صلاحية تنفيذ هذه العملية" });
  };
}
