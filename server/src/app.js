import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import storeRoutes from "./routes/storeRoutes.js";
import managementRoutes from "./routes/managementRoutes.js";
import { errorHandler, notFound } from "./middleware/errors.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL?.split(",") || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));
app.use("/uploads", express.static(path.resolve("uploads")));

app.get("/api/health", (req, res) => res.json({ status: "ok", name: "Al Shamel Store API" }));
app.use("/api/store", storeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/manage", managementRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
