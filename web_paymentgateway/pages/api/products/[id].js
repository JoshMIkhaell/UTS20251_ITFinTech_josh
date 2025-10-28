// pages/api/products/[id].js
import dbConnect from '../../../lib/mongodb';
import Product from '../../../models/Product';
import withAdminAuth from '../../../lib/adminAuth';

// Handler untuk GET (ambil 1 produk by ID)
const getProductById = async (req, res) => {
  try {
    const { id } = req.query;
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({ success: false, error: 'Produk tidak ditemukan' });
    }
    
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Handler untuk PUT (update produk) - Khusus Admin
const updateProduct = async (req, res) => {
  try {
    const { id } = req.query;
    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ success: false, error: 'Produk tidak ditemukan' });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Handler untuk DELETE (hapus produk) - Khusus Admin
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.query;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Produk tidak ditemukan' });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Main Handler
async function handler(req, res) {
  const { method } = req;
  await dbConnect();

  switch (method) {
    case 'GET':
      return getProductById(req, res);
    
    case 'PUT':
      // Hanya admin yang bisa update
      return withAdminAuth(updateProduct)(req, res);
    
    case 'DELETE':
      // Hanya admin yang bisa delete
      return withAdminAuth(deleteProduct)(req, res);

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}

export default handler;