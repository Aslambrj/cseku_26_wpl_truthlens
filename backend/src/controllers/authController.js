import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const createToken = (userId) => jwt.sign(
  { userId },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: 'Verification Analyst'
});

export const signup = async (request, response) => {
  const { name, email, password } = request.body;

  if (!name || !email || !password) {
    return response.status(400).json({ message: 'Please complete all registration fields' });
  }

  if (password.length < 6) {
    return response.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    return response.status(409).json({ message: 'An account with this email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email: normalizedEmail, passwordHash });

  return response.status(201).json({
    token: createToken(user._id.toString()),
    user: publicUser(user)
  });
};

export const login = async (request, response) => {
  const { email, password } = request.body;

  if (!email || !password) {
    return response.status(400).json({ message: 'Please fill in all fields' });
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash');
  const passwordMatches = user && await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    return response.status(401).json({ message: 'Invalid email or password' });
  }

  return response.json({
    token: createToken(user._id.toString()),
    user: publicUser(user)
  });
};
