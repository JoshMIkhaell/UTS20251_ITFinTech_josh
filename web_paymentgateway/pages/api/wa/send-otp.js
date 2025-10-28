import dbConnect from '../../../lib/mongodb';
import User from '../../../models/user';
import { sendWhatsapp } from '../../../lib/wa';

export default async function handler(req, res) {
  await dbConnect();
  if (req.method !== 'POST') return res.status(405).end();

  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });

  if (!user.otp?.code) return res.status(400).json({ error: 'OTP belum dibuat' });

  await sendWhatsapp(user.phoneNumber, `Kode OTP login kamu: ${user.otp.code} (berlaku 5 menit).`);
  res.json({ success: true, message: 'OTP dikirim via WhatsApp' });
}
