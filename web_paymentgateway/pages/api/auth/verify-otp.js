import dbConnect from '../../../lib/mongodb';
import User from '../../../models/user';
import jwt from 'jsonwebtoken';


export default async function handler(req, res) {
  await dbConnect();
  if (req.method !== 'POST') return res.status(405).end();

  const { email, code } = req.body;
  const user = await User.findOne({ email });
  if (!user || !user.otp) return res.status(400).json({ error: 'OTP tidak valid' });

  if (user.otp.code !== code || new Date() > user.otp.expiresAt) {
    return res.status(400).json({ error: 'OTP salah atau kadaluarsa' });
  }

  user.otp = undefined;
  await user.save();

  const token = jwt.sign(
    { userId: user._id, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({ success: true, token, isAdmin: user.isAdmin });
}
