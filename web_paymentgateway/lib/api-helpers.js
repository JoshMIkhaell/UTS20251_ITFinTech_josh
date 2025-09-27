import connectDB from './mongodb.js';
import Checkout from '../models/Checkout.js';
import Product from '../models/Product.js';
import Payment from '../models/Payment.js';

export async function getAllProducts() {
  try {
    await connectDB();
    const products = await Product.find({}).sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(products));
  } catch (error) {
    console.error('Error getting products:', error);
    return [];
  }
}

export async function getProductById(id) {
  try {
    await connectDB();
    const product = await Product.findById(id);
    return JSON.parse(JSON.stringify(product));
  } catch (error) {
    console.error('Error getting product:', error);
    return null;
  }
}

export async function createCheckout(items) {
  try {
    await connectDB();
    
    // Calculate total
    const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    
    const checkout = new Checkout({
      items,
      total,
      status: 'PENDING'
    });
    
    await checkout.save();
    return JSON.parse(JSON.stringify(checkout));
  } catch (error) {
    console.error('Error creating checkout:', error);
    throw error;
  }
}

export async function getCheckoutById(id) {
  try {
    await connectDB();
    const checkout = await Checkout.findById(id);
    return JSON.parse(JSON.stringify(checkout));
  } catch (error) {
    console.error('Error getting checkout:', error);
    return null;
  }
}

export async function updateCheckout(id, updateData) {
  try {
    await connectDB();
    const checkout = await Checkout.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true }
    );
    return JSON.parse(JSON.stringify(checkout));
  } catch (error) {
    console.error('Error updating checkout:', error);
    throw error;
  }
}

export async function createPayment(checkoutId, amount, xenditPayload) {
  try {
    await connectDB();
    
    const payment = new Payment({
      checkout: checkoutId,
      amount,
      status: xenditPayload.status || 'PENDING',
      xenditPayload
    });
    
    await payment.save();
    return JSON.parse(JSON.stringify(payment));
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
}