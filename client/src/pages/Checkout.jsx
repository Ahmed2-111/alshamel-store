import { Check, CreditCard, LockKeyhole, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import api from "../api";
import { useStore } from "../context/StoreContext";
import { countries, currencies } from "../i18n";

const localProofMethods = ["jaib", "floosk", "kuraimi"];

export default function Checkout() {
  const { cart, cartTotal, user, clearCart, notify, language, country, setCountry, currency, setCurrency, t } = useStore();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [proof, setProof] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "", city: "", street: "", details: "", paymentMethod: "cod", transactionNumber: "" });
  const set = (key) => (event) => setForm({ ...form, [key]: event.target.value });

  useEffect(() => {
    api.get("/store/payment-methods").then(({ data }) => setPaymentMethods(data)).catch(() => setPaymentMethods([
      { key: "cod", name: "الدفع عند الاستلام", type: "cod", isActive: true },
      { key: "paypal", name: "PayPal", type: "paypal", isActive: true },
      { key: "jaib", name: "محفظة جيب", type: "wallet", isActive: true },
      { key: "floosk", name: "محفظة فلوسك", type: "wallet", isActive: true },
      { key: "kuraimi", name: "بنك الكريمي", type: "bank", isActive: true }
    ]));
  }, []);

  if (!user) return <Navigate to="/login?redirect=/checkout" replace />;
  if (!cart.length) return <Navigate to="/cart" replace />;

  const discount = coupon?.discount || 0;
  const shipping = Math.max(cartTotal - discount, 0) >= 150 ? 0 : 15;
  const total = Math.max(cartTotal - discount, 0) + shipping;

  const applyCoupon = async () => {
    try {
      const { data } = await api.post("/store/coupons/validate", { code: couponCode, total: cartTotal });
      setCoupon(data);
      notify(language === "ar" ? "تم تطبيق الكوبون" : "Coupon applied");
    } catch (error) {
      notify(error.message, "error");
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post("/orders", {
        items: cart.map((item) => ({ product: item._id, quantity: item.quantity })),
        shippingAddress: { name: form.name, phone: form.phone, country, city: form.city, street: form.street, details: form.details },
        paymentMethod: form.paymentMethod,
        couponCode: coupon?.code,
        country,
        currency
      });
      if (localProofMethods.includes(form.paymentMethod) && (proof || form.transactionNumber)) {
        const fd = new FormData();
        if (proof) fd.append("proof", proof);
        fd.append("transactionNumber", form.transactionNumber);
        await api.post(`/orders/${data._id}/payment-proof`, fd);
      }
      clearCart();
      navigate(`/order-success/${data._id}`);
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page checkout-page container">
      <div className="checkout-steps"><span className="done"><Check /> {t("cart")}</span><i /><span className="active">2 {t("checkout")}</span><i /><span>3 {language === "ar" ? "تأكيد" : "Confirm"}</span></div>
      <form onSubmit={submit} className="checkout-layout">
        <div>
          <section className="checkout-card">
            <h2>{language === "ar" ? "بيانات التوصيل" : "Shipping Details"}</h2>
            <div className="form-grid">
              <label>{language === "ar" ? "الاسم الكامل" : "Full name"}<input required value={form.name} onChange={set("name")} /></label>
              <label>{language === "ar" ? "رقم الهاتف" : "Phone"}<input required value={form.phone} onChange={set("phone")} /></label>
              <label>{t("country")}<select value={country} onChange={(e) => setCountry(e.target.value)}>{countries.map((item) => <option key={item.code} value={item.code}>{language === "ar" ? item.ar : item.en}</option>)}</select></label>
              <label>{t("currency")}<select value={currency} onChange={(e) => setCurrency(e.target.value)}>{currencies.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label>{language === "ar" ? "المدينة" : "City"}<input required value={form.city} onChange={set("city")} /></label>
              <label>{language === "ar" ? "الشارع / الحي" : "Street"}<input required value={form.street} onChange={set("street")} /></label>
              <label className="full-span">{language === "ar" ? "تفاصيل إضافية" : "Extra details"}<textarea value={form.details} onChange={set("details")} /></label>
            </div>
          </section>

          <section className="checkout-card">
            <div className="card-title"><h2>{language === "ar" ? "وسيلة الدفع" : "Payment Method"}</h2><CreditCard /></div>
            <div className="payment-method-grid">
              {paymentMethods.map((method) => <label key={method.key} className={form.paymentMethod === method.key ? "active" : ""}><input type="radio" name="payment" value={method.key} checked={form.paymentMethod === method.key} onChange={set("paymentMethod")} />{method.translations?.[language]?.name || method.name}</label>)}
            </div>
            {localProofMethods.includes(form.paymentMethod) && <div className="proof-box"><label>{language === "ar" ? "رقم العملية" : "Transaction number"}<input value={form.transactionNumber} onChange={set("transactionNumber")} /></label><label className="upload-proof"><Upload /> {language === "ar" ? "رفع إثبات الدفع" : "Upload payment proof"}<input type="file" accept="image/*" onChange={(e) => setProof(e.target.files?.[0])} /></label>{proof && <small>{proof.name}</small>}</div>}
          </section>
        </div>

        <aside className="order-summary checkout-summary">
          <h2>{language === "ar" ? "طلبك" : "Your Order"}</h2>
          {cart.map((item) => <div className="checkout-item" key={item._id}><span className="checkout-thumb"><img src={item.images[0]} alt="" /><i>{item.quantity}</i></span><span>{item.name}</span><b>{(item.salePrice || item.price) * item.quantity} {currency}</b></div>)}
          <div className="coupon-row"><input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder={language === "ar" ? "كود الخصم" : "Coupon code"} /><button type="button" onClick={applyCoupon}>{language === "ar" ? "تطبيق" : "Apply"}</button></div>
          <hr /><div><span>{language === "ar" ? "المجموع" : "Subtotal"}</span><b>{cartTotal} {currency}</b></div><div><span>{language === "ar" ? "الخصم" : "Discount"}</span><b>-{discount} {currency}</b></div><div><span>{language === "ar" ? "الشحن" : "Shipping"}</span><b>{shipping ? `${shipping} ${currency}` : language === "ar" ? "مجاني" : "Free"}</b></div><div className="summary-total"><span>{language === "ar" ? "الإجمالي" : "Total"}</span><b>{total} {currency}</b></div>
          <button className="button primary full" disabled={submitting}><LockKeyhole /> {submitting ? (language === "ar" ? "جارٍ إنشاء الطلب..." : "Creating order...") : t("checkout")}</button>
        </aside>
      </form>
    </div>
  );
}
