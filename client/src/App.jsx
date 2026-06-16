import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import About from "./pages/About";
import Account from "./pages/Account";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import Cart from "./pages/Cart";
import Categories from "./pages/Categories";
import Checkout from "./pages/Checkout";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import OrderSuccess from "./pages/OrderSuccess";
import ProductDetails from "./pages/ProductDetails";
import Products from "./pages/Products";

export default function App() {
  return <Routes>
    <Route element={<Layout />}>
      <Route index element={<Home />} />
      <Route path="products" element={<Products />} />
      <Route path="products/:id" element={<ProductDetails />} />
      <Route path="categories" element={<Categories />} />
      <Route path="cart" element={<Cart />} />
      <Route path="about" element={<About />} />
      <Route path="contact" element={<Contact />} />
      <Route element={<ProtectedRoute />}>
        <Route path="checkout" element={<Checkout />} />
        <Route path="order-success/:id" element={<OrderSuccess />} />
        <Route path="account" element={<Account />} />
      </Route>
    </Route>
    <Route path="login" element={<Auth />} />
    <Route path="register" element={<Auth mode="register" />} />
    <Route element={<ProtectedRoute admin />}>
      <Route path="admin" element={<Admin />} />
    </Route>
    <Route path="*" element={<div className="page container empty-state"><h1>الصفحة غير موجودة</h1></div>} />
  </Routes>;
}
