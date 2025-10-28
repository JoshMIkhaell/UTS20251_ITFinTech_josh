import dbConnect from '../../../lib/mongodb';
import Product from '../../../models/Product';

export default async function handler(req, res) {
  await dbConnect();
  if (req.method === 'GET') {
    const products = await Product.find().lean();
    return res.status(200).json(products);
  }

  if (req.method === 'POST') {
    try {
      const p = await Product.create(req.body);
      return res.status(201).json(p);
    } catch (e) {
      console.error(e);
      return res.status(400).json({ error: e.message });
    }
  }

  res.setHeader('Allow', ['GET','POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}