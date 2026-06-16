import { LogOut, Package, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api";
import { useStore } from "../context/StoreContext";

const statuses = { pending: "قيد المراجعة", shipping: "قيد الشحن", delivered: "تم التسليم", cancelled: "ملغي" };

export default function Account() {
  const { user, logout } = useStore();
  const [orders, setOrders] = useState([]);
  useEffect(() => { api.get("/orders/mine").then(({ data }) => setOrders(data)).catch(() => {}); }, []);
  return <div className="page container account-page"><aside className="account-sidebar"><div className="account-avatar"><UserRound /><span><b>{user.name}</b><small>{user.email}</small></span></div><button className="active"><Package /> طلباتي</button><button onClick={logout}><LogOut /> تسجيل الخروج</button></aside><section className="account-content"><span className="eyebrow">حسابي</span><h1>طلباتي</h1>{orders.length ? <div className="orders-list">{orders.map((order) => <article key={order._id}><div><small>طلب #{order._id.slice(-6).toUpperCase()}</small><b>{new Date(order.createdAt).toLocaleDateString("ar")}</b></div><div><span className={`status ${order.status}`}>{statuses[order.status]}</span><b>{order.total} ر.س</b></div><p>{order.items.length} منتجات</p></article>)}</div> : <div className="empty-state"><Package /><h2>لا توجد طلبات بعد</h2><p>ستظهر طلباتكِ هنا بعد إتمام أول عملية شراء.</p></div>}</section></div>;
}
