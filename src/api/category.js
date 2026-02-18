// src/api/category.js
const API = import.meta.env.VITE_API_URL;

// Get auth token
const getToken = () => localStorage.getItem("token");

// Headers with auth
const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// Public endpoints
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

// Admin endpoints
export async function fetchAdminCategories() {
  const res = await fetch(`${API}/api/admin/categories`, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    throw new Error("Failed to fetch categories");
  }
  return res.json();
}

export async function createCategory(categoryData) {
  const res = await fetch(`${API}/api/admin/categories`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(categoryData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to create category");
  }
  return res.json();
}

export async function updateCategory(id, categoryData) {
  const res = await fetch(`${API}/api/admin/categories/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(categoryData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to update category");
  }
  return res.json();
}

export async function deleteCategory(id) {
  const res = await fetch(`${API}/api/admin/categories/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) {
    throw new Error("Failed to delete category");
  }
  return res.json();
}

// Bulk create categories (for defaults)
export async function createCategoriesBatch(categories) {
  const res = await fetch(`${API}/api/admin/categories/bulk`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ categories }), // ← Wrap in object
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to create categories");
  }
  return res.json();
}
