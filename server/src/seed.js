import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import ActivityLog from "./models/ActivityLog.js";
import Banner from "./models/Banner.js";
import Cart from "./models/Cart.js";
import Category from "./models/Category.js";
import Coupon from "./models/Coupon.js";
import Notification from "./models/Notification.js";
import Offer from "./models/Offer.js";
import Order from "./models/Order.js";
import PaymentMethod from "./models/PaymentMethod.js";
import Product from "./models/Product.js";
import Review from "./models/Review.js";
import ShippingRate from "./models/ShippingRate.js";
import StoreSetting from "./models/StoreSetting.js";
import User from "./models/User.js";

const categories = [
  { name: "أظافر اصطناعية", translations: { en: { name: "Artificial Nails" } }, slug: "artificial-nails", sortOrder: 1, image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=900&q=85" },
  { name: "مستحضرات تجميل", translations: { en: { name: "Makeup" } }, slug: "makeup", sortOrder: 2, image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=85" },
  { name: "عطور", translations: { en: { name: "Perfumes" } }, slug: "perfumes", sortOrder: 3, image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=85" },
  { name: "حقائب", translations: { en: { name: "Bags" } }, slug: "bags", sortOrder: 4, image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=85" },
  { name: "نظارات", translations: { en: { name: "Eyewear" } }, slug: "eyewear", sortOrder: 5, image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=85" },
  { name: "إكسسوارات", translations: { en: { name: "Accessories" } }, slug: "accessories", sortOrder: 6, image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=85" },
  { name: "منتجات عناية", translations: { en: { name: "Care Products" } }, slug: "care-products", sortOrder: 7, image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=85" },
  { name: "هدايا", translations: { en: { name: "Gifts" } }, slug: "gifts", sortOrder: 8, image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=900&q=85" }
];

const products = [
  { name: "باليت مكياج يومي", translations: { en: { name: "Daily Makeup Palette", description: "Soft shades for daily looks." } }, brand: "Alshamel Beauty", slug: "daily-makeup-palette", price: 9500, originalPrice: 9500, salePrice: 7800, discountPercent: 18, stock: 20, lowStockThreshold: 5, sku: "SH-MK-001", category: "makeup", featured: true, sold: 140, colors: ["beige", "pink", "brown"], description: "باليت مكياج بدرجات هادئة مناسبة للاستخدام اليومي والمناسبات الخفيفة.", images: ["https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1000&q=90"] },
  { name: "عطر نسائي فاخر", translations: { en: { name: "Luxury Women's Perfume" } }, brand: "Alshamel Scents", slug: "luxury-women-perfume", price: 14500, stock: 14, sku: "SH-PR-002", category: "perfumes", featured: true, sold: 96, description: "عطر أنثوي ناعم بنفحات زهرية دافئة مناسب للهدايا والاستخدام اليومي.", images: ["https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=90"] },
  { name: "حقيبة أنيقة صغيرة", translations: { en: { name: "Elegant Mini Bag" } }, brand: "Alshamel Style", slug: "elegant-mini-bag", price: 15000, salePrice: 12000, discountPercent: 20, stock: 11, sku: "SH-BG-003", category: "bags", featured: true, sold: 76, colors: ["olive", "beige", "black"], description: "حقيبة صغيرة بتفاصيل ناعمة تناسب الإطلالات اليومية.", images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=90"] },
  { name: "سيروم عناية بالبشرة", translations: { en: { name: "Skin Care Serum" } }, brand: "Care Lab", slug: "skin-care-serum", price: 6800, stock: 25, sku: "SH-CR-004", category: "care-products", featured: true, sold: 120, description: "سيروم خفيف للعناية اليومية يمنح البشرة ترطيبًا وملمسًا ناعمًا.", images: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1000&q=90"] },
  { name: "طقم أظافر اصطناعية", translations: { en: { name: "Artificial Nails Set" } }, brand: "Nail Chic", slug: "artificial-nails-set", price: 3500, stock: 30, sku: "SH-NA-005", category: "artificial-nails", sold: 88, description: "طقم أظافر اصطناعية بتصميم أنيق للاستخدام المنزلي.", images: ["https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1000&q=90"] },
  { name: "إكسسوار ذهبي ناعم", translations: { en: { name: "Soft Gold Accessory" } }, brand: "Alshamel Accessories", slug: "soft-gold-accessory", price: 5200, stock: 18, sku: "SH-AC-006", category: "accessories", sold: 64, description: "إكسسوار ناعم بلون ذهبي يناسب الهدايا والإطلالات اليومية.", images: ["https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1000&q=90"] }
];

async function seed() {
  await connectDB();
  await Promise.all([User.deleteMany(), Category.deleteMany(), Product.deleteMany(), Order.deleteMany(), Cart.deleteMany(), Review.deleteMany(), Banner.deleteMany(), Offer.deleteMany(), Coupon.deleteMany(), ShippingRate.deleteMany(), PaymentMethod.deleteMany(), StoreSetting.deleteMany(), ActivityLog.deleteMany(), Notification.deleteMany()]);
  const createdCategories = await Category.insertMany(categories);
  const categoryMap = Object.fromEntries(createdCategories.map((category) => [category.slug, category._id]));
  await Product.insertMany(products.map((product) => ({ ...product, category: categoryMap[product.category] })));
  await User.create([
    { name: "مالك متجر الشامل", email: "owner@alshamel.store", password: "Admin123!", phone: "784798561", role: "super_admin", permissions: { products: true, categories: true, orders: true, customers: true, marketing: true, settings: true, staff: true, reports: true } },
    { name: "مدير المتجر", email: "admin@alshamel.store", password: "Admin123!", phone: "779996367", role: "admin" },
    { name: "عميل تجريبي", email: "customer@example.com", password: "Customer123!", phone: "777123456", role: "customer" }
  ]);
  await PaymentMethod.insertMany([
    { key: "cod", name: "الدفع عند الاستلام", translations: { en: { name: "Cash On Delivery" } }, type: "cod", isActive: true, instructions: "ادفع نقدًا عند الاستلام." },
    { key: "jaib", name: "محفظة جيب", translations: { en: { name: "Jaib Wallet" } }, type: "wallet", accountName: "متجر الشامل", accountNumber: "784798561", instructions: "حوّل المبلغ وارفع صورة الإيصال." },
    { key: "floosk", name: "محفظة فلوسك", translations: { en: { name: "Floosk Wallet" } }, type: "wallet", accountName: "متجر الشامل", accountNumber: "779996367", instructions: "حوّل المبلغ وارفع رقم العملية." },
    { key: "kuraimi", name: "بنك الكريمي", translations: { en: { name: "Al Kuraimi Bank" } }, type: "bank", accountName: "Alshamel Store", accountNumber: "784798561", instructions: "ارفع إثبات التحويل للمراجعة." }
  ]);
  await ShippingRate.insertMany(["YE", "SA", "AE", "QA", "KW", "BH", "OM"].map((country, index) => ({ country, city: "*", currency: country === "YE" ? "YER" : "USD", fee: [1500, 25, 25, 25, 30, 30, 28][index], freeAbove: 50000 })));
  await Coupon.create({ code: "SHAMEL10", discountType: "percent", value: 10, usageLimit: 100, minOrderTotal: 10000, isActive: true });
  await Banner.create({ title: "متجر الشامل", translations: { en: { title: "Alshamel Store" } }, subtitle: "كل ما تحتاجه المرأة في مكان واحد", image: "/brand/alshamel-banner.jpg", placement: "hero", isActive: true });
  await Offer.create({ name: "خصم افتتاحي", type: "general", discountType: "percent", value: 10, isActive: true });
  await StoreSetting.create({ key: "default", storeName: "متجر الشامل", logo: "/alshamel-logo.png", translations: { en: { storeName: "Alshamel Store" } }, email: "hello@alshamel.store", phones: ["+967 784798561", "+967 779996367"], socials: { instagram: "@story_yemen", whatsapp: "+967779996367" }, supportedCountries: ["YE", "SA", "AE", "QA", "KW", "BH", "OM"], supportedCurrencies: ["YER", "SAR", "AED", "QAR", "KWD", "BHD", "OMR", "USD"], privacyPolicy: "سياسة خصوصية قابلة للتعديل من لوحة التحكم.", terms: "الشروط والأحكام قابلة للتعديل من لوحة التحكم." });
  console.log("Alshamel Store seed data created successfully");
  await mongoose.connection.close();
}

seed().catch(async (error) => {
  console.error(error);
  await mongoose.connection.close();
  process.exit(1);
});
