import dbConnect from '../../../lib/mongodb';
import Checkout from '../../../models/Checkout';
import Payment from '../../../models/Payment';

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  await dbConnect();
  if (req.method !== 'POST') return res.status(405).end();

  // verifikasi origin via header x-callback-token
  const tokenHeader = req.headers['x-callback-token'] || req.headers['x-callback-token'.toLowerCase()];
  if (!tokenHeader || tokenHeader !== process.env.XENDIT_WEBHOOK_TOKEN) {
    console.warn('Webhook rejected - token mismatch', tokenHeader);
    return res.status(403).json({ error: 'invalid webhook token' });
  }

  const payload = req.body || {};
  // Xendit payload sering mengandung fields seperti: id, external_id, status, amount
  const external_id = payload.external_id || payload.externalID || payload.externalId;
  const status = payload.status || payload.status_text || null;

  // fallback: kalau external_id berformat checkout_<id>
  let checkoutId = null;
  if (external_id && external_id.toString().startsWith('checkout_')) {
    checkoutId = external_id.toString().replace('checkout_', '');
  }

  // try find by xendit invoice id if not found
  let checkout = null;
  if (checkoutId) {
    checkout = await Checkout.findById(checkoutId);
  }
  if (!checkout && payload.id) {
    checkout = await Checkout.findOne({ xenditInvoiceId: payload.id });
  }

  // jika status PAID -> update
  if (status === 'PAID' || (payload.status && payload.status.toUpperCase() === 'PAID')) {
    if (checkout) {
      checkout.status = 'PAID';
      await checkout.save();

      await Payment.create({
        checkout: checkout._id,
        amount: payload.amount || checkout.total,
        status: 'PAID',
        xenditPayload: payload
      });

      console.log('Checkout updated to PAID', checkout._id);
    } else {
      console.warn('Checkout tidak ditemukan utk webhook payload', payload);
    }
  } else {
    console.log('Webhook event diterima:', payload.type || payload.status || 'unknown');
  }

  return res.status(200).json({ ok: true });
}
