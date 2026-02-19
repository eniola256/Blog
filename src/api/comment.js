// src/api/comment.js
const API = import.meta.env.VITE_API_URL;

// Get auth token
const getToken = () => localStorage.getItem("token");

// Headers with auth (JSON)
const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// Fetch comments for a post
export async function fetchComments(postId) {
  const res = await fetch(`${API}/api/comments/post/${postId}`);
  if (!res.ok) {
    throw new Error("Failed to fetch comments");
  }
  return res.json();
}

// Create a new comment (requires auth)
// Backend expects: POST /api/comments with { postId, content }
export async function createComment(postId, commentData) {
  const res = await fetch(`${API}/api/comments`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ 
      postId, 
      content: commentData.content 
    }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to create comment");
  }
  return res.json();
}

// Update a comment (requires auth - owner only)
export async function updateComment(commentId, commentData) {
  const res = await fetch(`${API}/api/comments/${commentId}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(commentData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to update comment");
  }
  return res.json();
}

// Delete a comment (requires auth - owner or admin)
export async function deleteComment(commentId) {
  const res = await fetch(`${API}/api/comments/${commentId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) {
    throw new Error("Failed to delete comment");
  }
  return res.json();
}

// Toggle like on a comment
export async function toggleLikeComment(commentId) {
  const res = await fetch(`${API}/api/comments/${commentId}/like`, {
    method: "POST",
    headers: getHeaders(),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to toggle like");
  }
  return res.json();
}
