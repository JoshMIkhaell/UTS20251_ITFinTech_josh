import mongoose from 'mongoose';
const PaymentSchema = new mongoose.Schema({
  checkout: { type: mongoose.Schema.Types.ObjectId, ref: 'Checkout' },
  amount: Number,
  status: String,
  xenditPayload: Object
}, { timestamps: true });

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
