import { useEffect, useMemo, useState } from "react";
import { Activity, BadgePercent, Boxes, CreditCard, FolderTree, Image, LayoutDashboard, LogOut, Package, Plus, Search, Settings, Shield, ShoppingCart, Truck, Users } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "../api";
import Logo from "../components/Logo";
import { useStore } from "../context/StoreContext";

const orderStatuses = ["new", "pending", "processing", "shipped", "delivered", "cancelled"];
const paymentStatuses = ["unpaid", "awaiting_confirmation", "paid", "rejected"];
const permissionKeys = ["products", "categories", "orders", "customers", "marketing", "settings", "staff", "reports"];

export default function Admin() {
  const { user, logout, notify, t, language } = useStore();
  const [section, setSection] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [data, setData] = useState({ products: [], categories: [], orders: [], users: [], banners: [], offers: [], coupons: [], shipping: [], payments: [], activity: [], settings: null });
  const [productForm, setProductForm] = useState({ name: "", slug: "", brand: "", description: "", price: "", salePrice: "", stock: "", sku: "", category: "", images: "" });
  const [files, setFiles] = useState([]);
  const [generic, setGeneric] = useState({});

  const menu = [
    ["dashboard", LayoutDashboard, t("dashboard")],
    ["products", Package, t("products")],
    ["categories", FolderTree, t("categories")],
    ["orders", ShoppingCart, t("orders")],
    ["customers", Users, t("customers")],
    ["banners", Image, t("banners")],
    ["offers", BadgePercent, t("offers")],
    ["coupons", BadgePercent, t("coupons")],
    ["shipping", Truck, t("shipping")],
    ["payments", CreditCard, t("payments")],
    ["settings", Settings, t("settings")],
    ["staff", Shield, t("staff")],
    ["activity", Activity, t("activity")]
  ];

  const chartData = useMemo(() => stats?.monthlySales?.map((x) => ({ name: `${x._id.month}/${x._id.year}`, sales: x.sales })) || [{ name: "1", sales: 0 }], [stats]);

  const load = async () => {
    try {
      const [dashboard, products, categories, orders, users, banners, offers, coupons, shipping, payments, settings, activity] = await Promise.all([
        api.get("/admin/dashboard"),
        api.get("/products/admin/all"),
        api.get("/categories"),
        api.get("/orders"),
        api.get("/admin/users"),
        api.get("/manage/banners"),
        api.get("/manage/offers"),
        api.get("/manage/coupons"),
        api.get("/manage/shipping"),
        api.get("/manage/payment-methods"),
        api.get("/manage/settings"),
        api.get("/manage/activity")
      ]);
      setStats(dashboard.data);
      setData({ products: products.data, categories: categories.data, orders: orders.data, users: users.data, banners: banners.data, offers: offers.data, coupons: coupons.data, shipping: shipping.data, payments: payments.data, settings: settings.data, activity: activity.data });
    } catch (error) {
      notify(error.message, "error");
    }
  };

  useEffect(() => { load(); }, []);

  const saveProduct = async (event) => {
    event.preventDefault();
    try {
      if (files.length) {
        const fd = new FormData();
        Object.entries(productForm).forEach(([k, v]) => v !== "" && fd.append(k, v));
        files.forEach((file) => fd.append("images", file));
        await api.post("/products", fd);
      } else {
        await api.post("/products", { ...productForm, price: Number(productForm.price), salePrice: Number(productForm.salePrice || 0), stock: Number(productForm.stock), images: productForm.images.split(",").map((x) => x.trim()).filter(Boolean) });
      }
      setProductForm({ name: "", slug: "", brand: "", description: "", price: "", salePrice: "", stock: "", sku: "", category: "", images: "" });
      setFiles([]);
      notify(language === "ar" ? "تم حفظ المنتج" : "Product saved");
      load();
    } catch (error) { notify(error.message, "error"); }
  };

  const deleteProduct = async (id) => { await api.delete(`/products/${id}`); notify(language === "ar" ? "تم حذف المنتج" : "Product deleted"); load(); };
  const updateOrder = async (id, status) => { await api.patch(`/orders/${id}/status`, { status }); load(); };
  const updatePayment = async (id, paymentStatus) => { await api.patch(`/orders/${id}/payment`, { paymentStatus }); load(); };
  const saveGeneric = async (endpoint, payload = generic) => { await api.post(`/manage/${endpoint}`, payload); setGeneric({}); notify(language === "ar" ? "تم الحفظ" : "Saved"); load(); };
  const deleteGeneric = async (endpoint, id) => { await api.delete(`/manage/${endpoint}/${id}`); notify(language === "ar" ? "تم الحذف" : "Deleted"); load(); };

  return (
    <div className="admin-shell" dir={language === "ar" ? "rtl" : "ltr"}>
      <aside className="admin-sidebar"><Logo /><nav>{menu.map(([key, Icon, label]) => <button className={section === key ? "active" : ""} key={key} onClick={() => setSection(key)}><Icon /> {label}</button>)}</nav><button className="admin-logout" onClick={logout}><LogOut /> {language === "ar" ? "خروج" : "Logout"}</button></aside>
      <main className="admin-main">
        <header><div><small>{language === "ar" ? "مرحبًا" : "Welcome"}</small><h2>{user.name}</h2></div><div className="admin-search"><Search /><input placeholder={language === "ar" ? "بحث..." : "Search..."} /></div></header>
        {section === "dashboard" && <Dashboard stats={stats} chartData={chartData} data={data} language={language} />}
        {section === "products" && <section><Title title={t("products")} subtitle={language === "ar" ? "إدارة المنتجات والمخزون والأسعار" : "Manage products, stock, and prices"} /><form className="admin-form-grid" onSubmit={saveProduct}><input required placeholder={language === "ar" ? "اسم المنتج" : "Product name"} value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} /><input required placeholder="slug" value={productForm.slug} onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })} /><input placeholder={language === "ar" ? "العلامة التجارية" : "Brand"} value={productForm.brand} onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })} /><select required value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}><option value="">{t("categories")}</option>{data.categories.map((c) => <option value={c._id} key={c._id}>{c.name}</option>)}</select><input required type="number" placeholder={language === "ar" ? "السعر الأصلي" : "Original price"} value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} /><input type="number" placeholder={language === "ar" ? "سعر التخفيض" : "Sale price"} value={productForm.salePrice} onChange={(e) => setProductForm({ ...productForm, salePrice: e.target.value })} /><input required type="number" placeholder={language === "ar" ? "الكمية" : "Stock"} value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} /><input placeholder="SKU" value={productForm.sku} onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })} /><input className="wide" placeholder={language === "ar" ? "روابط الصور أو ارفع ملفات" : "Image URLs or upload files"} value={productForm.images} onChange={(e) => setProductForm({ ...productForm, images: e.target.value })} /><input type="file" multiple accept="image/*,video/*" onChange={(e) => setFiles([...e.target.files])} /><textarea className="wide" required placeholder={language === "ar" ? "الوصف" : "Description"} value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} /><button className="button primary"><Plus /> {language === "ar" ? "حفظ المنتج" : "Save Product"}</button></form><ProductTable products={data.products} onDelete={deleteProduct} language={language} /></section>}
        {section === "categories" && <GenericManager title={t("categories")} endpoint="categories" items={data.categories} fields={["name", "slug", "image", "sortOrder"]} generic={generic} setGeneric={setGeneric} onSave={async () => { await api.post("/categories", generic); setGeneric({}); load(); }} onDelete={async (id) => { await api.delete(`/categories/${id}`); load(); }} />}
        {section === "orders" && <Orders orders={data.orders} updateOrder={updateOrder} updatePayment={updatePayment} language={language} />}
        {section === "customers" && <UsersTable users={data.users.filter((x) => x.role === "customer")} language={language} reload={load} />}
        {section === "staff" && <Staff users={data.users.filter((x) => x.role !== "customer")} language={language} reload={load} />}
        {section === "banners" && <GenericManager title={t("banners")} endpoint="banners" items={data.banners} fields={["title", "subtitle", "image", "link", "placement", "startsAt", "endsAt"]} generic={generic} setGeneric={setGeneric} onSave={() => saveGeneric("banners")} onDelete={(id) => deleteGeneric("banners", id)} />}
        {section === "offers" && <GenericManager title={t("offers")} endpoint="offers" items={data.offers} fields={["name", "type", "discountType", "value", "startsAt", "endsAt"]} generic={generic} setGeneric={setGeneric} onSave={() => saveGeneric("offers")} onDelete={(id) => deleteGeneric("offers", id)} />}
        {section === "coupons" && <GenericManager title={t("coupons")} endpoint="coupons" items={data.coupons} fields={["code", "discountType", "value", "startsAt", "endsAt", "usageLimit", "minOrderTotal"]} generic={generic} setGeneric={setGeneric} onSave={() => saveGeneric("coupons")} onDelete={(id) => deleteGeneric("coupons", id)} />}
        {section === "shipping" && <GenericManager title={t("shipping")} endpoint="shipping" items={data.shipping} fields={["country", "city", "currency", "fee", "freeAbove"]} generic={generic} setGeneric={setGeneric} onSave={() => saveGeneric("shipping")} onDelete={(id) => deleteGeneric("shipping", id)} />}
        {section === "payments" && <GenericManager title={t("payments")} endpoint="payment-methods" items={data.payments} fields={["key", "name", "type", "accountName", "accountNumber", "qrCode", "instructions"]} generic={generic} setGeneric={setGeneric} onSave={() => saveGeneric("payment-methods")} onDelete={(id) => deleteGeneric("payment-methods", id)} />}
        {section === "settings" && <SettingsPanel settings={data.settings} language={language} reload={load} notify={notify} />}
        {section === "activity" && <ActivityTable items={data.activity} language={language} />}
      </main>
    </div>
  );
}

