export const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  'http://127.0.0.1:3000';

export const API_ENDPOINTS = {
  UPLOAD: `${API_BASE_URL}/upload`,
  ANALYZE: `${API_BASE_URL}/analyze`,
  CHAT: `${API_BASE_URL}/chat`,
};
