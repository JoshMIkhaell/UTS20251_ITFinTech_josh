import dbConnect from '../../../lib/mongodb';
import Checkout from '../../../models/Checkout';

export default async function handler(req, res) {
  await dbConnect();

  const summary = await Checkout.aggregate([
    { $match: { status: 'lunas' } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        total: { $sum: '$totalAmount' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json(summary);
}
