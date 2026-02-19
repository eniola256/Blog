const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Subscribe to newsletter
 * @param {string} email - Subscriber email
 * @returns {Promise<Object>} - Subscription result
 */
export async function subscribe(email) {
  const response = await fetch(`${API_URL}/subscribers/subscribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to subscribe");
  }

  return response.json();
}

/**
 * Unsubscribe from newsletter
 * @param {string} email - Subscriber email
 * @returns {Promise<Object>} - Unsubscription result
 */
export async function unsubscribe(email) {
  const response = await fetch(`${API_URL}/subscribers/unsubscribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to unsubscribe");
  }

  return response.json();
}

/**
 * Get all subscribers (Admin only)
 * @param {string} token - Auth token
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} - List of subscribers
 */
export async function getSubscribers(token, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `${API_URL}/subscribers${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch subscribers");
  }

  return response.json();
}

/**
 * Delete subscriber (Admin only)
 * @param {string} token - Auth token
 * @param {string} id - Subscriber ID
 * @returns {Promise<Object>} - Deletion result
 */
export async function deleteSubscriber(token, id) {
  const response = await fetch(`${API_URL}/subscribers/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete subscriber");
  }

  return response.json();
}
