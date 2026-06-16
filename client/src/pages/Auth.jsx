import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { useStore } from "../context/StoreContext";

export default function Auth({ mode = "login" }) {
  const isLogin = mode === "login";
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const { login, register, notify } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const set = (key) => (event) => setForm({ ...form, [key]: event.target.value });
  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const data = isLogin ? await login(form) : await register(form);
      notify(isLogin ? "أهلًا بعودتك" : "أهلًا بك في متجر الشامل");
      navigate(data?.role === "admin" ? "/admin" : new URLSearchParams(location.search).get("redirect") || "/");
    } catch (error) { notify(error.message, "error"); } finally { setLoading(false); }
  };
  return <div className="auth-page"><div className="auth-image"><img src="https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1200&q=90" alt="" /><div><span>متجر الشامل</span><blockquote>“كل ما تحتاجه في مكان واحد، بتجربة دفع وشحن مناسبة لليمن والخليج.”</blockquote></div></div><div className="auth-panel"><Link to="/"><Logo /></Link><div className="auth-box"><span className="eyebrow">{isLogin ? "سعداء بعودتك" : "انضم إلى متجر الشامل"}</span><h1>{isLogin ? "تسجيل الدخول" : "إنشاء حساب جديد"}</h1><p>{isLogin ? "أدخل بياناتك للمتابعة إلى حسابك" : "أنشئ حسابك واستمتع بتجربة تسوق احترافية"}</p><form onSubmit={submit}>
    {!isLogin && <><label>الاسم الكامل<div><UserRound /><input required value={form.name} onChange={set("name")} placeholder="اسمكِ الجميل" /></div></label><label>رقم الهاتف<div><UserRound /><input value={form.phone} onChange={set("phone")} placeholder="777 000 000" /></div></label></>}
    <label>البريد الإلكتروني<div><Mail /><input required type="email" value={form.email} onChange={set("email")} placeholder="name@example.com" /></div></label>
    <label>كلمة المرور<div><LockKeyhole /><input required minLength="6" type={show ? "text" : "password"} value={form.password} onChange={set("password")} placeholder="••••••••" /><button type="button" onClick={() => setShow(!show)}>{show ? <EyeOff /> : <Eye />}</button></div></label>
    {isLogin && <div className="form-helper"><label><input type="checkbox" /> تذكريني</label><a href="#">نسيتِ كلمة المرور؟</a></div>}
    <button className="button primary full" disabled={loading}>{loading ? "لحظة من فضلكِ..." : isLogin ? "دخول" : "إنشاء الحساب"}</button>
  </form><div className="auth-switch">{isLogin ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟"} <Link to={isLogin ? "/register" : "/login"}>{isLogin ? "أنشئ حسابًا" : "سجّل الدخول"}</Link></div>{isLogin && <div className="demo-login">Super Admin: <b>owner@alshamel.store</b> / <b>Admin123!</b></div>}</div></div></div>;
}
