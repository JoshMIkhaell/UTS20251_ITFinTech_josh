import mongoose from 'mongoose';
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true }, // in smallest currency unit asumsi IDR
  category: { type: String },
  description: { type: String },
  image: { type: String }
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
