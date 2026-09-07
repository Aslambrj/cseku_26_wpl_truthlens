import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const requireAuth = async (request, response, next) => {
  const authorization = request.headers.authorization;
  const token = authorization?.startsWith('Bearer ')
    ? authorization.slice(7)
    : null;

  if (!token) {
    return response.status(401).json({ message: 'Authentication required' });
  }

  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(userId);

    if (!user) {
      return response.status(401).json({ message: 'User account not found' });
    }

    request.user = user;
    next();
  } catch {
    return response.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const requireAdmin = (request, response, next) => {
  if (request.user.role !== 'admin') {
    return response.status(403).json({ message: 'Administrator access required' });
  }

  next();
};
