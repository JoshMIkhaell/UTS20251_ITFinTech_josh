// pages/checkout.js
import { useEffect, useState } from "react";

export default function CheckoutPage() {
  const [cart, setCart] = useState({});
  const [products, setProducts] = useState([]);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) setCart(JSON.parse(stored));
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => setProducts(data || []));
  }, []);

  const items = Object.entries(cart).map(([id, qty]) => {
    const product = products.find((p) => p._id === id);
    return { product, qty };
  });

  const total = items.reduce(
    (s, i) => s + (i.product?.price || 0) * i.qty,
    0
  );

  async function handlePay(e) {
    e.preventDefault();
    const payloadItems = items.map((i) => ({
      productId: i.product._id,
      qty: i.qty,
    }));
    const resp = await fetch("/api/checkout/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: payloadItems, payer_email: email }),
    }).then((r) => r.json());

    if (resp.invoice_url) {
      window.location.href = resp.invoice_url;
    } else {
      alert("Gagal membuat invoice");
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Checkout</h1>
      <ul>
        {items.map((i) => (
          <li key={i.product?._id}>
            {i.product?.name} x {i.qty} = Rp {i.product?.price * i.qty}
          </li>
        ))}
      </ul>
      <h3>Total: Rp {total}</h3>

      <form onSubmit={handlePay}>
        <input
          type="email"
          placeholder="buyer@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Bayar</button>
      </form>
    </div>
  );
}
