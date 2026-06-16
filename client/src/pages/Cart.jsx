import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useStore } from "../context/StoreContext";

export default function Cart() {
  const { cart, cartTotal, updateQuantity, removeFromCart } = useStore();
  const shipping = cartTotal >= 150 ? 0 : 15;
  if (!cart.length) return <div className="page container empty-cart"><ShoppingBag /><h1>سلّتكِ تنتظر قطعة جميلة</h1><p>اكتشفي مجموعتنا واختاري ما يشبهكِ.</p><Link className="button primary" to="/products">ابدئي التسوّق <ArrowLeft /></Link></div>;
  return (
    <div className="page container cart-page">
      <div className="page-heading compact"><span className="eyebrow">اختياراتكِ</span><h1>سلة التسوق</h1></div>
      <div className="cart-layout">
        <section className="cart-items">
          <div className="cart-head"><span>المنتج</span><span>الكمية</span><span>السعر</span></div>
          {cart.map((item) => <article className="cart-item" key={item._id}>
            <Link to={`/products/${item.slug || item._id}`}><img src={item.images[0]} alt={item.name} /></Link>
            <div className="cart-item-info"><small>{item.category?.name}</small><h3>{item.name}</h3><button onClick={() => removeFromCart(item._id)}><Trash2 /> حذف</button></div>
            <div className="quantity"><button onClick={() => updateQuantity(item._id, item.quantity - 1)}><Minus /></button><span>{item.quantity}</span><button onClick={() => updateQuantity(item._id, item.quantity + 1)}><Plus /></button></div>
            <strong>{item.price * item.quantity} ر.س</strong>
          </article>)}
          <Link className="text-link" to="/products">متابعة التسوق <ArrowLeft /></Link>
        </section>
        <aside className="order-summary"><h2>ملخص الطلب</h2><div><span>المجموع الفرعي</span><b>{cartTotal} ر.س</b></div><div><span>الشحن</span><b>{shipping ? `${shipping} ر.س` : "مجاني"}</b></div>{cartTotal < 150 && <div className="shipping-progress"><p>أضيفي <b>{150 - cartTotal} ر.س</b> واحصلي على شحن مجاني</p><span><i style={{ width: `${Math.min((cartTotal / 150) * 100, 100)}%` }} /></span></div>}<div className="summary-total"><span>الإجمالي</span><b>{cartTotal + shipping} ر.س</b></div><Link className="button primary full" to="/checkout">إتمام الطلب <ArrowLeft /></Link><small>الضرائب مشمولة في السعر</small></aside>
      </div>
    </div>
  );
}
