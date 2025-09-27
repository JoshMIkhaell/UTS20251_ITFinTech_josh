import dbConnect from '../../../lib/mongodb';
import Checkout from '../../../models/Checkout';

export default async function handler(req, res) {
  await dbConnect();
  const { id } = req.query;
  if (req.method !== 'GET') return res.status(405).end();

  const ch = await Checkout.findById(id).lean();
  if (!ch) return res.status(404).json({ error: 'Checkout tidak ditemukan' });
  return res.status(200).json(ch);
}
