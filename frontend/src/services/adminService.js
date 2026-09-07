import { apiRequest } from './api';

export const getAdminUsers = () => apiRequest('/admin/users');

export const updateAdminUserRole = (userId, role) => apiRequest(`/admin/users/${userId}/role`, {
  method: 'PATCH',
  body: JSON.stringify({ role })
});

export const deleteAdminUser = (userId) => apiRequest(`/admin/users/${userId}`, {
  method: 'DELETE'
});
