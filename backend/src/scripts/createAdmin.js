import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/db.js';
import { User } from '../models/User.js';

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.error('Usage: npm run create-admin -- user@example.com');
  process.exit(1);
}

try {
  await connectDatabase();
  await User.updateMany({ role: { $exists: false } }, { $set: { role: 'user' } });
  const user = await User.findOneAndUpdate(
    { email },
    { role: 'admin' },
    { new: true }
  );

  if (!user) {
    throw new Error(`No user found with email ${email}`);
  }

  console.log(`Admin access granted to ${user.email}`);
} catch (error) {
  console.error('Unable to create admin:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
