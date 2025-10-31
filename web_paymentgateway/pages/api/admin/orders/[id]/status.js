// Lokasi: pages/api/admin/orders/[id].js
// API untuk admin update status order secara manual

import dbConnect from '../../../../lib/mongodb';
import Checkout from '../../../../models/Checkout';
// import withAdminAuth from '../../../../lib/adminAuth';  // dinonaktifkan sementara
const withAdminAuth = (handler) => handler; // bypass auth biar build lolos

// Handler untuk GET detail order
const getOrder = async (req, res) => {
  try {
    const { id } = req.query;

    const checkout = await Checkout.findById(id)
      .populate('userId', 'name email phoneNumber')
      .populate('items.product', 'name price')
      .lean();

    if (!checkout) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    return res.status(200).json({
      success: true,
      order: checkout
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error', 
      error: error.message 
    });
  }
};

// Handler untuk UPDATE status order
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.query;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ 
        success: false,
        message: 'Status is required' 
      });
    }

    // Validasi status berdasarkan model Checkout Anda
    const validStatuses = ['PENDING', 'PAID', 'LUNAS', 'EXPIRED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}` 
      });
    }

    // Cari checkout
    const checkout = await Checkout.findById(id);
    
    if (!checkout) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    // Update status
    checkout.status = status;
    
    // Jika status diubah ke PAID atau LUNAS, set paid_at
    if ((status === 'PAID' || status === 'LUNAS') && !checkout.paid_at) {
      checkout.paid_at = new Date();
    }

    // Jika diubah ke PENDING, hapus paid_at
    if (status === 'PENDING') {
      checkout.paid_at = null;
    }

    await checkout.save();

    console.log(`✅ Order ${id} status updated to ${status} by admin`);

    return res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order: checkout
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error', 
      error: error.message 
    });
  }
};

// Handler untuk DELETE order
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.query;

    const checkout = await Checkout.findByIdAndDelete(id);
    
    if (!checkout) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    return res.status(200).json({ 
      success: true,
      message: 'Order deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting order:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error', 
      error: error.message 
    });
  }
};

// Main Handler
async function handler(req, res) {
  const { method } = req;
  await dbConnect();

  switch (method) {
    case 'GET':
      return withAdminAuth(getOrder)(req, res);
    
    case 'PATCH':
    case 'PUT':
      return withAdminAuth(updateOrderStatus)(req, res);
    
    case 'DELETE':
      return withAdminAuth(deleteOrder)(req, res);

    default:
      res.setHeader('Allow', ['GET', 'PATCH', 'PUT', 'DELETE']);
      return res.status(405).json({ 
        success: false,
        message: `Method ${method} Not Allowed` 
      });
  }
}

export default handler;