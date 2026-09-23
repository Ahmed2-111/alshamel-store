import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://alshamel-store-api.onrender.com/api"
});

const SESSION_EXPIRED_EVENT = "alshamel:session-expired";
const apiOrigin = api.defaults.baseURL.replace(/\/api\/?$/, "");
const uploadPath = /^\/?uploads[\\/]/;

function normalizeMediaUrl(value) {
  if (!value || typeof value !== "string") return value;
  if (/^(https?:)?\/\//.test(value) || value.startsWith("data:") || value.startsWith("blob:")) return value;
  if (uploadPath.test(value)) return `${apiOrigin}/${value.replace(/^[\\/]+/, "").replace(/\\/g, "/")}`;
  return value;
}

function normalizeProduct(product) {
  if (!product || typeof product !== "object") return product;
  if (Array.isArray(product.images)) product.images = product.images.map(normalizeMediaUrl);
  if (product.video) product.video = normalizeMediaUrl(product.video);
  return product;
}

function normalizeResponseData(data) {
  if (!data) return data;
  if (Array.isArray(data)) return data.map(normalizeProduct);
  if (Array.isArray(data.products)) data.products = data.products.map(normalizeProduct);
  if (data.product) data.product = normalizeProduct(data.product);
  return normalizeProduct(data);
}

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("ys_user") || "null");
  if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  return config;
});

api.interceptors.response.use(
  (response) => {
    response.data = normalizeResponseData(response.data);
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || "تعذر الاتصال بالخادم";
    const url = error.config?.url || "";
    const isAuthRequest = url.includes("/auth/login") || url.includes("/auth/register");
    if (error.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem("ys_user");
      window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT, { detail: { message } }));
      const currentPath = `${window.location.pathname}${window.location.search}`;
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }
    }
    return Promise.reject(new Error(message));
  }
);

export default api;
