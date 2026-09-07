import { Analysis } from '../models/Analysis.js';

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
    .select('type content createdAt');

  return response.json({ analyses });
};
