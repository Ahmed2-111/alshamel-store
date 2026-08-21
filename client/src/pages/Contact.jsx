import { Clock3, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { useStore } from "../context/StoreContext";
import { brandContacts } from "../i18n";

export default function Contact() {
  const { notify } = useStore();
  const [sent, setSent] = useState(false);
  const submit = (event) => {
    event.preventDefault();
    setSent(true);
    notify("وصلتنا رسالتك، سنرد عليك قريبًا");
  };

  return (
    <div className="page container contact-page">
      <div className="page-heading">
        <span className="eyebrow">نحن هنا لخدمتك</span>
        <h1>تواصل معنا</h1>
        <p>سنسعد بالإجابة عن أسئلتك ومتابعة طلباتك</p>
      </div>
      <div className="contact-layout">
        <div className="contact-info">
          <h2>خدمة العملاء</h2>
          <p>سواء كان لديك سؤال عن منتج، طلب قائم، دفع، أو شحن، فريق متجر الشامل قريب منك.</p>
          <div><Mail /><span><small>الحساب</small><b>{brandContacts.handle}</b></span></div>
          <div><Phone /><span><small>للتواصل معنا</small><b>{brandContacts.phone}</b></span></div>
          <div><Phone /><span><small>واتساب</small><b>{brandContacts.whatsapp}</b></span></div>
          <div><Instagram /><span><small>إنستغرام</small><b>{brandContacts.instagram}</b></span></div>
          <div><MapPin /><span><small>العنوان</small><b>صنعاء، الجمهورية اليمنية</b></span></div>
          <div><Clock3 /><span><small>ساعات العمل</small><b>السبت - الخميس، 9 ص - 6 م</b></span></div>
        </div>
        <form className="contact-form" onSubmit={submit}>
          <h2>{sent ? "شكرًا لرسالتك" : "أرسل لنا رسالة"}</h2>
          <div className="form-grid">
            <label>الاسم<input required /></label>
            <label>رقم التواصل<input required /></label>
            <label className="full-span">الموضوع<select><option>استفسار عن منتج</option><option>متابعة طلب</option><option>الدفع والشحن</option><option>اقتراح آخر</option></select></label>
            <label className="full-span">رسالتك<textarea required rows="6" /></label>
          </div>
          <button className="button primary">إرسال الرسالة</button>
        </form>
      </div>
    </div>
  );
}
