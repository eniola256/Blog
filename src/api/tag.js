// src/api/tag.js
const API = import.meta.env.VITE_API_URL;

// Get auth token
const getToken = () => localStorage.getItem("token");

// Headers with auth
const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// Public endpoints
export async function fetchTags() {
  const res = await fetch(`${API}/api/public/tags`);
  if (!res.ok) {
    throw new Error("Failed to fetch tags");
  }
  return res.json();
}

export async function fetchTagBySlug(slug) {
  const res = await fetch(`${API}/api/public/tags/${slug}`);
  if (!res.ok) {
    throw new Error("Failed to fetch tag");
  }
  return res.json();
}

export async function fetchTagWithPosts(slug) {
  const res = await fetch(`${API}/api/public/tags/${slug}`);
  if (!res.ok) {
    throw new Error("Failed to fetch tag");
  }
  return res.json(); // Returns { tag, posts }
}

// Admin endpoints
export async function fetchAdminTags() {
  const res = await fetch(`${API}/api/admin/tags`, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    throw new Error("Failed to fetch tags");
  }
  return res.json();
}

export async function createTag(tagData) {
  const res = await fetch(`${API}/api/admin/tags`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(tagData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to create tag");
  }
  return res.json();
}

export async function updateTag(id, tagData) {
  const res = await fetch(`${API}/api/admin/tags/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(tagData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to update tag");
  }
  return res.json();
}

export async function deleteTag(id) {
  const res = await fetch(`${API}/api/admin/tags/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) {
    throw new Error("Failed to delete tag");
  }
  return res.json();
}
