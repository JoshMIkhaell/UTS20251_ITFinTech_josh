import dbConnect from "../../../lib/mongodb";
import Checkout from "../../../models/Checkout";

// ✅ Nonaktifkan body parser bawaan Next.js agar raw body bisa dibaca
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
    // ✅ Baca raw body (wajib untuk Xendit)
    const rawBody = await new Promise((resolve) => {
      let data = "";
      req.on("data", (chunk) => (data += chunk));
      req.on("end", () => resolve(data));
    });

    const event = JSON.parse(rawBody);

    console.log("=== XENDIT WEBHOOK RECEIVED ===");
    console.log(JSON.stringify(event, null, 2));

    // ✅ Verifikasi token (jika kamu aktifkan di Xendit)
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

    // ✅ Cek data di database
    let checkout = await Checkout.findOne({ external_id: externalId });
    console.log("Existing checkout:", checkout);

    // ✅ Jika belum ada, buat baru
    if (!checkout) {
      checkout = await Checkout.create({
        external_id: externalId,
        amount: event.amount || 0,
        status: event.status === "PAID" ? "LUNAS" : "PENDING",
        payment_method: event.payment_method || event.payment_channel || "unknown",
        paid_at: event.paid_at ? new Date(event.paid_at) : null,
      });
      console.log("✅ Checkout created:", checkout);
    } else {
      // ✅ Jika sudah ada dan status PAID, update jadi LUNAS
      if (event.status === "PAID") {
        checkout.status = "LUNAS";
        checkout.paid_at = new Date(event.paid_at || Date.now());
        checkout.payment_method = event.payment_method || event.payment_channel;
        await checkout.save();
        console.log(`✅ Checkout ${externalId} updated to LUNAS`);
      }
    }

    // ✅ Xendit butuh respons cepat (maks 3 detik)
    res.status(200).json({ received: true });
  } catch (err) {
    console.error("❌ Webhook error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
