// pages/api/auth/login.js
import dbConnect from '../../../lib/mongodb';
import User from '../../../models/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendWhatsapp } from '../../../lib/wa';

export default async function handler(req, res) {
  await dbConnect();
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body;
  
  // Cari user
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Email tidak terdaftar' });

  // Validasi password
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ error: 'Password salah' });

  // ========================================
  // CEK: APAKAH USER INI ADMIN ATAU CUSTOMER?
  // ========================================
  
  if (user.isAdmin) {
    // ===== ADMIN: Login langsung tanpa OTP =====
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        isAdmin: true 
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login admin berhasil',
      token,
      isAdmin: true,  // ← Frontend akan cek ini
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  }

  // ===== CUSTOMER: Kirim OTP via WhatsApp =====
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = { code, expiresAt: new Date(Date.now() + 5 * 60 * 1000) };
  await user.save();

  try {
    await sendWhatsapp(
      user.phoneNumber,
      `Kode OTP Login kamu: ${code} (berlaku 5 menit).`
    );
    console.log(`OTP ${code} dikirim ke ${user.phoneNumber}`);
  } catch (err) {
    console.error('Gagal kirim WA:', err.message);
    return res.status(500).json({ error: 'Gagal mengirim OTP ke WhatsApp' });
  }

  return res.status(200).json({
    success: true,
    message: 'OTP dikirim via WhatsApp',
    email: user.email,
    isAdmin: false,     // ← Frontend akan cek ini
    requireOTP: true    // ← Frontend akan cek ini
  });
}