function Title({ title, subtitle }) { return <div className="admin-title"><div><span>{subtitle}</span><h1>{title}</h1></div></div>; }
function Dashboard({ stats, chartData, data, language }) {
  return <><Title title={language === "ar" ? "لوحة التحكم" : "Dashboard"} subtitle={language === "ar" ? "نظرة عامة على المتجر" : "Store overview"} /><div className="stats-grid"><Stat icon={ShoppingCart} label={language === "ar" ? "الطلبات" : "Orders"} value={stats?.orderCount || 0} /><Stat icon={Users} label={language === "ar" ? "العملاء" : "Customers"} value={stats?.customerCount || 0} /><Stat icon={Package} label={language === "ar" ? "المنتجات" : "Products"} value={stats?.productCount || data.products.length} /><Stat icon={Boxes} label={language === "ar" ? "المبيعات" : "Sales"} value={stats?.totalSales || 0} /></div><section className="chart-card"><h3>{language === "ar" ? "المبيعات الشهرية" : "Monthly Sales"}</h3><ResponsiveContainer width="100%" height={280}><AreaChart data={chartData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" /><YAxis /><Tooltip /><Area type="monotone" dataKey="sales" stroke="#bd9144" fill="#bd914455" /></AreaChart></ResponsiveContainer></section></>;
}
function Stat({ icon: Icon, label, value }) { return <article className="stat-card"><span><Icon /></span><div><small>{label}</small><strong>{value}</strong></div></article>; }
function ProductTable({ products, onDelete, language }) { return <div className="admin-table"><table><thead><tr><th>{language === "ar" ? "المنتج" : "Product"}</th><th>SKU</th><th>{language === "ar" ? "السعر" : "Price"}</th><th>{language === "ar" ? "المخزون" : "Stock"}</th><th></th></tr></thead><tbody>{products.map((p) => <tr key={p._id}><td><div className="table-product"><img src={p.images?.[0]} /><b>{p.name}</b></div></td><td>{p.sku}</td><td>{p.salePrice || p.price}</td><td><span className={`stock-badge ${p.stock <= p.lowStockThreshold ? "low" : ""}`}>{p.stock}</span></td><td><button className="danger-link" onClick={() => onDelete(p._id)}>{language === "ar" ? "حذف" : "Delete"}</button></td></tr>)}</tbody></table></div>; }
function Orders({ orders, updateOrder, updatePayment, language }) { return <section><Title title={language === "ar" ? "إدارة الطلبات" : "Orders"} subtitle={language === "ar" ? "بحث وتصفية وتغيير الحالات" : "Filter and update statuses"} /><div className="admin-table"><table><thead><tr><th>#</th><th>{language === "ar" ? "العميل" : "Customer"}</th><th>{language === "ar" ? "الإجمالي" : "Total"}</th><th>{language === "ar" ? "الطلب" : "Order"}</th><th>{language === "ar" ? "الدفع" : "Payment"}</th></tr></thead><tbody>{orders.map((o) => <tr key={o._id}><td>{o._id.slice(-6).toUpperCase()}</td><td>{o.user?.name}</td><td>{o.total} {o.currency}</td><td><select value={o.status} onChange={(e) => updateOrder(o._id, e.target.value)}>{orderStatuses.map((s) => <option key={s}>{s}</option>)}</select></td><td><select value={o.paymentStatus} onChange={(e) => updatePayment(o._id, e.target.value)}>{paymentStatuses.map((s) => <option key={s}>{s}</option>)}</select></td></tr>)}</tbody></table></div></section>; }
function GenericManager({ title, items, fields, generic, setGeneric, onSave, onDelete }) { return <section><Title title={title} subtitle="Management" /><form className="admin-form-grid" onSubmit={(e) => { e.preventDefault(); onSave(); }}>{fields.map((field) => <input key={field} placeholder={field} value={generic[field] || ""} onChange={(e) => setGeneric({ ...generic, [field]: e.target.value })} />)}<button className="button primary"><Plus /> Save</button></form><div className="admin-table"><table><thead><tr>{fields.slice(0, 4).map((f) => <th key={f}>{f}</th>)}<th></th></tr></thead><tbody>{items.map((item) => <tr key={item._id}>{fields.slice(0, 4).map((f) => <td key={f}>{String(item[f] ?? "")}</td>)}<td><button className="danger-link" onClick={() => onDelete(item._id)}>Delete</button></td></tr>)}</tbody></table></div></section>; }
function UsersTable({ users, language, reload }) { const toggle = async (u) => { await api.patch(`/admin/users/${u._id}/status`, { isActive: !u.isActive }); reload(); }; return <section><Title title={language === "ar" ? "العملاء" : "Customers"} subtitle={language === "ar" ? "عرض العملاء وحظر الحسابات" : "View and block customers"} /><div className="admin-table"><table><tbody>{users.map((u) => <tr key={u._id}><td><b>{u.name}</b></td><td>{u.email}</td><td>{u.phone}</td><td><button onClick={() => toggle(u)}>{u.isActive ? (language === "ar" ? "حظر" : "Block") : (language === "ar" ? "تفعيل" : "Activate")}</button></td></tr>)}</tbody></table></div></section>; }
function Staff({ users, language, reload }) { const [form, setForm] = useState({ name: "", email: "", password: "Admin123!", role: "employee" }); const create = async (e) => { e.preventDefault(); await api.post("/admin/users", form); setForm({ name: "", email: "", password: "Admin123!", role: "employee" }); reload(); }; return <section><Title title={language === "ar" ? "الموظفون والصلاحيات" : "Staff & Roles"} subtitle="Super Admin / Admin / Employee" /><form className="admin-form-grid" onSubmit={create}><input required placeholder="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /><input required placeholder="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /><input required placeholder="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /><select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option>employee</option><option>admin</option><option>super_admin</option></select><button className="button primary">Create</button></form><div className="permission-list">{permissionKeys.map((p) => <span key={p}>{p}</span>)}</div><UsersTable users={users} language={language} reload={reload} /></section>; }
function SettingsPanel({ settings, reload, notify }) { const [form, setForm] = useState(settings || {}); useEffect(() => setForm(settings || {}), [settings]); const save = async (e) => { e.preventDefault(); await api.put("/manage/settings", form); notify("Saved"); reload(); }; return <section><Title title="Settings" subtitle="Store information, logo, policies, social links" /><form className="admin-form-grid" onSubmit={save}><input placeholder="storeName" value={form.storeName || ""} onChange={(e) => setForm({ ...form, storeName: e.target.value })} /><input placeholder="logo URL" value={form.logo || ""} onChange={(e) => setForm({ ...form, logo: e.target.value })} /><input placeholder="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} /><textarea className="wide" placeholder="privacyPolicy" value={form.privacyPolicy || ""} onChange={(e) => setForm({ ...form, privacyPolicy: e.target.value })} /><textarea className="wide" placeholder="terms" value={form.terms || ""} onChange={(e) => setForm({ ...form, terms: e.target.value })} /><button className="button primary">Save</button></form></section>; }
function ActivityTable({ items, language }) { return <section><Title title={language === "ar" ? "سجل النشاط" : "Activity Log"} subtitle={language === "ar" ? "كل عمليات الفريق" : "Staff operations"} /><div className="admin-table"><table><tbody>{items.map((item) => <tr key={item._id}><td>{new Date(item.createdAt).toLocaleString()}</td><td>{item.actorName}</td><td>{item.action}</td><td>{item.description}</td></tr>)}</tbody></table></div></section>; }
