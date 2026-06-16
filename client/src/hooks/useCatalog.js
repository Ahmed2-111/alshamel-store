import { useEffect, useState } from "react";
import api from "../api";
import { fallbackCategories, fallbackProducts } from "../data/fallback";

export function useCatalog() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/products?limit=50"), api.get("/categories")])
      .then(([productResponse, categoryResponse]) => {
        setProducts(productResponse.data.products);
        setCategories(categoryResponse.data);
      })
      .catch(() => {
        setProducts(fallbackProducts);
        setCategories(fallbackCategories);
      })
      .finally(() => setLoading(false));
  }, []);

  return { products, categories, loading };
}
