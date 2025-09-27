// pages/payment.js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Payment() {
  const router = useRouter();
  const { checkoutId } = router.query;
  const [checkout, setCheckout] = useState(null);

  useEffect(() => {
    if (!checkoutId) return;
    const fetchStatus = async () => {
      const res = await fetch(`/api/checkout/${checkoutId}`);
      const data = await res.json();
      setCheckout(data);
    };
    fetchStatus();
    const timer = setInterval(fetchStatus, 3000);
    return () => clearInterval(timer);
  }, [checkoutId]);

  if (!checkout) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Status Pembayaran</h1>
      <p>Status: {checkout.status}</p>
      {checkout.status === "PAID" ? (
        <p style={{ color: "green" }}>✅ LUNAS</p>
      ) : (
        <p style={{ color: "orange" }}>⏳ Menunggu...</p>
      )}
    </div>
  );
}
