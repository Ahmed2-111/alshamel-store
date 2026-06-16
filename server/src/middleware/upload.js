import multer from "multer";
import path from "path";
import crypto from "crypto";

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, callback) => {
    callback(null, `${Date.now()}-${crypto.randomBytes(5).toString("hex")}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, callback) => {
  if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) callback(null, true);
  else callback(Object.assign(new Error("يسمح برفع الصور والفيديو فقط"), { status: 400 }));
};

export const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024, files: 6 } });
