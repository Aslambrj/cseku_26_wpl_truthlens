import { apiRequest } from './api';

export const getAnalyses = () => apiRequest('/analyses');

export const createAnalysis = (type, content) => apiRequest('/analyses', {
  method: 'POST',
  body: JSON.stringify({ type, content })
});

export const analyzeImage = (filename, image) => apiRequest('/analyses/image', {
  method: 'POST',
  body: JSON.stringify({ filename, image })
});

export const analyzeText = (content, sourceUrl = '') => apiRequest('/analyses/text', {
  method: 'POST',
  body: JSON.stringify({ content, sourceUrl })
});

export const createAnalysisShareLink = (analysisId) => apiRequest(`/analyses/${analysisId}/share`, {
  method: 'POST'
});

export const getSharedAnalysis = (shareId) => apiRequest(`/analyses/shared/${encodeURIComponent(shareId)}`);
