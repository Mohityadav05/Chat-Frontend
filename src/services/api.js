export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

/**
 * Helper wrapper around native fetch that handles JSON formatting,
 * credentials, and standard error handling.
 */
export async function apiFetch(endpoint, options = {}) {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers: options.body instanceof FormData ? options.headers : headers,
    credentials: options.credentials || "include",
  });

  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = null;
  }

  if (!response.ok) {
    const errorMsg = data?.message || data?.error || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

/**
 * Authentication API Services
 */
export const authApi = {
  login: (credentials) =>
    apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),
  signup: (userData) =>
    apiFetch("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(userData),
    }),
  logout: () =>
    apiFetch("/api/auth/logout", {
      method: "POST",
    }),
  getMe: () =>
    apiFetch("/api/auth/me", {
      method: "GET",
    }),
};

/**
 * User Management API Services
 */
export const userApi = {
  searchUsers: (query) =>
    apiFetch(`/api/users/search?query=${encodeURIComponent(query)}`, {
      method: "GET",
    }),
  getProfile: () =>
    apiFetch("/api/users/profile", {
      method: "GET",
    }),
  updateProfile: (profileData) =>
    apiFetch("/api/users/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    }),
};

/**
 * Messaging & Conversation API Services
 */
export const chatApi = {
  getConversations: () =>
    apiFetch("/api/conversations", {
      method: "GET",
    }),
  getMessages: (conversationId) =>
    apiFetch(`/api/messages/${conversationId}`, {
      method: "GET",
    }),
  sendMessage: (messageData) =>
    apiFetch("/api/messages", {
      method: "POST",
      body: JSON.stringify(messageData),
    }),
  createConversation: (receiverId) =>
    apiFetch("/api/conversations", {
      method: "POST",
      body: JSON.stringify({ receiverId }),
    }),
  createGroup: (groupData) =>
    apiFetch("/api/conversations/group", {
      method: "POST",
      body: JSON.stringify(groupData),
    }),
};
