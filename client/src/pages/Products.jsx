import { SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useStore } from "../context/StoreContext";
import { useCatalog } from "../hooks/useCatalog";

export default function Products() {
  const { products, categories, loading } = useCatalog();
  const { favorites } = useStore();
  const [params, setParams] = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);
  const category = params.get("category") || "";
  const sort = params.get("sort") || "newest";
  const search = params.get("search") || "";
  const onlyFavorites = params.get("favorites") === "true";

  const filtered = useMemo(() => {
    let result = [...products];
    if (category) result = result.filter((x) => (x.category?._id || x.category) === category);
    if (search) result = result.filter((x) => `${x.name} ${x.description}`.includes(search));
    if (onlyFavorites) result = result.filter((x) => favorites.includes(x._id));
    if (sort === "priceAsc") result.sort((a, b) => a.price - b.price);
    if (sort === "priceDesc") result.sort((a, b) => b.price - a.price);
    if (sort === "popular") result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return result;
  }, [products, category, search, sort, onlyFavorites, favorites]);

  const change = (key, value) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    setParams(next);
  };

  return (
    <div className="page container">
      <div className="page-heading"><span className="eyebrow">متجر الشامل</span><h1>{onlyFavorites ? "المفضلة" : "كل المنتجات"}</h1><p>منتجات متنوعة لليمن ودول الخليج</p></div>
      <div className="shop-toolbar">
        <button className="filter-toggle" onClick={() => setFilterOpen(true)}><SlidersHorizontal /> تصفية المنتجات</button>
        <span>{filtered.length} منتج</span>
        <select value={sort} onChange={(e) => change("sort", e.target.value)}><option value="newest">الأحدث</option><option value="popular">الأكثر تقييمًا</option><option value="priceAsc">السعر: الأقل أولًا</option><option value="priceDesc">السعر: الأعلى أولًا</option></select>
      </div>
      <div className="shop-layout">
        <aside className={`filters ${filterOpen ? "open" : ""}`}>
          <button className="icon-button filter-close" onClick={() => setFilterOpen(false)}><X /></button>
          <h3>التصنيفات</h3>
          <label><input type="radio" checked={!category} onChange={() => change("category", "")} /> جميع المنتجات</label>
          {categories.map((item) => <label key={item._id}><input type="radio" checked={category === item._id} onChange={() => change("category", item._id)} /> {item.name}<small>{item.productCount}</small></label>)}
          <h3>التوفر</h3>
          <label><input type="checkbox" /> المتوفر فقط</label>
          <div className="filter-note">شحن مجاني للطلبات فوق <b>150 ر.س</b></div>
        </aside>
        <div className="products-area">
          {loading ? <div className="loading">نجهز لكِ أجمل القطع...</div> : filtered.length ? <div className="product-grid">{filtered.map((product) => <ProductCard key={product._id} product={product} />)}</div> : <div className="empty-state"><h2>لا توجد منتجات هنا بعد</h2><p>جرّبي تصنيفًا آخر أو أزيلي عوامل التصفية.</p></div>}
        </div>
      </div>
      {filterOpen && <div className="overlay" onClick={() => setFilterOpen(false)} />}
    </div>
  );
}
