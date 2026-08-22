import { useEffect, useState } from "react";
import api from "../api";
import { fallbackCategories, fallbackProducts } from "../data/fallback";

const officialCategorySlugs = fallbackCategories.map((category) => category.slug);
const oldDemoCategorySlugs = ["fashion", "beauty-care", "electronics", "home"];

function hasAnyOfficialCategory(categories = []) {
  const slugs = categories.map((category) => category.slug);
  return officialCategorySlugs.some((slug) => slugs.includes(slug));
}

function normalizeCategories(categories = []) {
  const cleanedCategories = categories.filter((category) => !oldDemoCategorySlugs.includes(category.slug));
  if (hasAnyOfficialCategory(cleanedCategories)) return cleanedCategories;
  return [...fallbackCategories, ...cleanedCategories];
}

export function useCatalog() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/products?limit=50"), api.get("/categories")])
      .then(([productResponse, categoryResponse]) => {
        setProducts(productResponse.data.products);
        setCategories(normalizeCategories(categoryResponse.data));
      })
      .catch(() => {
        setProducts(fallbackProducts);
        setCategories(fallbackCategories);
      })
      .finally(() => setLoading(false));
  }, []);

  return { products, categories, loading };
}