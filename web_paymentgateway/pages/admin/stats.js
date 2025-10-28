// Lokasi: pages/api/admin/stats.js

import dbConnect from '../../../lib/mongodb';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verify admin token
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await dbConnect();

    // Import Order model (sesuaikan dengan model Anda)
    const mongoose = require('mongoose');
    const Order = mongoose.models.Order || mongoose.model('Order', new mongoose.Schema({
      customerName: String,
      productName: String,
      amount: Number,
      status: String,
      createdAt: { type: Date, default: Date.now }
    }));

    // Get statistics
    const totalOrders = await Order.countDocuments();
    const paidOrders = await Order.countDocuments({ status: 'PAID' });
    const pendingOrders = await Order.countDocuments({ status: 'PENDING' });

    // Calculate total revenue (hanya yang PAID)
    const revenueData = await Order.aggregate([
      { $match: { status: 'PAID' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    return res.status(200).json({
      totalOrders,
      totalRevenue,
      paidOrders,
      pendingOrders
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}