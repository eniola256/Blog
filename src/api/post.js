// api/post.js
const API = import.meta.env.VITE_API_URL;

// Get auth token
const getToken = () => localStorage.getItem("token");

// Headers with auth (JSON)
const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// Headers with auth (for FormData - don't set Content-Type)
const getFormDataHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

// Public endpoints
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

export async function fetchPostsByCategory(categoryId, params = "") {
  const res = await fetch(`${API}/api/public/posts?category=${categoryId}${params}`);
  if (!res.ok) {
    throw new Error("Failed to fetch posts by category");
  }
  return res.json();
}

export async function fetchPostsByTag(tagId, params = "") {
  const res = await fetch(`${API}/api/public/posts?tag=${tagId}${params}`);
  if (!res.ok) {
    throw new Error("Failed to fetch posts by tag");
  }
  return res.json();
}

// Admin endpoints
export async function fetchAdminPosts(params = "") {
  const res = await fetch(`${API}/api/admin/posts${params}`, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    throw new Error("Failed to fetch posts");
  }
  return res.json();
}

export async function fetchAdminPostById(id) {
  const res = await fetch(`${API}/api/admin/posts/${id}`, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    throw new Error("Failed to fetch post");
  }
  return res.json();
}

export async function createPost(postData, featuredImage = null) {
  // If there's a featured image, use FormData
  if (featuredImage instanceof File) {
    const formData = new FormData();
    formData.append("title", postData.title);
    formData.append("slug", postData.slug);
    formData.append("content", postData.content);
    formData.append("category", postData.category);
    formData.append("status", postData.status);
    
    // Append tags (can be array or single value)
    if (postData.tags) {
      if (Array.isArray(postData.tags)) {
        postData.tags.forEach(tag => formData.append("tags", tag));
      } else {
        formData.append("tags", postData.tags);
      }
    }
    
    formData.append("featuredImage", featuredImage);
    
    const res = await fetch(`${API}/api/admin/posts`, {
      method: "POST",
      headers: getFormDataHeaders(),
      body: formData,
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to create post");
    }
    return res.json();
  }
  
  // Otherwise use JSON
  const res = await fetch(`${API}/api/admin/posts`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(postData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to create post");
  }
  return res.json();
}

export async function updatePost(id, postData, featuredImage = null) {
  // If there's a featured image (new file), use FormData
  if (featuredImage instanceof File) {
    const formData = new FormData();
    formData.append("title", postData.title);
    formData.append("slug", postData.slug);
    formData.append("content", postData.content);
    formData.append("category", postData.category);
    formData.append("status", postData.status);
    
    // Append tags
    if (postData.tags) {
      if (Array.isArray(postData.tags)) {
        postData.tags.forEach(tag => formData.append("tags", tag));
      } else {
        formData.append("tags", postData.tags);
      }
    }
    
    formData.append("featuredImage", featuredImage);
    
    const res = await fetch(`${API}/api/admin/posts/${id}`, {
      method: "PUT",
      headers: getFormDataHeaders(),
      body: formData,
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to update post");
    }
    return res.json();
  }
  
  // Otherwise use JSON
  const res = await fetch(`${API}/api/admin/posts/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(postData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to update post");
  }
  return res.json();
}

export async function deletePost(id) {
  const res = await fetch(`${API}/api/admin/posts/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) {
    throw new Error("Failed to delete post");
  }
  return res.json();
}

// Stats
export async function fetchAdminStats() {
  const res = await fetch(`${API}/api/admin/stats`, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    throw new Error("Failed to fetch stats");
  }
  return res.json();
}

// Toggle like on a post
export async function toggleLikePost(postId) {
  const res = await fetch(`${API}/api/posts/${postId}/like`, {
    method: "POST",
    headers: getHeaders(),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to toggle like");
  }
  return res.json();
}
