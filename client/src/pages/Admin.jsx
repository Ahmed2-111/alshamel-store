import { useEffect, useMemo, useState } from "react";
import { Activity, BadgePercent, Boxes, CreditCard, Edit3, FolderTree, Image, LayoutDashboard, LogOut, Package, Plus, RefreshCw, Save, Search, Settings, Shield, ShoppingCart, Trash2, Truck, Users, X } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "../api";
import Logo from "../components/Logo";
import { useStore } from "../context/StoreContext";

const orderStatuses = ["new", "pending", "processing", "shipped", "delivered", "cancelled"];
const paymentStatuses = ["unpaid", "awaiting_confirmation", "paid", "rejected"];
const permissionKeys = ["products", "categories", "orders", "customers", "marketing", "settings", "staff", "reports"];
const emptyProduct = { name: "", slug: "", brand: "", description: "", price: "", originalPrice: "", salePrice: "", discountPercent: "", stock: "", lowStockThreshold: "5", sku: "", category: "", images: "", video: "", colors: "", sizes: "", weight: "", status: "active", featured: false };

const genericConfigs = {
  categories: { endpoint: "categories", direct: true, fields: ["name", "slug", "image", "sortOrder"] },
  banners: { endpoint: "banners", fields: ["title", "subtitle", "image", "link", "placement", "startsAt", "endsAt", "sortOrder"] },
  offers: { endpoint: "offers", fields: ["name", "type", "discountType", "value", "startsAt", "endsAt"] },
  coupons: { endpoint: "coupons", fields: ["code", "discountType", "value", "startsAt", "endsAt", "usageLimit", "minOrderTotal"] },
  shipping: { endpoint: "shipping", fields: ["country", "city", "currency", "fee", "freeAbove"] },
  payments: { endpoint: "payment-methods", fields: ["key", "name", "type", "accountName", "accountNumber", "qrCode", "instructions"] }
};

function toNumber(value, fallback = undefined) {
  if (value === "" || value === null || value === undefined) return fallback;
  return Number(value);
}

function splitList(value = "") {
  return value.split(",").map((x) => x.trim()).filter(Boolean);
}

function toProductForm(product) {
  return {
    name: product.name || "",
    slug: product.slug || "",
    brand: product.brand || "",
    description: product.description || "",
    price: product.price ?? "",
    originalPrice: product.originalPrice ?? "",
    salePrice: product.salePrice ?? "",
    discountPercent: product.discountPercent ?? "",
    stock: product.stock ?? "",
    lowStockThreshold: product.lowStockThreshold ?? "5",
    sku: product.sku || "",
    category: product.category?._id || product.category || "",
    images: product.images?.join(", ") || "",
    video: product.video || "",
    colors: product.colors?.join(", ") || "",
    sizes: product.sizes?.join(", ") || "",
    weight: product.weight ?? "",
    status: product.status || "active",
    featured: Boolean(product.featured)
  };
}

function productPayload(form) {
  const payload = {
    ...form,
    price: toNumber(form.price, 0),
    stock: toNumber(form.stock, 0),
    lowStockThreshold: toNumber(form.lowStockThreshold, 5),
    images: splitList(form.images),
    colors: splitList(form.colors),
    sizes: splitList(form.sizes),
    featured: Boolean(form.featured)
  };
  ["originalPrice", "salePrice", "discountPercent", "weight"].forEach((key) => {
    const value = toNumber(form[key]);
    if (value === undefined) delete payload[key];
    else payload[key] = value;
  });
  if (!payload.slug) delete payload.slug;
  if (!payload.video) delete payload.video;
  return payload;
}

