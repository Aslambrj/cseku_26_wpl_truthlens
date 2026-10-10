import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const baseURL = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, '');

export const api = axios.create({
  baseURL,
  timeout: 120_000,
  headers: { 'Content-Type': 'application/json' },
});

let onUnauthorized;

export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

api.interceptors.request.use(async (config) => {
  if (!baseURL) {
    throw new Error(
      'API URL is not configured. Copy .env.example to .env and set EXPO_PUBLIC_API_URL to your PC’s LAN address.'
    );
  }

  const session = await SecureStore.getItemAsync('truthlens_mobile_session');
  if (session) {
    const { token } = JSON.parse(session);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await onUnauthorized?.();
    }
    if (!error.response) {
      error.message =
        'Could not reach the TruthLens API. Check that the backend is running and your phone and PC are on the same Wi-Fi network.';
    }
    return Promise.reject(error);
  }
);

export const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;
