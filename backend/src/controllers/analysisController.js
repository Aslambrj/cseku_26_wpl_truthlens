import { Analysis } from '../models/Analysis.js';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { analyzeTextClaim } from '../../Text Model/textAnalysis.js';

const modelScript = fileURLToPath(new URL('../../Image Model/predict_image.py', import.meta.url));
const pythonCommand = process.env.PYTHON_EXECUTABLE || (process.platform === 'win32' ? 'python' : 'python3');

const runImageModel = (imageBase64) => new Promise((resolve, reject) => {
  const child = spawn(pythonCommand, [modelScript], { stdio: ['pipe', 'pipe', 'pipe'] });
  let output = '';
  let errorOutput = '';
  child.stdout.on('data', (chunk) => { output += chunk; });
  child.stderr.on('data', (chunk) => { errorOutput += chunk; });
  child.on('error', reject);
  child.on('close', (code) => {
    try {
      const result = JSON.parse(output);
      if (code !== 0 || result.error) throw new Error(result.error || errorOutput || 'Image model failed');
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
  child.stdin.end(imageBase64);
});

export const analyzeImage = async (request, response) => {
  const { filename, image } = request.body;
  const maxImageBytes = 8 * 1024 * 1024;
  if (!filename?.trim() || typeof image !== 'string' || !image.trim()) {
    return response.status(400).json({ message: 'An image file is required' });
  }
  const imageBase64 = image.replace(/^data:image\/(png|jpe?g|webp);base64,/i, '');
  if (imageBase64 === image || Buffer.byteLength(imageBase64, 'base64') > maxImageBytes) {
    return response.status(400).json({ message: 'Use a PNG, JPG, or WEBP image up to 8 MB' });
  }
  try {
    const result = await runImageModel(imageBase64);
    const assessment = result.label === 'AI-Generated' ? 'Likely AI-generated image' : 'Likely authentic image';
    const analysis = await Analysis.create({ userId: request.user._id, type: 'image', content: filename.trim(), result });
    return response.status(201).json({
      analysis,
      result: {
        confidence: result.aiProbability,
        assessment,
        explanation: `The model estimates a ${result.aiProbability}% probability that this image is AI-generated (${result.realProbability}% real-image probability).`,
        ...result
      }
    });
  } catch (error) {
    console.error('Image analysis failed:', error.message);
    return response.status(503).json({ message: 'The image model is unavailable. Install the Python requirements and try again.' });
  }
};

export const analyzeText = async (request, response) => {
  const { content } = request.body;
  const sourceUrl = typeof request.body.sourceUrl === 'string' ? request.body.sourceUrl.trim() : '';
  if (typeof content !== 'string' || !content.trim()) {
    return response.status(400).json({ message: 'Enter a claim to analyze' });
  }
  if (content.trim().length > 5000) {
    return response.status(400).json({ message: 'Claims must be 5,000 characters or fewer' });
  }
  if (sourceUrl) {
    if (sourceUrl.length > 2048) {
      return response.status(400).json({ message: 'Source URL must be 2,048 characters or fewer' });
    }
    try {
      const parsedUrl = new URL(sourceUrl);
      const hostname = parsedUrl.hostname.toLowerCase();
      const isLocalHost = hostname === 'localhost' || hostname.endsWith('.localhost') ||
        hostname.endsWith('.local') || hostname.endsWith('.internal') || hostname.endsWith('.test');
      const isIpAddress = /^\[[\da-f:]+\]$/i.test(hostname) || /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);
      if (!['http:', 'https:'].includes(parsedUrl.protocol) || parsedUrl.username || parsedUrl.password || isLocalHost || isIpAddress) {
        return response.status(400).json({ message: 'Enter a public HTTP or HTTPS page URL' });
      }
    } catch {
      return response.status(400).json({ message: 'Enter a valid HTTP or HTTPS source URL' });
    }
  }
  try {
    const result = await analyzeTextClaim(content.trim(), sourceUrl);
    const analysis = await Analysis.create({ userId: request.user._id, type: 'text', content: content.trim(), result });
    return response.status(201).json({ analysis, result });
  } catch (error) {
    console.error('Text analysis failed:', error.message);
    return response.status(503).json({ message: error.message || 'The text model is unavailable. Check OPENROUTER_API_KEY and OPENROUTER_MODEL.' });
  }
};

export const createShareLink = async (request, response) => {
  const { id } = request.params;
  if (!mongoose.isValidObjectId(id)) {
    return response.status(404).json({ message: 'Analysis not found' });
  }
  const analysis = await Analysis.findOne({ _id: id, userId: request.user._id });
  if (!analysis) return response.status(404).json({ message: 'Analysis not found' });
  if (!analysis.shareId) {
    analysis.shareId = randomUUID();
    await analysis.save();
  }
  const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
  return response.json({ shareUrl: `${clientUrl}/shared/${analysis.shareId}` });
};

export const getSharedAnalysis = async (request, response) => {
  const analysis = await Analysis.findOne({ shareId: request.params.shareId })
    .select('type content result createdAt');
  if (!analysis) return response.status(404).json({ message: 'Shared report not found or has been removed' });
  return response.json({ analysis });
};

export const createAnalysis = async (request, response) => {
  const { type, content } = request.body;

  if (!['text', 'image', 'video'].includes(type) || !content?.trim()) {
    return response.status(400).json({ message: 'Type and content are required' });
  }

  const analysis = await Analysis.create({
    userId: request.user._id,
    type,
    content: content.trim()
  });

  return response.status(201).json({ analysis });
};

export const getAnalyses = async (request, response) => {
  const analyses = await Analysis.find({ userId: request.user._id })
    .sort({ createdAt: -1 })
    .select('type content result createdAt');

  return response.json({ analyses });
};
