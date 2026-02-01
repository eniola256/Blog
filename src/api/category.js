// src/api/category.js
const API = import.meta.env.VITE_API_URL;

export async function fetchCategories() {
  const res = await fetch(`${API}/api/public/categories`);
  if (!res.ok) {
    throw new Error("Failed to fetch categories");
  }
  return res.json();
}

export async function fetchCategoryBySlug(slug) {
  const res = await fetch(`${API}/api/public/categories/${slug}`);
  if (!res.ok) {
    throw new Error("Failed to fetch category");
  }
  return res.json();
}