// Lokasi: pages/api/admin/products/index.js

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

    const mongoose = require('mongoose');
    
    // Get or create Product model
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

    // GET - Fetch all products
    if (req.method === 'GET') {
      const products = await Product.find({}).sort({ createdAt: -1 }).lean();
      return res.status(200).json({ success: true, products });
    }

    // POST - Create new product
    if (req.method === 'POST') {
      const { name, description, price, stock, imageUrl } = req.body;

      if (!name || !price) {
        return res.status(400).json({ message: 'Name and price are required' });
      }

      const newProduct = new Product({
        name,
        description,
        price,
        stock: stock || 0,
        imageUrl
      });

      await newProduct.save();

      return res.status(201).json({
        success: true,
        message: 'Product created successfully',
        product: newProduct
      });
    }

    return res.status(405).json({ message: 'Method not allowed' });

  } catch (error) {
    console.error('Error in products API:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}