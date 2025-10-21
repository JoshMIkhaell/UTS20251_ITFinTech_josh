import dbConnect from '../../../lib/mongodb';
import Product from '../../../models/Product';
import Checkout from '../../../models/Checkout';
import { Xendit } from 'xendit-node';

const xenditClient = new Xendit({ secretKey: process.env.XENDIT_SECRET_KEY });
const { Invoice } = xenditClient;
const invoiceClient = Invoice;

export default async function handler(req, res) {
  await dbConnect();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { items = [], payer_email } = req.body;
    // items = [{ productId, qty }]

    // load product data
    const productIds = items.map(i => i.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    // build checkout item list
    let total = 0;
    const checkoutItems = items.map(i => {
      const p = products.find(pp => pp._id.toString() === i.productId);
      const price = p ? p.price : 0;
      const name = p ? p.name : 'Unknown';
      const qty = i.qty || 1;
      total += price * qty;
      return { product: p ? p._id : null, name, price, qty };
    });

    // create checkout in DB
    if (total <= 0) {
      return res.status(400).json({ error: 'tidak ada item valid untuk diproses' });
    }

    const ch = await Checkout.create({ items: checkoutItems, total, status: 'PENDING' });

    const externalId = `checkout_${ch._id.toString()}`;

    // create xendit invoice (payment link)
    const resp = await invoiceClient.createInvoice({
      data: {
        externalId,
        payerEmail: payer_email || 'customer@example.com',
        amount: total,
        description: `Checkout ${ch._id}`,
        successRedirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment?checkoutId=${ch._id}`,
        failureRedirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout?checkoutId=${ch._id}`,
        shouldSendEmail: false,
        items: checkoutItems
          .filter((item) => item && item.name && item.price > 0)
          .map((item) => ({
            name: item.name,
            quantity: item.qty,
            price: item.price,
          })),
      },
    });

    // save xendit info into checkout
    await Checkout.findByIdAndUpdate(ch._id, {
      externalId,
      xenditInvoiceId: resp.id || resp.invoice_id || resp.external_id || null,
      invoiceUrl: resp.invoice_url || resp.invoiceUrl || resp.url || null,
      rawXendit: resp
    });

    return res.status(200).json({
      invoice_url: resp.invoice_url || resp.invoiceUrl || resp.url,
      checkoutId: ch._id
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'gagal membuat invoice', detail: err.message });
  }
}
