// pages/index.js
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [hoveredCard, setHoveredCard] = useState(null);

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

  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "40px 20px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    header: {
      maxWidth: 1200,
      margin: "0 auto 40px",
      background: "rgba(255, 255, 255, 0.95)",
      padding: "30px",
      borderRadius: 16,
      boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
    },
    title: {
      margin: 0,
      fontSize: 42,
      fontWeight: 700,
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      marginBottom: 20,
    },
    checkoutLink: {
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
    badge: {
      background: "rgba(255, 255, 255, 0.3)",
      padding: "4px 12px",
      borderRadius: 12,
      fontSize: 14,
      fontWeight: 700,
    },
    productsGrid: {
      maxWidth: 1200,
      margin: "0 auto",
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
      gap: 24,
    },
    productCard: {
      background: "white",
      borderRadius: 16,
      overflow: "hidden",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
      transition: "all 0.3s ease",
      display: "flex",
      flexDirection: "column",
    },
    productCardHover: {
      transform: "translateY(-8px)",
      boxShadow: "0 12px 40px rgba(0, 0, 0, 0.2)",
    },
    imageContainer: {
      width: "100%",
      height: 200,
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    productImage: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },
    noImage: {
      fontSize: 48,
      opacity: 0.3,
    },
    productInfo: {
      padding: 20,
      flex: 1,
      display: "flex",
      flexDirection: "column",
      gap: 12,
    },
    productName: {
      margin: 0,
      fontSize: 20,
      fontWeight: 600,
      color: "#2d3748",
    },
    productPrice: {
      margin: 0,
      fontSize: 24,
      fontWeight: 700,
      color: "#667eea",
    },
    buttonGroup: {
      display: "flex",
      gap: 8,
      marginTop: "auto",
    },
    button: {
      flex: 1,
      padding: "12px 16px",
      border: "none",
      borderRadius: 8,
      fontSize: 14,
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    addButton: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      boxShadow: "0 2px 8px rgba(102, 126, 234, 0.3)",
    },
    removeButton: {
      background: "#ef4444",
      color: "white",
      boxShadow: "0 2px 8px rgba(239, 68, 68, 0.3)",
    },
    quantity: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "8px 16px",
      background: "#f7fafc",
      borderRadius: 8,
      fontWeight: 600,
      color: "#2d3748",
      fontSize: 14,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🛍️ Select Items</h1>
        <Link href="/checkout" style={styles.checkoutLink}>
          <span>Go to Checkout</span>
          <span style={styles.badge}>{cartCount}</span>
        </Link>
      </div>

      <div style={styles.productsGrid}>
        {Array.isArray(products) &&
  products.map((p) => {

          const isHovered = hoveredCard === p._id;
          
          return (
            <div
              key={p._id}
              style={{
                ...styles.productCard,
                ...(isHovered ? styles.productCardHover : {}),
              }}
              onMouseEnter={() => setHoveredCard(p._id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div style={styles.imageContainer}>
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.name}
                    style={styles.productImage}
                  />
                ) : (
                  <span style={styles.noImage}>📦</span>
                )}
              </div>
              
              <div style={styles.productInfo}>
                <h3 style={styles.productName}>{p.name}</h3>
                <p style={styles.productPrice}>Rp {p.price.toLocaleString('id-ID')}</p>
                
                {cart[p._id] && (
                  <div style={styles.quantity}>
                    Quantity: {cart[p._id]}
                  </div>
                )}
                
                <div style={styles.buttonGroup}>
                  <button
                    onClick={() => addToCart(p._id)}
                    style={{ ...styles.button, ...styles.addButton }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = "scale(1.05)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    ➕ Add
                  </button>
                  
                  {cart[p._id] ? (
                    <button
                      onClick={() => removeFromCart(p._id)}
                      style={{ ...styles.button, ...styles.removeButton }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = "scale(1.05)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    >
                      ➖ Remove
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}