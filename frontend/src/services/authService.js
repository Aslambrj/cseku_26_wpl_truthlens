import { apiRequest } from './api';

export const signupRequest = (name, email, password) => apiRequest('/auth/signup', {
  method: 'POST',
  body: JSON.stringify({ name, email, password })
});

export const loginRequest = (email, password) => apiRequest('/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
});
