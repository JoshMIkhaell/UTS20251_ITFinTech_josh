// Lokasi: lib/adminAuth.js (Buat folder 'lib' jika belum ada)

import jwt from 'jsonwebtoken';
import User from '../models/user';
import dbConnect from './mongodb';

// Ini adalah "wrapper function"
// Kita akan membungkus API handler kita dengan fungsi ini
const withAdminAuth = (handler) => {
  return async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Akses ditolak. Token tidak ada.' });
    }

    const token = authHeader.split(' ')[1];

    try {
      await dbConnect();
      
      // 1. Verifikasi token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // 2. Cek apakah user dari token itu ada dan adalah admin
      const user = await User.findById(decoded.userId).select('-passwordHash');

      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: 'Akses ditolak. Bukan admin.' });
      }

      // Jika lolos, tambahkan data user ke request
      // dan jalankan handler API yang asli
      req.user = user;
      return handler(req, res);

    } catch (error) {
      return res.status(401).json({ message: 'Token tidak valid atau kadaluarsa.' });
    }
  };
};

export default withAdminAuth;