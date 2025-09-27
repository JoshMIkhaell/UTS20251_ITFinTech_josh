import mongoose from 'mongoose';
const ItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: String,
  price: Number,
  qty: Number
}, { _id: false });

const CheckoutSchema = new mongoose.Schema({
  items: [ItemSchema],
  total: { type: Number, required: true },
  status: { type: String, enum: ['PENDING', 'PAID', 'EXPIRED'], default: 'PENDING' },
  externalId: { type: String },            // external id we pass to Xendit like checkout_<id>
  xenditInvoiceId: { type: String },       // id from xendit
  invoiceUrl: { type: String },
  rawXendit: { type: Object }
}, { timestamps: true });

export default mongoose.models.Checkout || mongoose.model('Checkout', CheckoutSchema);
