import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://alshamel-store-api.onrender.com/api"
});

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("ys_user") || "null");
  if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(new Error(error.response?.data?.message || "تعذر الاتصال بالخادم"))
);

export default api;