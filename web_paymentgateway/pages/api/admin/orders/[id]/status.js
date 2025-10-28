// Lokasi: pages/api/admin/orders/[id]/status.js

import dbConnect from '../../../../../lib/mongodb';
import Checkout from '../../../../../models/Checkout';
import withAdminAuth from '../../../../../lib/adminAuth';

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

    const validStatuses = ['PENDING', 'PAID', 'EXPIRED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}` 
      });
    }

    const updatedOrder = await Checkout.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order: updatedOrder
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

// Main Handler
async function handler(req, res) {
  const { method } = req;
  
  if (method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();
  return withAdminAuth(updateOrderStatus)(req, res);
}

export default handler;