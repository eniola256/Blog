// src/api/tag.js
const API = import.meta.env.VITE_API_URL;

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