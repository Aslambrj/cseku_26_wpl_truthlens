import { apiRequest } from './api';

export const getAnalyses = () => apiRequest('/analyses');

export const createAnalysis = (type, content) => apiRequest('/analyses', {
  method: 'POST',
  body: JSON.stringify({ type, content })
});
