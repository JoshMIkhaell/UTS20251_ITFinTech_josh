// Lokasi: lib/adminAuth.js
// Versi gabungan yang aman: support admin JWT + fallback dummy jika User model belum ada

import jwt from 'jsonwebtoken';
import dbConnect from './mongodb';

// Fungsi utama: membungkus API handler dengan autentikasi admin
export default function withAdminAuth(handler) {
  return async (req, res) => {
    const authHeader = req.headers.authorization;

    // Jika tidak ada token → unauthorized
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('❌ Tidak ada token Bearer di header.');
      return res.status(401).json({ message: 'Akses ditolak. Token tidak ada.' });
    }

    const token = authHeader.split(' ')[1];

    try {
      await dbConnect();

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Coba muat model User (jika belum ada, buat dummy)
      let User;
      try {
        User = require('../models/user');
      } catch {
        console.warn('⚠️ Model User belum ada — menggunakan dummy adminAuth.');
        // Langsung izinkan semua request jika model belum ada
        req.user = { _id: 'dummy', isAdmin: true };
        return handler(req, res);
      }

      const user = await User.findById(decoded.userId).select('-passwordHash');

      if (!user || !user.isAdmin) {
        console.warn('⛔ Akses ditolak. Bukan admin.');
        return res.status(403).json({ message: 'Akses ditolak. Bukan admin.' });
      }

      req.user = user;
      return handler(req, res);

    } catch (error) {
      console.error('⚠️ Kesalahan verifikasi token:', error.message);
      return res.status(401).json({ message: 'Token tidak valid atau kadaluarsa.' });
    }
  };
}
