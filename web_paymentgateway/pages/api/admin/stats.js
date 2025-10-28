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

    // Import Checkout model
    const mongoose = require('mongoose');
    let Checkout;
    
    if (mongoose.models.Checkout) {
      Checkout = mongoose.models.Checkout;
    } else {
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

    // Get statistics
    const totalOrders = await Checkout.countDocuments();
    const paidOrders = await Checkout.countDocuments({ status: 'PAID' });
    const pendingOrders = await Checkout.countDocuments({ status: 'PENDING' });

    // Calculate total revenue (hanya yang PAID)
    // Gunakan field 'total' (bukan 'totalAmount')
    let revenueData = await Checkout.aggregate([
      { $match: { status: 'PAID' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    
    let totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;
    
    // Fallback: Jika total kosong, hitung dari items
    if (totalRevenue === 0) {
      const paidCheckouts = await Checkout.find({ status: 'PAID' }).lean();
      totalRevenue = paidCheckouts.reduce((sum, checkout) => {
        if (checkout.total) {
          return sum + checkout.total;
        }
        // Hitung dari items jika total tidak ada
        if (checkout.items && checkout.items.length > 0) {
          const checkoutTotal = checkout.items.reduce((itemSum, item) => {
            return itemSum + ((item.price || 0) * (item.qty || 1));
          }, 0);
          return sum + checkoutTotal;
        }
        return sum;
      }, 0);
    }

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