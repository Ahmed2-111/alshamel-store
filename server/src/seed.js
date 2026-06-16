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
  { name: "الإلكترونيات", translations: { en: { name: "Electronics" } }, slug: "electronics", sortOrder: 1, image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=900&q=85" },
  { name: "الموضة", translations: { en: { name: "Fashion" } }, slug: "fashion", sortOrder: 2, image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=85" },
  { name: "المنزل", translations: { en: { name: "Home" } }, slug: "home", sortOrder: 3, image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=85" },
  { name: "الجمال والعناية", translations: { en: { name: "Beauty" } }, slug: "beauty", sortOrder: 4, image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=85" }
];

const products = [
  { name: "ساعة ذكية برو", translations: { en: { name: "Smart Watch Pro", description: "Health tracking smartwatch with long battery life." } }, brand: "Al Shamel Tech", slug: "smart-watch-pro", price: 55, originalPrice: 55, salePrice: 39, discountPercent: 29, stock: 18, lowStockThreshold: 5, sku: "AS-EL-001", category: "electronics", featured: true, sold: 120, colors: ["black", "gold"], sizes: ["42mm", "46mm"], weight: 0.18, description: "ساعة ذكية بتتبع صحي وتنبيهات وبطارية تدوم طويلًا.", images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=90"] },
  { name: "حقيبة سفر عملية", translations: { en: { name: "Travel Organizer Bag" } }, brand: "Shamel Travel", slug: "travel-organizer-bag", price: 30, salePrice: 22, discountPercent: 27, stock: 30, sku: "AS-FS-002", category: "fashion", featured: true, sold: 88, colors: ["black", "gray"], weight: 0.6, description: "حقيبة مقاومة للماء مع جيوب متعددة مناسبة للسفر والاستخدام اليومي.", images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=90"] },
  { name: "مصباح LED منزلي", translations: { en: { name: "Home LED Lamp" } }, brand: "Home Plus", slug: "home-led-lamp", price: 16, stock: 42, sku: "AS-HM-003", category: "home", featured: true, sold: 72, colors: ["white", "black"], weight: 0.4, description: "مصباح LED بتصميم حديث يناسب المكاتب وغرف النوم.", images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=90"] },
  { name: "مجموعة عناية يومية", translations: { en: { name: "Daily Care Set" } }, brand: "Care Line", slug: "daily-care-set", price: 35, salePrice: 28, discountPercent: 20, stock: 25, sku: "AS-BT-004", category: "beauty", featured: true, sold: 110, description: "مجموعة عناية متكاملة مناسبة للاستخدام اليومي.", images: ["https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1000&q=90"] },
  { name: "سماعات بلوتوث", translations: { en: { name: "Bluetooth Earbuds" } }, brand: "Al Shamel Tech", slug: "bluetooth-earbuds", price: 18, stock: 5, lowStockThreshold: 6, sku: "AS-EL-005", category: "electronics", sold: 95, colors: ["white", "black"], description: "سماعات لاسلكية بميكروفون مدمج وعمر بطارية جيد.", images: ["https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=1000&q=90"] }
];

async function seed() {
  await connectDB();
  await Promise.all([User.deleteMany(), Category.deleteMany(), Product.deleteMany(), Order.deleteMany(), Cart.deleteMany(), Review.deleteMany(), Banner.deleteMany(), Offer.deleteMany(), Coupon.deleteMany(), ShippingRate.deleteMany(), PaymentMethod.deleteMany(), StoreSetting.deleteMany(), ActivityLog.deleteMany(), Notification.deleteMany()]);
  const createdCategories = await Category.insertMany(categories);
  const categoryMap = Object.fromEntries(createdCategories.map((category) => [category.slug, category._id]));
  await Product.insertMany(products.map((product) => ({ ...product, category: categoryMap[product.category] })));
  await User.create([
    { name: "مالك متجر الشامل", email: "owner@alshamel.store", password: "Admin123!", phone: "777000111", role: "super_admin", permissions: { products: true, categories: true, orders: true, customers: true, marketing: true, settings: true, staff: true, reports: true } },
    { name: "مدير المتجر", email: "admin@alshamel.store", password: "Admin123!", phone: "777000222", role: "admin" },
    { name: "عميل تجريبي", email: "customer@example.com", password: "Customer123!", phone: "777123456", role: "customer" }
  ]);
  await PaymentMethod.insertMany([
    { key: "cod", name: "الدفع عند الاستلام", translations: { en: { name: "Cash On Delivery" } }, type: "cod", isActive: true, instructions: "ادفع نقدًا عند الاستلام." },
    { key: "paypal", name: "PayPal", type: "paypal", isActive: true, instructions: "سيتم تحويلك لاحقًا إلى PayPal عند تفعيل الربط الحقيقي." },
    { key: "jaib", name: "محفظة جيب", translations: { en: { name: "Jaib Wallet" } }, type: "wallet", accountName: "متجر الشامل", accountNumber: "777000111", instructions: "حوّل المبلغ وارفع صورة الإيصال." },
    { key: "floosk", name: "محفظة فلوسك", translations: { en: { name: "Floosk Wallet" } }, type: "wallet", accountName: "متجر الشامل", accountNumber: "777000222", instructions: "حوّل المبلغ وارفع رقم العملية." },
    { key: "kuraimi", name: "بنك الكريمي", translations: { en: { name: "Al Kuraimi Bank" } }, type: "bank", accountName: "Al Shamel Store", accountNumber: "123456789", instructions: "ارفع إثبات التحويل للمراجعة." }
  ]);
  await ShippingRate.insertMany(["YE", "SA", "AE", "QA", "KW", "BH", "OM"].map((country, index) => ({ country, city: "*", currency: country === "YE" ? "YER" : "USD", fee: [5, 9, 10, 10, 12, 12, 11][index], freeAbove: 150 })));
  await Coupon.create({ code: "SHAMEL10", discountType: "percent", value: 10, usageLimit: 100, minOrderTotal: 30, isActive: true });
  await Banner.create({ title: "عروض متجر الشامل", translations: { en: { title: "Al Shamel Offers" } }, subtitle: "خصومات وشحن مرن لليمن والخليج", image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1200&q=90", placement: "hero", isActive: true });
  await Offer.create({ name: "خصم افتتاحي", type: "general", discountType: "percent", value: 10, isActive: true });
  await StoreSetting.create({ key: "default", storeName: "متجر الشامل", translations: { en: { storeName: "Al Shamel Store" } }, email: "hello@alshamel.store", phones: ["+967 777 000 111"], supportedCountries: ["YE", "SA", "AE", "QA", "KW", "BH", "OM"], supportedCurrencies: ["YER", "SAR", "AED", "QAR", "KWD", "BHD", "OMR", "USD"], privacyPolicy: "سياسة خصوصية قابلة للتعديل من لوحة التحكم.", terms: "الشروط والأحكام قابلة للتعديل من لوحة التحكم." });
  console.log("Al Shamel seed data created successfully");
  await mongoose.connection.close();
}

seed().catch(async (error) => {
  console.error(error);
  await mongoose.connection.close();
  process.exit(1);
});
