// pages/checkout.js
import { useEffect, useState } from "react";
import Link from "next/link";

export default function CheckoutPage() {
  const [cart, setCart] = useState({});
  const [products, setProducts] = useState([]);
  const [email, setEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) setCart(JSON.parse(stored));
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => setProducts(data || []));
  }, []);

  const items = Object.entries(cart).map(([id, qty]) => {
    const product = products.find((p) => p._id === id);
    return { product, qty, id };
  });

  const subtotal = items.reduce(
    (s, i) => s + (i.product?.price || 0) * i.qty,
    0
  );
  const tax = subtotal * 0.11; // PPN 11%
  const total = subtotal + tax;

  async function handlePay(e) {
    e.preventDefault();
    setIsProcessing(true);
    
    const validItems = items.filter((i) => i.product);
    if (validItems.length === 0) {
      alert("Keranjang kosong atau produk tidak ditemukan.");
      setIsProcessing(false);
      return;
    }
    
    const payloadItems = validItems.map((i) => ({
      productId: i.product._id,
      qty: i.qty,
    }));
    
    try {
      const resp = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: payloadItems, payer_email: email }),
      }).then((r) => r.json());

      if (resp.invoice_url) {
        window.location.href = resp.invoice_url;
      } else {
        alert("Gagal membuat invoice");
        setIsProcessing(false);
      }
    } catch (error) {
      alert("Terjadi kesalahan, silakan coba lagi");
      setIsProcessing(false);
    }
  }

  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "40px 20px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    wrapper: {
      maxWidth: 900,
      margin: "0 auto",
    },
    header: {
      background: "rgba(255, 255, 255, 0.95)",
      padding: "30px",
      borderRadius: 16,
      boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
      marginBottom: 30,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    title: {
      margin: 0,
      fontSize: 36,
      fontWeight: 700,
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    backLink: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "10px 20px",
      background: "#f7fafc",
      color: "#667eea",
      textDecoration: "none",
      borderRadius: 20,
      fontWeight: 600,
      fontSize: 14,
      transition: "all 0.3s ease",
      border: "2px solid #667eea",
    },
    contentGrid: {
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: 24,
    },
    card: {
      background: "white",
      borderRadius: 16,
      padding: 30,
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
    },
    sectionTitle: {
      margin: "0 0 20px 0",
      fontSize: 22,
      fontWeight: 600,
      color: "#2d3748",
      display: "flex",
      alignItems: "center",
      gap: 8,
    },
    itemsList: {
      listStyle: "none",
      padding: 0,
      margin: 0,
    },
    itemCard: {
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: 16,
      background: "#f7fafc",
      borderRadius: 12,
      marginBottom: 12,
      transition: "all 0.2s ease",
    },
    itemImage: {
      width: 80,
      height: 80,
      objectFit: "cover",
      borderRadius: 8,
      flexShrink: 0,
    },
    noImage: {
      width: 80,
      height: 80,
      background: "linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%)",
      borderRadius: 8,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 32,
      flexShrink: 0,
    },
    itemDetails: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      gap: 4,
    },
    itemName: {
      fontSize: 18,
      fontWeight: 600,
      color: "#2d3748",
      margin: 0,
    },
    itemQty: {
      fontSize: 14,
      color: "#718096",
    },
    itemPrice: {
      fontSize: 18,
      fontWeight: 700,
      color: "#667eea",
      textAlign: "right",
    },
    summaryCard: {
      background: "white",
      borderRadius: 16,
      padding: 30,
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
      position: "sticky",
      top: 20,
    },
    summaryRow: {
      display: "flex",
      justifyContent: "space-between",
      padding: "12px 0",
      borderBottom: "1px solid #e2e8f0",
    },
    summaryLabel: {
      fontSize: 16,
      color: "#4a5568",
    },
    summaryValue: {
      fontSize: 16,
      fontWeight: 600,
      color: "#2d3748",
    },
    totalRow: {
      display: "flex",
      justifyContent: "space-between",
      padding: "16px 0",
      marginTop: 8,
    },
    totalLabel: {
      fontSize: 20,
      fontWeight: 700,
      color: "#2d3748",
    },
    totalValue: {
      fontSize: 24,
      fontWeight: 700,
      color: "#667eea",
    },
    form: {
      marginTop: 24,
      display: "flex",
      flexDirection: "column",
      gap: 16,
    },
    inputGroup: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
    },
    label: {
      fontSize: 14,
      fontWeight: 600,
      color: "#4a5568",
    },
    input: {
      padding: "14px 16px",
      border: "2px solid #e2e8f0",
      borderRadius: 10,
      fontSize: 16,
      transition: "all 0.3s ease",
      outline: "none",
    },
    payButton: {
      padding: "16px 24px",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      border: "none",
      borderRadius: 10,
      fontSize: 18,
      fontWeight: 700,
      cursor: "pointer",
      transition: "all 0.3s ease",
      boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    payButtonDisabled: {
      opacity: 0.6,
      cursor: "not-allowed",
    },
    emptyState: {
      textAlign: "center",
      padding: "60px 20px",
    },
    emptyIcon: {
      fontSize: 80,
      marginBottom: 20,
    },
    emptyText: {
      fontSize: 20,
      color: "#718096",
      marginBottom: 24,
    },
    shopButton: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "12px 24px",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      textDecoration: "none",
      borderRadius: 25,
      fontWeight: 600,
      fontSize: 16,
      boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
      transition: "all 0.3s ease",
    },
  };

  if (items.length === 0 || items.every(i => !i.product)) {
    return (
      <div style={styles.container}>
        <div style={styles.wrapper}>
          <div style={styles.header}>
            <h1 style={styles.title}>🛒 Checkout</h1>
            <Link href="/" style={styles.backLink}>
              ← Back to Shop
            </Link>
          </div>
          
          <div style={styles.card}>
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🛍️</div>
              <p style={styles.emptyText}>Your cart is empty</p>
              <Link href="/" style={styles.shopButton}>
                Start Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.header}>
          <h1 style={styles.title}>🛒 Checkout</h1>
          <Link href="/" style={styles.backLink}>
            ← Back to Shop
          </Link>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: window.innerWidth > 768 ? "1.5fr 1fr" : "1fr",
          gap: 24,
        }}>
          {/* Items List */}
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>
              📦 Order Items ({items.length})
            </h2>
            <ul style={styles.itemsList}>
              {items.map((i) => (
                <li
                  key={i.product?._id || i.id}
                  style={styles.itemCard}
                >
                  {i.product?.image ? (
                    <img
                      src={i.product.image}
                      alt={i.product.name}
                      style={styles.itemImage}
                    />
                  ) : (
                    <div style={styles.noImage}>📦</div>
                  )}
                  
                  <div style={styles.itemDetails}>
                    <h3 style={styles.itemName}>{i.product?.name}</h3>
                    <p style={styles.itemQty}>Quantity: {i.qty}</p>
                  </div>
                  
                  <div style={styles.itemPrice}>
                    Rp {((i.product?.price || 0) * i.qty).toLocaleString('id-ID')}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Summary & Payment */}
          <div>
            <div style={styles.summaryCard}>
              <h2 style={styles.sectionTitle}>💳 Order Summary</h2>
              
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Subtotal</span>
                <span style={styles.summaryValue}>
                  Rp {subtotal.toLocaleString('id-ID')}
                </span>
              </div>
              
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Tax (11%)</span>
                <span style={styles.summaryValue}>
                  Rp {tax.toLocaleString('id-ID')}
                </span>
              </div>
              
              <div style={styles.totalRow}>
                <span style={styles.totalLabel}>Total</span>
                <span style={styles.totalValue}>
                  Rp {total.toLocaleString('id-ID')}
                </span>
              </div>

              <form onSubmit={handlePay} style={styles.form}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>📧 Email Address</label>
                  <input
                    type="email"
                    placeholder="buyer@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={styles.input}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#667eea";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e2e8f0";
                    }}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isProcessing}
                  style={{
                    ...styles.payButton,
                    ...(isProcessing ? styles.payButtonDisabled : {}),
                  }}
                  onMouseOver={(e) => {
                    if (!isProcessing) {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.5)";
                    }
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.4)";
                  }}
                >
                  {isProcessing ? "Processing..." : "💳 Proceed to Payment"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}