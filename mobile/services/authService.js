import { api } from './api';

export const loginRequest = (email, password) =>
  api.post('/auth/login', { email, password }).then(({ data }) => data);

export const signupRequest = (name, email, password) =>
  api.post('/auth/signup', { name, email, password }).then(({ data }) => data);
