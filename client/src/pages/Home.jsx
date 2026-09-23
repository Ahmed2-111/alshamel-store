import { ArrowLeft, Gift, Instagram, MessageCircle, Phone, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import SectionTitle from "../components/SectionTitle";
import { useStore } from "../context/StoreContext";
import { brandContacts } from "../i18n";
import { useCatalog } from "../hooks/useCatalog";

const reviews = [
  { ar: "الأصناف مرتبة والطلب عبر واتساب كان سريع وواضح.", en: "Categories are clear and WhatsApp ordering was fast.", name: "عميلة من صنعاء" },
  { ar: "الهوية جميلة والمنتجات وصلت مثل الصور.", en: "Beautiful identity and products arrived as shown.", name: "عميلة من عدن" },
  { ar: "أحببت تنوع مستحضرات التجميل والعطور والهدايا في مكان واحد.", en: "I loved finding makeup, perfumes, and gifts in one place.", name: "عميلة من إب" }
];

export default function Home() {
  const { products, categories } = useCatalog();
  const { t, language } = useStore();
  const catalogSections = categories
    .map((category) => ({
      category,
      products: products.filter((product) => (product.category?._id || product.category) === category._id).slice(0, 8)
    }))
    .filter((section) => section.products.length);
  const uncategorizedProducts = products.filter((product) => !product.category).slice(0, 8);

  return (
    <>
      <section className="hero alshamel-beauty-hero">
        <div className="hero-pattern" />
        <div className="container hero-content">
          <div className="hero-copy">
            <span className="eyebrow light">{brandContacts.handle}</span>
            <h1>{language === "ar" ? "كتالوج متجر الشامل" : "Alshamel Store Catalog"}<br /><em>{language === "ar" ? "صور، وصف، وأسعار واضحة" : "Photos, Details, And Prices"}</em></h1>
            <p>{language === "ar" ? "استعرض منتجات متجر الشامل حسب كل قسم بشكل منفصل، مع صور المنتجات ووصفها وأسعارها كما تدار مباشرة من لوحة التحكم." : "Browse Alshamel Store products by category with real photos, descriptions, and prices managed directly from the dashboard."}</p>
            <div className="hero-actions">
              <Link to="/products" className="button gold">{language === "ar" ? "عرض كل الأقسام" : "View All Sections"} <ArrowLeft /></Link>
              <Link to="/contact" className="text-link light">{t("contact")}</Link>
            </div>
          </div>
          <div className="hero-visual beauty-visual">
            <div className="hero-main-image beauty-main-image"><img src="/brand/store-interior.jpg" alt={t("storeName")} /></div>
            <div className="hero-float beauty-float"><Sparkles /><span>{language === "ar" ? "هوية متجر حقيقية" : "Real store identity"}<br /><b>{brandContacts.instagram}</b></span></div>
            <div className="hero-arch" />
          </div>
        </div>
      </section>

      <section className="brand-strip-section">
        <div className="container">
          <img src="/brand/alshamel-banner.jpg" alt="هوية متجر الشامل والأصناف" />
        </div>
      </section>

      <section className="benefits beauty-benefits"><div className="container benefits-grid">
        <div><Gift /><span><b>{language === "ar" ? "هدايا" : "Gifts"}</b><small>{language === "ar" ? "تغليف واختيارات مناسبة" : "Curated gift picks"}</small></span></div>
        <div><Truck /><span><b>{language === "ar" ? "طلب مباشر" : "Direct Ordering"}</b><small>{brandContacts.whatsapp}</small></span></div>
        <div><ShieldCheck /><span><b>{language === "ar" ? "منتجات مختارة" : "Curated Products"}</b><small>{language === "ar" ? "جمال وعناية وإكسسوارات" : "Beauty, care, accessories"}</small></span></div>
        <div><Instagram /><span><b>Instagram</b><small>{brandContacts.instagram}</small></span></div>
      </div></section>

      <section className="section container">
        <SectionTitle eyebrow={t("mainCategories")} title={language === "ar" ? "أقسام المتجر" : "Store Sections"} description={language === "ar" ? "كل قسم مستقل، والمنتجات داخله تأتي مباشرة من قاعدة البيانات ولوحة التحكم." : "Each section is separate, and its products are loaded directly from the database and dashboard."} />
        <div className="beauty-category-grid">
          {categories.map((category) => (
            <Link to={`/products?category=${category._id}`} className="beauty-category-card" key={category._id}>
              <img src={category.image} alt={category.name} />
              <span>{category.translations?.[language]?.name || category.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {catalogSections.length ? catalogSections.map((section, index) => (
        <ProductSection
          key={section.category._id}
          eyebrow={language === "ar" ? "قسم مستقل" : "Catalog Section"}
          title={section.category.translations?.[language]?.name || section.category.name}
          description={language === "ar" ? `${section.products.length} منتجات مع الصور والوصف والأسعار.` : `${section.products.length} products with photos, descriptions, and prices.`}
          products={section.products}
          categoryId={section.category._id}
          soft={index % 2 === 1}
        />
      )) : <section className="section container"><div className="empty-state"><h2>{language === "ar" ? "لا توجد منتجات بعد" : "No Products Yet"}</h2><p>{language === "ar" ? "أضف المنتجات من لوحة التحكم وستظهر هنا مباشرة داخل أقسامها." : "Add products from the dashboard and they will appear here inside their sections."}</p></div></section>}

      {uncategorizedProducts.length > 0 && (
        <ProductSection eyebrow={language === "ar" ? "بدون تصنيف" : "Uncategorized"} title={language === "ar" ? "منتجات تحتاج تصنيف" : "Products To Categorize"} products={uncategorizedProducts} soft />
      )}

      <section className="story-banner container beauty-contact-banner">
        <div className="story-image qr-panel">
          <img src="/brand/alshamel-qr.jpg" alt="QR متجر الشامل" />
          <span className="seal">SH<small>QR</small></span>
        </div>
        <div className="story-copy">
          <span className="eyebrow">{t("partners")}</span>
          <h2>{language === "ar" ? "للتواصل والطلب المباشر" : "Contact And Direct Orders"}</h2>
          <p>{language === "ar" ? "استخدم أرقام التواصل أو امسح رمز QR للوصول إلى حسابات متجر الشامل ومتابعة آخر المنتجات والعروض." : "Use the contact numbers or scan the QR code to reach Alshamel Store and follow the latest products and offers."}</p>
          <div className="contact-pill-list">
            <a href={`tel:${brandContacts.phone}`}><Phone /> {brandContacts.phone}</a>
            <a href={`https://wa.me/${brandContacts.whatsapp.replace(/[^0-9]/g, "")}`}><MessageCircle /> {brandContacts.whatsapp}</a>
            <a href="#"><Instagram /> {brandContacts.instagram}</a>
          </div>
        </div>
      </section>

      <section className="section container">
        <SectionTitle eyebrow={t("testimonials")} title={language === "ar" ? "ثقة العملاء تبدأ من التفاصيل" : "Trust Begins With Details"} />
        <div className="review-grid">{reviews.map((review) => <article key={review.name}><p>{review[language]}</p><b>{review.name}</b></article>)}</div>
      </section>
    </>
  );
}

function ProductSection({ eyebrow, title, description, products, categoryId, soft = false }) {
  return (
    <section className={`section ${soft ? "featured-section" : ""}`}>
      <div className="container">
        <SectionTitle eyebrow={eyebrow} title={title} description={description} action={<Link className="text-link" to={categoryId ? `/products?category=${categoryId}` : "/products"}>عرض القسم <ArrowLeft /></Link>} />
        <div className="product-grid">{products.map((product) => <ProductCard key={product._id} product={product} />)}</div>
      </div>
    </section>
  );
}
