import dbConnect from '../../../lib/mongodb';
import User from '../../../models/user';
import bcrypt from 'bcryptjs';


export default async function handler(req, res) {
  await dbConnect();
  if (req.method !== 'POST') return res.status(405).end();

  const { name, email, password, phoneNumber, isAdmin } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ error: 'Email sudah terdaftar' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash, phoneNumber, isAdmin });

  res.status(201).json({ success: true, user });
}
