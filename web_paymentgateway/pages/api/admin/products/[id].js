// Lokasi: pages/api/admin/products/[id].js

import dbConnect from '../../../../lib/mongodb';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
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

    const { id } = req.query;
    const mongoose = require('mongoose');

    // Get Product model
    let Product;
    if (mongoose.models.Product) {
      Product = mongoose.models.Product;
    } else {
      const ProductSchema = new mongoose.Schema({
        name: { type: String, required: true },
        description: String,
        price: { type: Number, required: true },
        stock: { type: Number, default: 0 },
        imageUrl: String,
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
      });
      Product = mongoose.model('Product', ProductSchema);
    }

    // PUT - Update product
    if (req.method === 'PUT') {
      const { name, description, price, stock, imageUrl } = req.body;

      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        {
          name,
          description,
          price,
          stock,
          imageUrl,
          updatedAt: new Date()
        },
        { new: true, runValidators: true }
      );

      if (!updatedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }

      return res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        product: updatedProduct
      });
    }

    // DELETE - Delete product
    if (req.method === 'DELETE') {
      const deletedProduct = await Product.findByIdAndDelete(id);

      if (!deletedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }

      return res.status(200).json({
        success: true,
        message: 'Product deleted successfully'
      });
    }

    return res.status(405).json({ message: 'Method not allowed' });

  } catch (error) {
    console.error('Error in product [id] API:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}