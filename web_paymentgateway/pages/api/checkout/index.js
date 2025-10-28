import dbConnect from '../../../lib/mongodb';
import Checkout from '../../../models/Checkout';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'GET') return res.status(405).end();

  const data = await Checkout.find()
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  res.json(data);
}
