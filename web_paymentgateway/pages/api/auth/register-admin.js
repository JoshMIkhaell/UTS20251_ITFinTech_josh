// Lokasi: pages/api/auth/register-admin.js
// ENDPOINT INI HANYA UNTUK SETUP AWAL - HAPUS SETELAH ADMIN DIBUAT!

import dbConnect from '../../../lib/mongodb';
import User from '../../../models/user';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { name, email, password } = req.body;

    // Validasi input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Semua field wajib diisi' });
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Buat admin user
    const adminUser = new User({
      name,
      email,
      passwordHash,
      isAdmin: true, // SET ADMIN = TRUE
      phoneNumber: '', // Optional
    });

    await adminUser.save();

    return res.status(201).json({
      message: 'Admin user berhasil dibuat!',
      user: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        isAdmin: adminUser.isAdmin,
      },
    });

  } catch (error) {
    console.error('Error register admin:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}