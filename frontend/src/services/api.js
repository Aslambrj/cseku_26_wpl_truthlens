// Use Vite's same-origin proxy in development. Set VITE_API_URL for deployments
// where the API is hosted separately.
const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export const apiRequest = async (path, options = {}) => {
  const token = localStorage.getItem('truthlens_token');

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      },
      ...options
    });
  } catch {
    throw new Error('Could not reach the TruthLens API. Start the backend server and check its API URL.');
  }

  const data = await response.json().catch(() => ({}));

  if (response.status === 401 && token) {
    localStorage.removeItem('truthlens_token');
    localStorage.removeItem('truthlens_user');
    window.location.replace('/login');
  }

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};
