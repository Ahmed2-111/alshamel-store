import { ArrowLeft, BadgePercent, CreditCard, Headphones, ShieldCheck, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import SectionTitle from "../components/SectionTitle";
import { useStore } from "../context/StoreContext";
import { useCatalog } from "../hooks/useCatalog";

const partners = ["PayPal", "جيب", "فلوسك", "الكريمي", "DHL", "Aramex"];
const reviews = [
  { ar: "تجربة مرتبة وسريعة، خيارات الدفع المحلية ممتازة.", en: "Smooth experience and great local payment options.", name: "Sara A." },
  { ar: "المنتجات وصلت بتغليف ممتاز والتتبع واضح.", en: "Products arrived well packed and tracking was clear.", name: "Mohammed S." },
  { ar: "لوحة دفع سهلة ودعم ممتاز عبر واتساب.", en: "Easy checkout and excellent WhatsApp support.", name: "Huda M." }
];

export default function Home() {
  const { products, categories } = useCatalog();
  const { t, language } = useStore();
  const deals = products.filter((x) => x.salePrice || x.discountPercent || x.compareAtPrice).slice(0, 4);
  const bestSellers = [...products].sort((a, b) => (b.sold || b.rating || 0) - (a.sold || a.rating || 0)).slice(0, 4);
  const newest = products.slice(0, 4);
  const suggested = products.filter((x) => x.featured).slice(0, 4);

  return (
    <>
      <section className="hero alshamel-hero">
        <div className="hero-pattern" />
        <div className="container hero-content">
          <div className="hero-copy">
            <span className="eyebrow light">{t("heroEyebrow")}</span>
            <h1>{t("heroTitleA")}<br /><em>{t("heroTitleB")}</em></h1>
            <p>{t("heroText")}</p>
            <div className="hero-actions">
              <Link to="/products" className="button gold">{t("discover")} <ArrowLeft /></Link>
              <Link to="/contact" className="text-link light">{t("contact")}</Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-main-image"><img src="https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1200&q=90" alt={t("storeName")} /></div>
            <div className="hero-float"><BadgePercent /><span>{language === "ar" ? "عروض قابلة للإدارة" : "Managed deals"}<br /><b>{language === "ar" ? "من لوحة التحكم" : "from dashboard"}</b></span></div>
            <div className="hero-arch" />
          </div>
        </div>
      </section>

      <section className="benefits"><div className="container benefits-grid">
        <div><Truck /><span><b>{language === "ar" ? "شحن ذكي" : "Smart Shipping"}</b><small>{language === "ar" ? "حسب الدولة والمدينة" : "By country and city"}</small></span></div>
        <div><CreditCard /><span><b>{language === "ar" ? "دفع متعدد" : "Multiple Payments"}</b><small>COD, PayPal, Wallets</small></span></div>
        <div><ShieldCheck /><span><b>{language === "ar" ? "تجربة آمنة" : "Secure Store"}</b><small>JWT + Roles</small></span></div>
        <div><Headphones /><span><b>{language === "ar" ? "دعم العملاء" : "Customer Support"}</b><small>WhatsApp & Email</small></span></div>
      </div></section>

      <section className="section container">
        <SectionTitle eyebrow={t("mainCategories")} title={language === "ar" ? "تسوّق حسب القسم" : "Shop by Category"} description={language === "ar" ? "تصنيفات رئيسية وفرعية قابلة للترتيب من لوحة التحكم" : "Main and sub categories managed from the dashboard"} />
        <div className="category-grid">
          {categories.slice(0, 4).map((category, index) => (
            <Link to={`/products?category=${category._id}`} className={`category-card category-${index + 1}`} key={category._id}>
              <img src={category.image} alt={category.name} />
              <div><span>{category.productCount || 0} {language === "ar" ? "منتج" : "items"}</span><h3>{category.translations?.[language]?.name || category.name}</h3><small>{t("discover")} <ArrowLeft /></small></div>
            </Link>
          ))}
        </div>
      </section>

      <ProductSection eyebrow={t("newProducts")} title={language === "ar" ? "أحدث المنتجات" : "Fresh Arrivals"} products={newest} />
      <ProductSection eyebrow={t("bestSellers")} title={language === "ar" ? "الأكثر طلبًا" : "Top Selling"} products={bestSellers} soft />
      <ProductSection eyebrow={t("deals")} title={language === "ar" ? "خصومات نشطة" : "Active Discounts"} products={deals.length ? deals : products.slice(0, 4)} />
      <ProductSection eyebrow={t("suggested")} title={language === "ar" ? "اختيارات مقترحة" : "Recommended For You"} products={suggested.length ? suggested : products.slice(0, 4)} soft />

      <section className="story-banner container">
        <div className="story-image"><img src="https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1200&q=90" alt={t("storeName")} /><span className="seal">AS<small>{language === "ar" ? "الشامل" : "Store"}</small></span></div>
        <div className="story-copy"><span className="eyebrow">{t("testimonials")}</span><h2>{language === "ar" ? "تجارة إلكترونية جاهزة للسوق" : "Commerce Ready For Launch"}</h2><p>{language === "ar" ? "واجهة عملاء احترافية، لوحة إدارة متكاملة، كوبونات، عروض، شحن، دفع محلي ودولي، وسجل نشاط للفريق." : "Professional storefront, complete admin, coupons, offers, shipping, local and international payments, and staff activity logs."}</p><Link to="/products" className="button outline">{t("discover")} <ArrowLeft /></Link></div>
      </section>

      <section className="section container">
        <SectionTitle eyebrow={t("testimonials")} title={language === "ar" ? "ماذا يقول العملاء؟" : "What Customers Say"} />
        <div className="review-grid">{reviews.map((review) => <article key={review.name}><p>{review[language]}</p><b>{review.name}</b></article>)}</div>
      </section>

      <section className="instagram-section container"><span className="eyebrow">{t("partners")}</span><h2>{language === "ar" ? "شركاء وطرق دفع" : "Partners & Payment Methods"}</h2><div className="partner-grid">{partners.map((item) => <span key={item}>{item}</span>)}</div></section>
    </>
  );
}

function ProductSection({ eyebrow, title, products, soft = false }) {
  return (
    <section className={`section ${soft ? "featured-section" : ""}`}>
      <div className="container">
        <SectionTitle eyebrow={eyebrow} title={title} action={<Link className="text-link" to="/products">عرض الكل <ArrowLeft /></Link>} />
        <div className="product-grid">{products.map((product) => <ProductCard key={product._id} product={product} />)}</div>
      </div>
    </section>
  );
}
