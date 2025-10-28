// Lokasi: pages/api/admin/orders/index.js

import dbConnect from '../../../../lib/mongodb';
import Checkout from '../../../../models/Checkout';
import Product from '../../../../models/Product'; // Import Product model
import withAdminAuth from '../../../../lib/adminAuth';

// Handler untuk GET semua orders - Khusus Admin
const getOrders = async (req, res) => {
  try {
    // Get query parameters
    const { status, limit } = req.query;

    // Build query
    let query = {};
    if (status && status !== 'ALL') {
      query.status = status;
    }

    // Fetch checkouts
    const checkouts = await Checkout.find(query)
      .populate('userId', 'name email phoneNumber')
      .populate('items.product', 'name')
      .sort({ createdAt: -1 })
      .limit(limit ? parseInt(limit) : 100)
      .lean();

    // Transform data untuk frontend
    const orders = checkouts.map(checkout => {
      // Ambil nama produk (dari items.name atau items.product.name)
      const productNames = checkout.items?.map(item => 
        item.name || item.product?.name || 'Unknown'
      ).join(', ') || 'N/A';
      
      // Ambil total dari field 'total'
      let totalAmount = checkout.total || 0;
      
      // Fallback: hitung dari items jika total kosong
      if (!totalAmount && checkout.items && checkout.items.length > 0) {
        totalAmount = checkout.items.reduce((sum, item) => {
          return sum + ((item.price || 0) * (item.qty || 1));
        }, 0);
      }
      
      return {
        _id: checkout._id,
        customerName: checkout.userId?.name || 'Guest',
        customerEmail: checkout.userId?.email || 'N/A',
        productName: productNames,
        amount: totalAmount,
        status: checkout.status,
        createdAt: checkout.createdAt,
        updatedAt: checkout.updatedAt
      };
    });

    // Return format yang diharapkan frontend
    res.status(200).json({ 
      success: true, 
      orders: orders // Ubah 'data' jadi 'orders'
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// Main Handler
async function handler(req, res) {
  const { method } = req;
  await dbConnect();

  switch (method) {
    case 'GET':
      return withAdminAuth(getOrders)(req, res);

    default:
      res.setHeader('Allow', ['GET']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}

export default handler;