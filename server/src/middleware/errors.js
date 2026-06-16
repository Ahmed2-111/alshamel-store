export function notFound(req, res) {
  res.status(404).json({ message: `المسار غير موجود: ${req.originalUrl}` });
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  const status = err.name === "ValidationError" || err.code === 11000 ? 400 : err.status || 500;
  const message =
    err.code === 11000
      ? "هذه القيمة مستخدمة مسبقًا"
      : err.name === "ValidationError"
        ? Object.values(err.errors).map((item) => item.message).join("، ")
        : err.message || "حدث خطأ في الخادم";
  res.status(status).json({ message, stack: process.env.NODE_ENV === "development" ? err.stack : undefined });
}
