const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiRequest = async (path, options = {}) => {
  const token = localStorage.getItem('truthlens_token');

  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};
