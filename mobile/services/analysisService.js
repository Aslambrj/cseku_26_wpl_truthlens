import * as FileSystem from 'expo-file-system/legacy';
import { api } from './api';

export const analyzeText = (content, sourceUrl = '') =>
  api.post('/analyses/text', { content, sourceUrl }).then(({ data }) => data);

export const analyzeImage = (filename, image) =>
  api.post('/analyses/image', { filename, image }).then(({ data }) => data);

export const uploadVideo = async (uri, filename, token, onProgress) => {
  const baseURL = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, '');
  if (!baseURL) {
    throw new Error(
      'API URL is not configured. Copy .env.example to .env and set EXPO_PUBLIC_API_URL to your PC’s LAN address.'
    );
  }
  if (!token) throw new Error('Your session has expired. Please sign in again.');

  const task = FileSystem.createUploadTask(
    `${baseURL}/analyses/video`,
    uri,
    {
      httpMethod: 'POST',
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/octet-stream',
        'X-File-Name': encodeURIComponent(filename),
      },
    },
    onProgress
  );
  const response = await task.uploadAsync();
  if (!response) throw new Error('The video upload did not return a response.');

  let data;
  try {
    data = JSON.parse(response.body || '{}');
  } catch {
    throw new Error('The server returned an unreadable video analysis response.');
  }
  if (response.status < 200 || response.status >= 300) {
    throw new Error(data.message || `Video analysis failed (${response.status}).`);
  }
  return data;
};

export const getAnalyses = () => api.get('/analyses').then(({ data }) => data);
