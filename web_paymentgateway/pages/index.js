// pages/index.js
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => setProducts(data || []));

    const stored = localStorage.getItem("cart");
    if (stored) setCart(JSON.parse(stored));
  }, []);

  function updateCart(next) {
    setCart(next);
    localStorage.setItem("cart", JSON.stringify(next));
  }

  function addToCart(id) {
    const next = { ...cart, [id]: (cart[id] || 0) + 1 };
    updateCart(next);
  }

  function removeFromCart(id) {
    const next = { ...cart };
    if (next[id]) {
      if (next[id] <= 1) delete next[id];
      else next[id]--;
    }
    updateCart(next);
  }

  const cartCount = Object.values(cart).reduce((s, n) => s + n, 0);

  return (
    <div style={{ padding: 20 }}>
      <h1>Select Items</h1>
      <p>
        <Link href="/checkout">Go to Checkout ({cartCount})</Link>
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
          gap: 16,
        }}
      >
        {products.map((p) => (
          <div key={p._id} style={{ border: "1px solid #ccc", padding: 12 }}>
            <h3>{p.name}</h3>
            <p>Rp {p.price}</p>
            <button onClick={() => addToCart(p._id)}>Add</button>
            {cart[p._id] ? (
              <button onClick={() => removeFromCart(p._id)}>Remove</button>
            ) : null}
            {cart[p._id] && <p>Qty: {cart[p._id]}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
