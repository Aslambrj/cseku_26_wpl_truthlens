import mongoose from 'mongoose';
import { Analysis } from '../models/Analysis.js';
import { User } from '../models/User.js';

export const listUsers = async (_request, response) => {
  const [users, totalUsers, totalAdmins] = await Promise.all([
    User.find().sort({ createdAt: -1 }).select('name email role createdAt lastLoginAt').lean(),
    User.countDocuments(),
    User.countDocuments({ role: 'admin' })
  ]);

  const analysisCounts = await Analysis.aggregate([
    { $group: { _id: '$userId', count: { $sum: 1 } } }
  ]);
  const countsByUserId = new Map(
    analysisCounts.map(({ _id, count }) => [_id.toString(), count])
  );

  return response.json({
    users: users.map((user) => ({
      ...user,
      role: user.role || 'user',
      analysisCount: countsByUserId.get(user._id.toString()) || 0
    })),
    stats: { totalUsers, totalAdmins }
  });
};

export const updateUserRole = async (request, response) => {
  const { id } = request.params;
  const { role } = request.body;

  if (!mongoose.isValidObjectId(id)) {
    return response.status(400).json({ message: 'Invalid user id' });
  }

  if (!['user', 'admin'].includes(role)) {
    return response.status(400).json({ message: 'Role must be user or admin' });
  }

  const user = await User.findById(id);
  if (!user) {
    return response.status(404).json({ message: 'User not found' });
  }

  if (user._id.equals(request.user._id) && role !== 'admin') {
    return response.status(400).json({ message: 'You cannot remove your own admin access' });
  }

  if (user.role === 'admin' && role === 'user') {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount <= 1) {
      return response.status(400).json({ message: 'The final admin cannot be demoted' });
    }
  }

  user.role = role;
  await user.save();

  return response.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};

export const deleteUser = async (request, response) => {
  const { id } = request.params;

  if (!mongoose.isValidObjectId(id)) {
    return response.status(400).json({ message: 'Invalid user id' });
  }

  if (id === request.user._id.toString()) {
    return response.status(400).json({ message: 'You cannot delete your own account' });
  }

  const user = await User.findById(id);
  if (!user) {
    return response.status(404).json({ message: 'User not found' });
  }

  if (user.role === 'admin' && await User.countDocuments({ role: 'admin' }) <= 1) {
    return response.status(400).json({ message: 'The final admin cannot be deleted' });
  }

  await Promise.all([
    User.deleteOne({ _id: user._id }),
    Analysis.deleteMany({ userId: user._id })
  ]);

  return response.json({ message: 'User and associated analyses deleted' });
};
