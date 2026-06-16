import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api";
import { messages } from "../i18n";

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("ys_user") || "null"));
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem("ys_cart") || "[]"));
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem("ys_favorites") || "[]"));
  const [language, setLanguageState] = useState(() => localStorage.getItem("alshamel_language") || "ar");
  const [country, setCountry] = useState(() => localStorage.getItem("alshamel_country") || "YE");
  const [currency, setCurrency] = useState(() => localStorage.getItem("alshamel_currency") || "YER");
  const [toast, setToast] = useState(null);

  useEffect(() => localStorage.setItem("ys_cart", JSON.stringify(cart)), [cart]);
  useEffect(() => localStorage.setItem("ys_favorites", JSON.stringify(favorites)), [favorites]);
  useEffect(() => {
    localStorage.setItem("alshamel_language", language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);
  useEffect(() => localStorage.setItem("alshamel_country", country), [country]);
  useEffect(() => localStorage.setItem("alshamel_currency", currency), [currency]);

  const setLanguage = (value) => setLanguageState(value);
  const t = (key) => messages[language]?.[key] || messages.ar[key] || key;

  const notify = (message, type = "success") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 2800);
  };

  const login = async (credentials) => {
    const { data } = await api.post("/auth/login", credentials);
    localStorage.setItem("ys_user", JSON.stringify(data));
    setUser(data);
    return data;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem("ys_user", JSON.stringify(data));
    setUser(data);
  };

  const logout = () => {
    localStorage.removeItem("ys_user");
    setUser(null);
  };

  const addToCart = (product, quantity = 1) => {
    if (!product.stock) return notify("هذا المنتج غير متوفر حاليًا", "error");
    setCart((current) => {
      const existing = current.find((item) => item._id === product._id);
      if (existing) return current.map((item) => item._id === product._id ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) } : item);
      return [...current, { ...product, quantity: Math.min(quantity, product.stock) }];
    });
    notify("أضيف المنتج إلى السلة");
  };

  const updateQuantity = (id, quantity) => setCart((current) => current.map((item) => item._id === id ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) } : item));
  const removeFromCart = (id) => setCart((current) => current.filter((item) => item._id !== id));
  const clearCart = () => setCart([]);
  const toggleFavorite = (id) => setFavorites((current) => current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const value = useMemo(() => ({ user, cart, favorites, toast, cartCount, cartTotal, language, setLanguage, t, country, setCountry, currency, setCurrency, login, register, logout, addToCart, updateQuantity, removeFromCart, clearCart, toggleFavorite, notify }), [user, cart, favorites, toast, cartCount, cartTotal, language, country, currency]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => useContext(StoreContext);
