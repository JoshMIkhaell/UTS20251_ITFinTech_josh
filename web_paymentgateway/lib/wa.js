// wa.js
import twilio from 'twilio';

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

export async function sendWhatsapp(to, message) {
  try {
    const formattedTo = `whatsapp:+${to.replace(/^0/, '62')}`; // otomatis ubah format

    const msg = await client.messages.create({
      from: 'whatsapp:+14155238886', // nomor Twilio sandbox
      to: formattedTo,
      body: message
    });

    console.log('WA terkirim:', msg.sid);
  } catch (error) {
    console.error('Gagal kirim WA:', error.message);
  }
}
