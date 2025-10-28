// Lokasi: pages/api/admin/analytics.js

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

    const { period } = req.query; // 'daily' or 'monthly'

    const mongoose = require('mongoose');
    let Checkout = mongoose.models.Checkout;

    if (!Checkout) {
      const ItemSchema = new mongoose.Schema({
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        price: Number,
        qty: Number
      }, { _id: false });

      const CheckoutSchema = new mongoose.Schema({
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        items: [ItemSchema],
        total: { type: Number, required: true },
        status: { type: String, enum: ['PENDING', 'PAID', 'EXPIRED'], default: 'PENDING' },
        createdAt: { type: Date, default: Date.now }
      }, { timestamps: true });
      
      Checkout = mongoose.model('Checkout', CheckoutSchema);
    }

    let chartData = [];
    let totalRevenue = 0;
    let totalOrders = 0;

    if (period === 'monthly') {
      // Monthly analytics - Last 12 months
      const monthsAgo = new Date();
      monthsAgo.setMonth(monthsAgo.getMonth() - 12);

      const monthlyData = await Checkout.aggregate([
        {
          $match: {
            status: 'PAID',
            createdAt: { $gte: monthsAgo }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            revenue: { $sum: '$total' },
            orders: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 }
        }
      ]);

      // Create array of last 12 months with data
      const months = [];
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
          year: d.getFullYear(),
          month: d.getMonth() + 1,
          label: d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
        });
      }

      chartData = months.map(m => {
        const data = monthlyData.find(d => d._id.year === m.year && d._id.month === m.month);
        return {
          label: m.label,
          revenue: data ? data.revenue : 0,
          orders: data ? data.orders : 0
        };
      });

      // Calculate totals
      totalRevenue = monthlyData.reduce((sum, d) => sum + d.revenue, 0);
      totalOrders = monthlyData.reduce((sum, d) => sum + d.orders, 0);

    } else {
      // Daily analytics - Last 30 days
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - 30);

      const dailyData = await Checkout.aggregate([
        {
          $match: {
            status: 'PAID',
            createdAt: { $gte: daysAgo }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            revenue: { $sum: '$total' },
            orders: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
        }
      ]);

      // Create array of last 30 days with data
      const days = [];
      const now = new Date();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        days.push({
          year: d.getFullYear(),
          month: d.getMonth() + 1,
          day: d.getDate(),
          label: d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
        });
      }

      chartData = days.map(day => {
        const data = dailyData.find(d => 
          d._id.year === day.year && 
          d._id.month === day.month && 
          d._id.day === day.day
        );
        return {
          label: day.label,
          revenue: data ? data.revenue : 0,
          orders: data ? data.orders : 0
        };
      });

      // Calculate totals
      totalRevenue = dailyData.reduce((sum, d) => sum + d.revenue, 0);
      totalOrders = dailyData.reduce((sum, d) => sum + d.orders, 0);
    }

    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return res.status(200).json({
      success: true,
      chartData,
      stats: {
        totalRevenue,
        totalOrders,
        avgOrderValue
      }
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}