export default function Admin() {
  const { user, logout, notify, t, language } = useStore();
  const [section, setSection] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [data, setData] = useState({ products: [], categories: [], orders: [], users: [], banners: [], offers: [], coupons: [], shipping: [], payments: [], activity: [], settings: null });
  const [productForm, setProductForm] = useState(emptyProduct);
  const [editingProductId, setEditingProductId] = useState(null);
  const [files, setFiles] = useState([]);
  const [generic, setGeneric] = useState({});
  const [editingGenericId, setEditingGenericId] = useState(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const sectionTitles = { dashboard: t("dashboard"), products: t("products"), categories: t("categories"), orders: t("orders"), customers: t("customers"), banners: t("banners"), offers: t("offers"), coupons: t("coupons"), shipping: t("shipping"), payments: t("payments"), settings: t("settings"), staff: t("staff"), activity: t("activity") };
  const menu = [
    ["dashboard", LayoutDashboard], ["products", Package], ["categories", FolderTree], ["orders", ShoppingCart], ["customers", Users], ["banners", Image], ["offers", BadgePercent], ["coupons", BadgePercent], ["shipping", Truck], ["payments", CreditCard], ["settings", Settings], ["staff", Shield], ["activity", Activity]
  ];

  const chartData = useMemo(() => stats?.monthlySales?.map((x) => ({ name: `${x._id.month}/${x._id.year}`, sales: x.sales })) || [{ name: "1", sales: 0 }], [stats]);

  const load = async () => {
    setLoading(true);
    try {
      const [dashboard, products, categories, orders, users, banners, offers, coupons, shipping, payments, settings, activity] = await Promise.all([
        api.get("/admin/dashboard"), api.get("/products/admin/all"), api.get("/categories"), api.get("/orders"), api.get("/admin/users"), api.get("/manage/banners"), api.get("/manage/offers"), api.get("/manage/coupons"), api.get("/manage/shipping"), api.get("/manage/payment-methods"), api.get("/manage/settings"), api.get("/manage/activity")
      ]);
      setStats(dashboard.data);
      setData({ products: products.data, categories: categories.data, orders: orders.data, users: users.data, banners: banners.data, offers: offers.data, coupons: coupons.data, shipping: shipping.data, payments: payments.data, settings: settings.data, activity: activity.data });
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resetProduct = () => {
    setProductForm(emptyProduct);
    setEditingProductId(null);
    setFiles([]);
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    try {
      if (files.length) {
        const fd = new FormData();
        Object.entries(productPayload(productForm)).forEach(([k, v]) => fd.append(k, Array.isArray(v) ? v.join(",") : v));
        files.forEach((file) => fd.append("images", file));
        editingProductId ? await api.put(`/products/${editingProductId}`, fd) : await api.post("/products", fd);
      } else {
        editingProductId ? await api.put(`/products/${editingProductId}`, productPayload(productForm)) : await api.post("/products", productPayload(productForm));
      }
      notify(editingProductId ? "تم تعديل المنتج" : "تم حفظ المنتج");
      resetProduct();
      load();
    } catch (error) { notify(error.message, "error"); }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف المنتج؟")) return;
    await api.delete(`/products/${id}`);
    notify("تم حذف المنتج");
    load();
  };

  const updateOrder = async (id, status) => { await api.patch(`/orders/${id}/status`, { status }); load(); };
  const updatePayment = async (id, paymentStatus) => { await api.patch(`/orders/${id}/payment`, { paymentStatus }); load(); };
  const visibleProducts = data.products.filter((p) => [p.name, p.sku, p.brand, p.category?.name].join(" ").toLowerCase().includes(query.toLowerCase()));

  return <div className="admin-shell" dir={language === "ar" ? "rtl" : "ltr"}>
    <aside className="admin-sidebar"><Logo /><nav>{menu.map(([key, Icon]) => <button className={section === key ? "active" : ""} key={key} onClick={() => { setSection(key); setQuery(""); setEditingGenericId(null); setGeneric({}); }}><Icon /> {sectionTitles[key]}</button>)}</nav><button className="admin-logout" onClick={logout}><LogOut /> خروج</button></aside>
    <main className="admin-main">
      <header><div><small>مرحبًا</small><h2>{user.name}</h2></div><div className="admin-search"><Search /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="بحث..." /></div><div className="admin-header-actions"><button className="icon-button" onClick={load} title="تحديث"><RefreshCw className={loading ? "spin" : ""} /></button><button className="button ghost admin-header-logout" onClick={logout}><LogOut /> خروج</button></div></header>
      {section === "dashboard" && <Dashboard stats={stats} chartData={chartData} data={data} />}
      {section === "products" && <ProductsPanel products={visibleProducts} categories={data.categories} form={productForm} setForm={setProductForm} files={files} setFiles={setFiles} editingId={editingProductId} onSave={saveProduct} onCancel={resetProduct} onEdit={(p) => { setProductForm(toProductForm(p)); setEditingProductId(p._id); window.scrollTo({ top: 0, behavior: "smooth" }); }} onDelete={deleteProduct} />}
      {section === "categories" && <GenericManager config={genericConfigs.categories} title={sectionTitles.categories} items={data.categories} generic={generic} setGeneric={setGeneric} editingId={editingGenericId} setEditingId={setEditingGenericId} reload={load} notify={notify} />}
      {section === "orders" && <Orders orders={data.orders} updateOrder={updateOrder} updatePayment={updatePayment} />}
      {section === "customers" && <UsersTable users={data.users.filter((x) => x.role === "customer")} reload={load} />}
      {section === "staff" && <Staff users={data.users.filter((x) => x.role !== "customer")} reload={load} notify={notify} />}
      {["banners", "offers", "coupons", "shipping", "payments"].includes(section) && <GenericManager config={genericConfigs[section]} title={sectionTitles[section]} items={data[section]} generic={generic} setGeneric={setGeneric} editingId={editingGenericId} setEditingId={setEditingGenericId} reload={load} notify={notify} />}
      {section === "settings" && <SettingsPanel settings={data.settings} reload={load} notify={notify} />}
      {section === "activity" && <ActivityTable items={data.activity} />}
    </main>
  </div>;
}

function Title({ title, subtitle, action }) { return <div className="admin-title"><div><span>{subtitle}</span><h1>{title}</h1></div>{action}</div>; }
function Dashboard({ stats, chartData, data }) { return <><Title title="لوحة التحكم" subtitle="نظرة عامة على المتجر" /><div className="stats-grid"><Stat icon={ShoppingCart} label="الطلبات" value={stats?.orderCount || 0} /><Stat icon={Users} label="العملاء" value={stats?.customerCount || 0} /><Stat icon={Package} label="المنتجات" value={stats?.productCount || data.products.length} /><Stat icon={Boxes} label="المبيعات" value={stats?.totalSales || 0} /></div><section className="chart-card"><h3>المبيعات الشهرية</h3><ResponsiveContainer width="100%" height={280}><AreaChart data={chartData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" /><YAxis /><Tooltip /><Area type="monotone" dataKey="sales" stroke="#bd9144" fill="#bd914455" /></AreaChart></ResponsiveContainer></section></>; }
function Stat({ icon: Icon, label, value }) { return <article className="stat-card"><span><Icon /></span><div><small>{label}</small><strong>{value}</strong></div></article>; }

function ProductsPanel({ products, categories, form, setForm, files, setFiles, editingId, onSave, onCancel, onEdit, onDelete }) {
  const set = (key) => (event) => setForm({ ...form, [key]: event.target.type === "checkbox" ? event.target.checked : event.target.value });
  return <section><Title title="إدارة المنتجات" subtitle="إضافة وتعديل وحذف المنتجات والمخزون والأسعار" action={editingId && <button className="button ghost" onClick={onCancel}><X /> إلغاء التعديل</button>} /><form className="admin-form-grid product-editor" onSubmit={onSave}>
    <input required placeholder="اسم المنتج" value={form.name} onChange={set("name")} /><input placeholder="slug اختياري" value={form.slug} onChange={set("slug")} /><input placeholder="العلامة التجارية" value={form.brand} onChange={set("brand")} />
    <select required value={form.category} onChange={set("category")}><option value="">اختر التصنيف</option>{categories.map((c) => <option value={c._id} key={c._id}>{c.name}</option>)}</select>
    <input required type="number" min="0" placeholder="السعر" value={form.price} onChange={set("price")} /><input type="number" min="0" placeholder="السعر الأصلي" value={form.originalPrice} onChange={set("originalPrice")} /><input type="number" min="0" placeholder="سعر التخفيض" value={form.salePrice} onChange={set("salePrice")} /><input type="number" min="0" max="100" placeholder="نسبة الخصم" value={form.discountPercent} onChange={set("discountPercent")} />
    <input required type="number" min="0" placeholder="الكمية" value={form.stock} onChange={set("stock")} /><input type="number" min="0" placeholder="تنبيه انخفاض المخزون" value={form.lowStockThreshold} onChange={set("lowStockThreshold")} /><input placeholder="SKU" value={form.sku} onChange={set("sku")} /><input type="number" min="0" placeholder="الوزن" value={form.weight} onChange={set("weight")} />
    <input className="wide" placeholder="روابط الصور مفصولة بفواصل" value={form.images} onChange={set("images")} /><input placeholder="رابط فيديو اختياري" value={form.video} onChange={set("video")} /><input placeholder="الألوان: ذهبي، أسود..." value={form.colors} onChange={set("colors")} /><input placeholder="المقاسات: S, M, L" value={form.sizes} onChange={set("sizes")} />
    <select value={form.status} onChange={set("status")}><option value="active">نشط</option><option value="draft">مسودة</option><option value="out_of_stock">غير متوفر</option><option value="archived">مؤرشف</option></select><label className="check-row"><input type="checkbox" checked={form.featured} onChange={set("featured")} /> منتج مميز</label><input type="file" multiple accept="image/*,video/*" onChange={(e) => setFiles([...e.target.files])} />
    <textarea className="wide" required placeholder="الوصف" value={form.description} onChange={set("description")} />{files.length > 0 && <small className="wide">{files.length} ملفات جاهزة للرفع</small>}<button className="button primary"><Save /> {editingId ? "تعديل المنتج" : "حفظ المنتج"}</button>
  </form><ProductTable products={products} onEdit={onEdit} onDelete={onDelete} /></section>;
}
function ProductTable({ products, onEdit, onDelete }) { return <div className="admin-table"><table><thead><tr><th>المنتج</th><th>التصنيف</th><th>SKU</th><th>السعر</th><th>المخزون</th><th>الحالة</th><th></th></tr></thead><tbody>{products.map((p) => <tr key={p._id}><td><div className="table-product"><img src={p.images?.[0]} /><b>{p.name}</b></div></td><td>{p.category?.name || "-"}</td><td>{p.sku || "-"}</td><td>{p.salePrice || p.price}</td><td><span className={`stock-badge ${p.stock <= p.lowStockThreshold ? "low" : ""}`}>{p.stock}</span></td><td>{p.status}</td><td className="row-actions"><button onClick={() => onEdit(p)}><Edit3 /> تعديل</button><button className="danger-link" onClick={() => onDelete(p._id)}><Trash2 /> حذف</button></td></tr>)}</tbody></table></div>; }
function Orders({ orders, updateOrder, updatePayment }) { return <section><Title title="إدارة الطلبات" subtitle="تغيير حالات الطلب والدفع" /><div className="admin-table"><table><thead><tr><th>#</th><th>العميل</th><th>الإجمالي</th><th>الطلب</th><th>الدفع</th></tr></thead><tbody>{orders.map((o) => <tr key={o._id}><td>{o._id.slice(-6).toUpperCase()}</td><td>{o.user?.name || "-"}</td><td>{o.total} {o.currency}</td><td><select value={o.status} onChange={(e) => updateOrder(o._id, e.target.value)}>{orderStatuses.map((s) => <option key={s}>{s}</option>)}</select></td><td><select value={o.paymentStatus} onChange={(e) => updatePayment(o._id, e.target.value)}>{paymentStatuses.map((s) => <option key={s}>{s}</option>)}</select></td></tr>)}</tbody></table></div></section>; }

function GenericManager({ config, title, items, generic, setGeneric, editingId, setEditingId, reload, notify }) {
  const base = config.direct ? "" : "/manage";
  const save = async (event) => { event.preventDefault(); const payload = { ...generic }; ["sortOrder", "value", "usageLimit", "minOrderTotal", "fee", "freeAbove"].forEach((key) => { if (payload[key] !== undefined && payload[key] !== "") payload[key] = Number(payload[key]); }); try { editingId ? await api.put(`${base}/${config.endpoint}/${editingId}`, payload) : await api.post(`${base}/${config.endpoint}`, payload); notify(editingId ? "تم التعديل" : "تم الحفظ"); setGeneric({}); setEditingId(null); reload(); } catch (error) { notify(error.message, "error"); } };
  const remove = async (id) => { if (!window.confirm("هل تريد الحذف؟")) return; try { await api.delete(`${base}/${config.endpoint}/${id}`); notify("تم الحذف"); reload(); } catch (error) { notify(error.message, "error"); } };
  return <section><Title title={title} subtitle="إضافة وتعديل وحذف" action={editingId && <button className="button ghost" onClick={() => { setGeneric({}); setEditingId(null); }}><X /> إلغاء</button>} /><form className="admin-form-grid" onSubmit={save}>{config.fields.map((field) => <input key={field} placeholder={field} value={generic[field] || ""} onChange={(e) => setGeneric({ ...generic, [field]: e.target.value })} />)}<button className="button primary"><Save /> {editingId ? "تعديل" : "حفظ"}</button></form><div className="admin-table"><table><thead><tr>{config.fields.slice(0, 4).map((f) => <th key={f}>{f}</th>)}<th></th></tr></thead><tbody>{items.map((item) => <tr key={item._id}>{config.fields.slice(0, 4).map((f) => <td key={f}>{String(item[f] ?? "")}</td>)}<td className="row-actions"><button onClick={() => { setGeneric(item); setEditingId(item._id); window.scrollTo({ top: 0, behavior: "smooth" }); }}><Edit3 /> تعديل</button><button className="danger-link" onClick={() => remove(item._id)}><Trash2 /> حذف</button></td></tr>)}</tbody></table></div></section>;
}
function UsersTable({ users, reload }) { const toggle = async (u) => { await api.patch(`/admin/users/${u._id}/status`, { isActive: !u.isActive }); reload(); }; return <section><Title title="العملاء" subtitle="عرض العملاء وحظر الحسابات" /><div className="admin-table"><table><tbody>{users.map((u) => <tr key={u._id}><td><b>{u.name}</b></td><td>{u.email}</td><td>{u.phone}</td><td><button onClick={() => toggle(u)}>{u.isActive ? "حظر" : "تفعيل"}</button></td></tr>)}</tbody></table></div></section>; }
function Staff({ users, reload, notify }) { const [form, setForm] = useState({ name: "", email: "", password: "Admin123!", role: "employee" }); const create = async (e) => { e.preventDefault(); try { await api.post("/admin/users", form); notify("تمت إضافة الموظف"); setForm({ name: "", email: "", password: "Admin123!", role: "employee" }); reload(); } catch (error) { notify(error.message, "error"); } }; return <section><Title title="الموظفون والصلاحيات" subtitle="Super Admin / Admin / Employee" /><form className="admin-form-grid" onSubmit={create}><input required placeholder="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /><input required placeholder="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /><input required placeholder="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /><select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option>employee</option><option>admin</option><option>super_admin</option></select><button className="button primary">Create</button></form><div className="permission-list">{permissionKeys.map((p) => <span key={p}>{p}</span>)}</div><UsersTable users={users} reload={reload} /></section>; }
function SettingsPanel({ settings, reload, notify }) { const [form, setForm] = useState(settings || {}); useEffect(() => setForm(settings || {}), [settings]); const save = async (e) => { e.preventDefault(); await api.put("/manage/settings", form); notify("Saved"); reload(); }; return <section><Title title="الإعدادات" subtitle="معلومات المتجر والسياسات" /><form className="admin-form-grid" onSubmit={save}><input placeholder="storeName" value={form.storeName || ""} onChange={(e) => setForm({ ...form, storeName: e.target.value })} /><input placeholder="logo URL" value={form.logo || ""} onChange={(e) => setForm({ ...form, logo: e.target.value })} /><input placeholder="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} /><textarea className="wide" placeholder="privacyPolicy" value={form.privacyPolicy || ""} onChange={(e) => setForm({ ...form, privacyPolicy: e.target.value })} /><textarea className="wide" placeholder="terms" value={form.terms || ""} onChange={(e) => setForm({ ...form, terms: e.target.value })} /><button className="button primary">Save</button></form></section>; }
function ActivityTable({ items }) { return <section><Title title="سجل النشاط" subtitle="كل عمليات الفريق" /><div className="admin-table"><table><tbody>{items.map((item) => <tr key={item._id}><td>{new Date(item.createdAt).toLocaleString()}</td><td>{item.actorName}</td><td>{item.action}</td><td>{item.description}</td></tr>)}</tbody></table></div></section>; }