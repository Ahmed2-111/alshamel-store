import { Heart, ShoppingBag, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useStore } from "../context/StoreContext";

export default function ProductCard({ product }) {
  const { addToCart, toggleFavorite, favorites, t, language, currency } = useStore();
  const displayName = product.translations?.[language]?.name || product.name;
  const finalPrice = product.salePrice || product.price;
  const original = product.originalPrice || product.compareAtPrice;
  const sale = product.discountPercent || (original ? Math.round((1 - finalPrice / original) * 100) : 0);
  const image = product.images?.find(Boolean) || "/brand/store-interior.jpg";
  const useFallbackImage = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = "/brand/store-interior.jpg";
  };

  return (
    <article className="product-card">
      <div className="product-image">
        <Link to={`/products/${product.slug || product._id}`}><img src={image} alt={displayName} onError={useFallbackImage} /></Link>
        <div className="product-tags">
          {sale > 0 && <span className="tag sale">-{sale}%</span>}
          {!product.stock && <span className="tag sold">{language === "ar" ? "نفد" : "Sold out"}</span>}
        </div>
        <button className={`favorite ${favorites.includes(product._id) ? "active" : ""}`} onClick={() => toggleFavorite(product._id)} aria-label="wishlist"><Heart fill="currentColor" /></button>
        <button className="quick-add" disabled={!product.stock} onClick={() => addToCart(product)}><ShoppingBag /> <span>{t("addToCart")}</span></button>
      </div>
      <div className="product-info">
        <div className="product-meta"><span>{product.brand || product.category?.name}</span><span className="rating"><Star fill="currentColor" /> {product.rating || (language === "ar" ? "جديد" : "New")}</span></div>
        <Link to={`/products/${product.slug || product._id}`}><h3>{displayName}</h3></Link>
        <div className="price"><strong>{finalPrice} {currency}</strong>{original && <del>{original} {currency}</del>}</div>
      </div>
    </article>
  );
}
