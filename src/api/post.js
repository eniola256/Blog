// api/post.js
// src/api/post.js
const API = import.meta.env.VITE_API_URL;

export async function fetchPublicPosts(params = "") {
  const res = await fetch(`${API}/api/public/posts${params}`);
  if (!res.ok) {
    throw new Error("Failed to fetch posts");
  }
  return res.json();
}

export async function fetchPublicPostBySlug(slug) {
  const res = await fetch(`${API}/api/public/posts/${slug}`);
  if (!res.ok) {
    throw new Error("Failed to fetch post");
  }
  return res.json();
}

// ✅ NEW: Fetch posts by category
export async function fetchPostsByCategory(categoryId, params = "") {
  const res = await fetch(`${API}/api/public/posts?category=${categoryId}${params}`);
  if (!res.ok) {
    throw new Error("Failed to fetch posts by category");
  }
  return res.json();
}

// ✅ NEW: Fetch posts by tag
export async function fetchPostsByTag(tagId, params = "") {
  const res = await fetch(`${API}/api/public/posts?tag=${tagId}${params}`);
  if (!res.ok) {
    throw new Error("Failed to fetch posts by tag");
  }
  return res.json();
}