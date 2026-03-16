// api/post.js
const API = import.meta.env.VITE_API_URL;

const isUploadableFile = (value) => {
  if (!value || typeof value !== "object") return false;
  const hasType = typeof value.type === "string";
  const hasSize = typeof value.size === "number";
  const hasSlice = typeof value.slice === "function";
  const hasArrayBuffer = typeof value.arrayBuffer === "function";
  return hasType && hasSize && (hasSlice || hasArrayBuffer);
};

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

export async function fetchDraftRevisionForPost(postId) {
  const res = await fetch(`${API}/api/admin/posts?revisionOf=${postId}&status=draft&limit=1&page=1`, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    throw new Error("Failed to fetch draft revision");
  }
  return res.json();
}

export async function createPost(postData, featuredImage = null) {
  // If there's a featured image, use FormData
  if (isUploadableFile(featuredImage)) {
    const formData = new FormData();
    formData.append("title", postData.title);
    formData.append("slug", postData.slug);
    formData.append("content", postData.content);
    formData.append("category", postData.category);
    formData.append("status", postData.status);
    if (postData.targetStatus) {
      formData.append("targetStatus", postData.targetStatus);
    }
    if (postData.auto !== undefined) {
      formData.append("auto", String(postData.auto));
    }
    if (postData.silent !== undefined) {
      formData.append("silent", String(postData.silent));
    }
    if (postData.keepPublished !== undefined) {
      formData.append("keepPublished", String(postData.keepPublished));
    }
    if (postData.revisionId) {
      formData.append("revisionId", postData.revisionId);
    }
    formData.append("metaDescription", postData.metaDescription || "");
    formData.append("focusKeyword", postData.focusKeyword || "");
    
    // Append tags (can be array or single value)
    if (postData.tags) {
      if (Array.isArray(postData.tags)) {
        postData.tags.forEach(tag => formData.append("tags", tag));
      } else {
        formData.append("tags", postData.tags);
      }
    }
    
    if (typeof featuredImage?.name === "string") {
      formData.append("featuredImage", featuredImage, featuredImage.name);
    } else {
      formData.append("featuredImage", featuredImage, "featured-image");
    }
    
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
  if (isUploadableFile(featuredImage)) {
    const formData = new FormData();
    formData.append("title", postData.title);
    formData.append("slug", postData.slug);
    formData.append("content", postData.content);
    formData.append("category", postData.category);
    formData.append("status", postData.status);
    if (postData.targetStatus) {
      formData.append("targetStatus", postData.targetStatus);
    }
    if (postData.auto !== undefined) {
      formData.append("auto", String(postData.auto));
    }
    if (postData.silent !== undefined) {
      formData.append("silent", String(postData.silent));
    }
    if (postData.keepPublished !== undefined) {
      formData.append("keepPublished", String(postData.keepPublished));
    }
    if (postData.revisionId) {
      formData.append("revisionId", postData.revisionId);
    }
    formData.append("metaDescription", postData.metaDescription || "");
    formData.append("focusKeyword", postData.focusKeyword || "");
    
    // Append tags
    if (postData.tags) {
      if (Array.isArray(postData.tags)) {
        postData.tags.forEach(tag => formData.append("tags", tag));
      } else {
        formData.append("tags", postData.tags);
      }
    }
    
    if (typeof featuredImage?.name === "string") {
      formData.append("featuredImage", featuredImage, featuredImage.name);
    } else {
      formData.append("featuredImage", featuredImage, "featured-image");
    }
    
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
