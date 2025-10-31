// lib/wa.js
import axios from "axios";

export async function sendWhatsapp(phoneNumber, message) {
  try {
    // Hapus spasi, tanda hubung, dan tanda kurung
    let formattedNumber = phoneNumber.replace(/[\s\-\(\)]/g, "");

    // Jika nomor diawali 0 → ubah jadi 62
    if (formattedNumber.startsWith("0")) {
      formattedNumber = "62" + formattedNumber.slice(1);
    }

    // Hilangkan tanda +
    if (formattedNumber.startsWith("+")) {
      formattedNumber = formattedNumber.slice(1);
    }

    const response = await axios.post(
      "https://api.fonnte.com/send",
      {
        target: formattedNumber,
        message: message,
      },
      {
        headers: {
          Authorization: process.env.FONNTE_TOKEN,
        },
      }
    );

    console.log("WA terkirim:", response.data);
    return response.data;
  } catch (error) {
    console.error("Gagal mengirim WA:", error.response?.data || error.message);
    throw error;
  }
}
