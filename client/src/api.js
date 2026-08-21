import axios from "axios";
import { fallbackCategories } from "./data/fallback";

const officialCategorySlugs = fallbackCategories.map((category) => category.slug);

function hasOfficialCategories(categories = []) {
  const slugs = categories.map((category) => category.slug);
  return officialCategorySlugs.every((slug) => slugs.includes(slug));
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://alshamel-store-api.onrender.com/api"
});

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("ys_user") || "null");
  if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (response.config.url === "/categories" && !hasOfficialCategories(response.data)) {
      response.data = fallbackCategories;
    }
    return response;
  },
  (error) => Promise.reject(new Error(error.response?.data?.message || "تعذر الاتصال بالخادم"))
);

export default api;
