import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Facebook, Globe2, Heart, Instagram, Mail, Menu, Phone, Search, ShoppingBag, User, X } from "lucide-react";
import Logo from "./Logo";
import { useStore } from "../context/StoreContext";
import { countries, currencies } from "../i18n";

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState("");
  const { cartCount, favorites, user, toast, language, setLanguage, t, country, setCountry, currency, setCurrency } = useStore();
  const navigate = useNavigate();
  const isStaff = ["employee", "admin", "super_admin"].includes(user?.role);

  const search = (event) => {
    event.preventDefault();
    navigate(`/products?search=${encodeURIComponent(term)}`);
    setSearchOpen(false);
  };

  const links = [
    ["/", t("home")],
    ["/products", t("shop")],
    ["/categories", t("categories")],
    ["/about", t("about")],
    ["/contact", t("contact")]
  ];

  return (
    <div className="app-shell">
      <div className="announcement">{t("freeShipping")} <span>•</span> {t("giftWrap")}</div>
      <header className="header">
        <div className="container header-inner">
          <button className="icon-button mobile-menu" onClick={() => setMenuOpen(true)} aria-label="menu"><Menu /></button>
          <Link to="/"><Logo /></Link>
          <nav className="desktop-nav">{links.map(([to, label]) => <NavLink key={to} to={to}>{label}</NavLink>)}</nav>
          <div className="header-actions">
            <select className="mini-select hide-mobile" value={country} onChange={(e) => setCountry(e.target.value)} aria-label={t("country")}>
              {countries.map((item) => <option key={item.code} value={item.code}>{language === "ar" ? item.ar : item.en}</option>)}
            </select>
            <select className="mini-select hide-mobile" value={currency} onChange={(e) => setCurrency(e.target.value)} aria-label={t("currency")}>
              {currencies.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <button className="language-toggle" onClick={() => setLanguage(language === "ar" ? "en" : "ar")}><Globe2 /> {t("language")}</button>
            <button className="icon-button hide-mobile" onClick={() => setSearchOpen(true)} aria-label={t("search")}><Search /></button>
            <Link className="icon-button hide-mobile badge-wrap" to="/products?favorites=true" aria-label={t("favorites")}><Heart /><span className="badge">{favorites.length}</span></Link>
            <Link className="icon-button hide-mobile" to={isStaff ? "/admin" : user ? "/account" : "/login"} aria-label={t("account")}><User /></Link>
            <Link className="icon-button badge-wrap" to="/cart" aria-label={t("cart")}><ShoppingBag /><span className="badge">{cartCount}</span></Link>
          </div>
        </div>
      </header>

      <aside className={`mobile-drawer ${menuOpen ? "open" : ""}`}>
        <button className="icon-button drawer-close" onClick={() => setMenuOpen(false)}><X /></button>
        <Logo />
        <nav>{links.map(([to, label]) => <NavLink key={to} to={to} onClick={() => setMenuOpen(false)}>{label}</NavLink>)}</nav>
        <button className="language-toggle drawer-language" onClick={() => setLanguage(language === "ar" ? "en" : "ar")}><Globe2 /> {t("language")}</button>
        <NavLink to={user ? "/account" : "/login"} onClick={() => setMenuOpen(false)}>{t("account")}</NavLink>
      </aside>
      {menuOpen && <div className="overlay" onClick={() => setMenuOpen(false)} />}

      {searchOpen && (
        <div className="search-overlay">
          <button className="icon-button search-close" onClick={() => setSearchOpen(false)}><X /></button>
          <form onSubmit={search}>
            <label>{language === "ar" ? "عن ماذا تبحث؟" : "What are you looking for?"}</label>
            <div><input autoFocus value={term} onChange={(e) => setTerm(e.target.value)} placeholder={language === "ar" ? "اكتب اسم المنتج..." : "Search products..."} /><button><Search /></button></div>
          </form>
        </div>
      )}

      <main><Outlet /></main>
      <footer className="footer">
        <div className="container footer-grid">
          <div className="footer-brand"><Logo /><p>{language === "ar" ? "منصة تسوق شاملة لليمن ودول الخليج، تجمع المنتجات والعروض وطرق الدفع المحلية والدولية." : "A complete commerce platform for Yemen and GCC markets with products, offers, and local or international payments."}</p><div className="socials"><a href="#"><Instagram /></a><a href="#"><Facebook /></a></div></div>
          <div><h4>{t("shop")}</h4><Link to="/products">{t("allProducts")}</Link><Link to="/categories">{t("categories")}</Link><Link to="/products?sort=newest">{t("newProducts")}</Link><Link to="/products?featured=true">{t("suggested")}</Link></div>
          <div><h4>{language === "ar" ? "خدمة العملاء" : "Customer Care"}</h4><Link to="/contact">{t("contact")}</Link><Link to="/about">{t("about")}</Link><a href="#">{language === "ar" ? "الشحن والاسترجاع" : "Shipping & Returns"}</a><a href="#">{language === "ar" ? "الأسئلة الشائعة" : "FAQ"}</a></div>
          <div><h4>{language === "ar" ? "ابق قريبًا" : "Stay Connected"}</h4><p>{language === "ar" ? "اشترك ليصلك جديد العروض والمنتجات." : "Subscribe for the latest offers and products."}</p><form className="newsletter" onSubmit={(e) => e.preventDefault()}><input type="email" placeholder={language === "ar" ? "بريدك الإلكتروني" : "Email address"} /><button><Mail /></button></form><p className="contact-line"><Phone /> +967 777 000 111</p></div>
        </div>
        <div className="footer-bottom container"><span>© 2026 {t("storeName")}. {language === "ar" ? "جميع الحقوق محفوظة." : "All rights reserved."}</span><span>{language === "ar" ? "جاهز للتجارة في اليمن والخليج" : "Ready for Yemen and GCC commerce"}</span></div>
      </footer>
      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
}
