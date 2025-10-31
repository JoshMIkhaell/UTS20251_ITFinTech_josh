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

  // Update cart di localStorage setiap kali cart berubah
  useEffect(() => {
    if (Object.keys(cart).length > 0) {
      localStorage.setItem("cart", JSON.stringify(cart));
    } else {
      localStorage.removeItem("cart");
    }
  }, [cart]);

  const items = Object.entries(cart).map(([id, qty]) => {
    const product = products.find((p) => p._id === id);
    return { product, qty, id };
  }).filter(i => i.product); // Filter out items tanpa product

  const subtotal = items.reduce(
    (s, i) => s + (i.product?.price || 0) * i.qty,
    0
  );
  const tax = subtotal * 0.11; // PPN 11%
  const total = subtotal + tax;

  // Function untuk update quantity
  function updateQuantity(productId, newQty) {
    if (newQty <= 0) {
      removeItem(productId);
      return;
    }
    setCart(prev => ({
      ...prev,
      [productId]: newQty
    }));
  }

  // Function untuk hapus item
  function removeItem(productId) {
    setCart(prev => {
      const newCart = { ...prev };
      delete newCart[productId];
      return newCart;
    });
  }

  // Function untuk clear cart
  function clearCart() {
    if (confirm("Hapus semua item dari keranjang?")) {
      setCart({});
      localStorage.removeItem("cart");
    }
  }

  async function handlePay(e) {
    e.preventDefault();
    setIsProcessing(true);
    
    if (items.length === 0) {
      alert("Keranjang kosong.");
      setIsProcessing(false);
      return;
    }
    
    const payloadItems = items.map((i) => ({
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
        // Clear cart setelah sukses
        localStorage.removeItem("cart");
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
      maxWidth: 1100,
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
      flexWrap: "wrap",
      gap: 16,
    },
    title: {
      margin: 0,
      fontSize: 36,
      fontWeight: 700,
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    headerActions: {
      display: "flex",
      gap: 12,
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
    clearButton: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "10px 20px",
      background: "#fee2e2",
      color: "#991b1b",
      border: "2px solid #fca5a5",
      borderRadius: 20,
      fontWeight: 600,
      fontSize: 14,
      cursor: "pointer",
      transition: "all 0.3s ease",
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
      position: "relative",
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
      gap: 8,
    },
    itemName: {
      fontSize: 18,
      fontWeight: 600,
      color: "#2d3748",
      margin: 0,
    },
    quantityControl: {
      display: "flex",
      alignItems: "center",
      gap: 12,
    },
    qtyButton: {
      width: 32,
      height: 32,
      border: "2px solid #667eea",
      background: "white",
      color: "#667eea",
      borderRadius: 8,
      fontSize: 18,
      fontWeight: 700,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.2s",
    },
    qtyDisplay: {
      minWidth: 40,
      textAlign: "center",
      fontSize: 16,
      fontWeight: 600,
      color: "#2d3748",
    },
    priceSection: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      gap: 8,
    },
    itemPrice: {
      fontSize: 20,
      fontWeight: 700,
      color: "#667eea",
    },
    unitPrice: {
      fontSize: 12,
      color: "#718096",
    },
    removeButton: {
      position: "absolute",
      top: 12,
      right: 12,
      width: 28,
      height: 28,
      border: "2px solid #fca5a5",
      background: "#fee2e2",
      color: "#991b1b",
      borderRadius: "50%",
      fontSize: 16,
      fontWeight: 700,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.2s",
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

  if (items.length === 0) {
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
          <div style={styles.headerActions}>
            {items.length > 0 && (
              <button onClick={clearCart} style={styles.clearButton}>
                🗑️ Clear Cart
              </button>
            )}
            <Link href="/" style={styles.backLink}>
              ← Back to Shop
            </Link>
          </div>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: typeof window !== 'undefined' && window.innerWidth > 768 ? "1.5fr 1fr" : "1fr",
          gap: 24,
        }}>
          {/* Items List */}
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>
              📦 Order Items ({items.length})
            </h2>
            <ul style={styles.itemsList}>
              {items.map((i) => (
                <li key={i.id} style={styles.itemCard}>
                  <button
                    onClick={() => removeItem(i.id)}
                    style={styles.removeButton}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = "#fca5a5";
                      e.currentTarget.style.transform = "scale(1.1)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = "#fee2e2";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                    title="Remove item"
                  >
                    ✕
                  </button>

                  {i.product.image ? (
                    <img
                      src={i.product.image}
                      alt={i.product.name}
                      style={styles.itemImage}
                    />
                  ) : (
                    <div style={styles.noImage}>📦</div>
                  )}
                  
                  <div style={styles.itemDetails}>
                    <h3 style={styles.itemName}>{i.product.name}</h3>
                    
                    <div style={styles.quantityControl}>
                      <button
                        onClick={() => updateQuantity(i.id, i.qty - 1)}
                        style={styles.qtyButton}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = "#667eea";
                          e.currentTarget.style.color = "white";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = "white";
                          e.currentTarget.style.color = "#667eea";
                        }}
                      >
                        −
                      </button>
                      <span style={styles.qtyDisplay}>{i.qty}</span>
                      <button
                        onClick={() => updateQuantity(i.id, i.qty + 1)}
                        style={styles.qtyButton}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = "#667eea";
                          e.currentTarget.style.color = "white";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = "white";
                          e.currentTarget.style.color = "#667eea";
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div style={styles.priceSection}>
                    <div style={styles.itemPrice}>
                      Rp {((i.product.price || 0) * i.qty).toLocaleString('id-ID')}
                    </div>
                    <div style={styles.unitPrice}>
                      @ Rp {(i.product.price || 0).toLocaleString('id-ID')}
                    </div>
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