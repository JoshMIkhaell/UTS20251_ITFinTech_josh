import dbConnect from '../../../lib/mongodb';
import User from '../../../models/user';
import bcrypt from 'bcryptjs';
import { sendWhatsapp } from '../../../lib/wa';


export default async function handler(req, res) {
  await dbConnect();
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'User tidak ditemukan' });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ error: 'Password salah' });

  // Buat OTP dan kirim via WhatsApp
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = { code, expiresAt: new Date(Date.now() + 5 * 60 * 1000) };
  await user.save();

  try {
    await sendWhatsapp(
      user.phoneNumber,
      `Kode OTP Login kamu: ${code} (berlaku 5 menit).`
    );
  } catch (err) {
    console.error('Gagal kirim WA:', err.message);
  }

  res.json({
    success: true,
    message: 'OTP dikirim via WhatsApp',
    email: user.email,
  });
}
