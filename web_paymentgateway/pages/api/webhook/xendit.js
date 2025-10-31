// pages/api/webhook/xendit.js
import dbConnect from "../../../lib/mongodb";
import Checkout from "../../../models/Checkout";
import { sendWhatsapp } from "../../../lib/wa";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  await dbConnect();

  try {
    const rawBody = await new Promise((resolve) => {
      let data = "";
      req.on("data", (chunk) => (data += chunk));
      req.on("end", () => resolve(data));
    });

    const event = JSON.parse(rawBody);
    console.log("=== XENDIT WEBHOOK RECEIVED ===");
    console.log(JSON.stringify(event, null, 2));

    const callbackToken = req.headers["x-callback-token"];
    if (
      process.env.XENDIT_CALLBACK_TOKEN &&
      callbackToken !== process.env.XENDIT_CALLBACK_TOKEN
    ) {
      console.error("❌ Invalid Xendit callback token");
      return res.status(403).json({ error: "Invalid callback token" });
    }

    const externalId = event.external_id;
    if (!externalId) {
      console.error("❌ Missing external_id");
      return res.status(400).json({ error: "Missing external_id" });
    }

    let checkout = await Checkout.findOne({ external_id: externalId });
    console.log("Existing checkout:", checkout);

    if (!checkout) {
      checkout = await Checkout.create({
        external_id: externalId,
        amount: event.amount || 0,
        status: event.status === "PAID" ? "LUNAS" : "PENDING",
        payment_method:
          event.payment_method || event.payment_channel || "unknown",
        paid_at: event.paid_at ? new Date(event.paid_at) : null,
      });
      console.log("✅ Checkout created:", checkout);
    } else {
      if (event.status === "PAID") {
        checkout.status = "LUNAS";
        checkout.paid_at = new Date(event.paid_at || Date.now());
        checkout.payment_method =
          event.payment_method || event.payment_channel;
        await checkout.save();
        console.log(`✅ Checkout ${externalId} updated to LUNAS`);
      }
    }

    // ✅ Kirim notifikasi ke WA kamu sendiri
    console.log("Webhook status diterima:", event.status);

    const phoneNumber = "6281350052110"; // ganti dengan nomor kamu di Fonnte

    if (["PENDING", "INVOICE_PENDING"].includes(event.status)) {
      await sendWhatsapp(
        phoneNumber,
        `🔔 *PAYMENT PENDING*\nPesanan *${externalId}* sedang menunggu pembayaran.\n\nStatus: ${event.status}\nJumlah: Rp ${event.amount?.toLocaleString("id-ID")}`
      );
    } else if (["PAID", "INVOICE_PAID"].includes(event.status)) {
      await sendWhatsapp(
        phoneNumber,
        `✅ *PAYMENT SUCCESS*\nPesanan *${externalId}* sudah dibayar!\n\nJumlah: Rp ${event.amount?.toLocaleString("id-ID")}\nMetode: ${event.payment_method || event.payment_channel}`
      );
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("❌ Webhook error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
