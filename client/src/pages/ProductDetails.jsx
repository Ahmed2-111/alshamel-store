import { ChevronLeft, Heart, Minus, Plus, ShieldCheck, ShoppingBag, Star, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api";
import ProductCard from "../components/ProductCard";
import { useStore } from "../context/StoreContext";
import { fallbackProducts } from "../data/fallback";
import { useCatalog } from "../hooks/useCatalog";

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart, favorites, toggleFavorite } = useStore();
  const { products } = useCatalog();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    api.get(`/products/${id}`).then(({ data }) => setProduct(data.product)).catch(() => setProduct(fallbackProducts.find((x) => x.slug === id || x._id === id)));
  }, [id]);

  if (!product) return <div className="page loading">نجهز تفاصيل القطعة...</div>;
  return (
    <div className="page container">
      <div className="breadcrumbs"><Link to="/">الرئيسية</Link><ChevronLeft /><Link to="/products">المتجر</Link><ChevronLeft /><span>{product.name}</span></div>
      <section className="product-detail">
        <div className="gallery">
          <div className="thumbs">{product.images.map((image, index) => <button className={activeImage === index ? "active" : ""} key={image} onClick={() => setActiveImage(index)}><img src={image} alt="" /></button>)}</div>
          <div className="main-photo"><img src={product.images[activeImage]} alt={product.name} /></div>
        </div>
        <div className="detail-copy">
          <span className="eyebrow">{product.category?.name}</span>
          <h1>{product.name}</h1>
          <div className="detail-rating"><span><Star fill="currentColor" /> {product.rating || 4.8}</span><small>({product.reviewCount || 12} تقييم)</small></div>
          <div className="detail-price"><strong>{product.price} ر.س</strong>{product.compareAtPrice && <><del>{product.compareAtPrice} ر.س</del><span>وفّري {product.compareAtPrice - product.price} ر.س</span></>}</div>
          <p>{product.description}</p>
          {product.colors?.length > 0 && <div className="option"><label>اللون: <b>{product.colors[0]}</b></label><div className="color-options">{product.colors.map((color, index) => <button className={index === 0 ? "active" : ""} key={color} title={color} style={{ background: index ? "#d8c9be" : "#d3a944" }} />)}</div></div>}
          <div className="stock-line"><span className={product.stock ? "in-stock" : "out-stock"}>{product.stock ? `متوفر، بقي ${product.stock} قطع` : "غير متوفر حاليًا"}</span></div>
          <div className="purchase-row">
            <div className="quantity"><button onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus /></button><span>{quantity}</span><button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}><Plus /></button></div>
            <button className="button primary grow" disabled={!product.stock} onClick={() => addToCart(product, quantity)}><ShoppingBag /> أضيفي للسلة</button>
            <button className={`button favorite-detail ${favorites.includes(product._id) ? "active" : ""}`} onClick={() => toggleFavorite(product._id)}><Heart fill="currentColor" /></button>
          </div>
          <div className="detail-benefits"><div><Truck /><span><b>شحن سريع</b><small>خلال 3-5 أيام</small></span></div><div><ShieldCheck /><span><b>ضمان الجودة</b><small>استبدال سهل</small></span></div></div>
          <details open><summary>التفاصيل والعناية</summary><p>احفظي القطعة بعيدًا عن الماء والعطور المباشرة، ونظفيها بقطعة قماش ناعمة.</p></details>
        </div>
      </section>
      <section className="related"><h2>قد يعجبكِ أيضًا</h2><div className="product-grid">{products.filter((x) => x._id !== product._id).slice(0, 4).map((item) => <ProductCard key={item._id} product={item} />)}</div></section>
    </div>
  );
}
