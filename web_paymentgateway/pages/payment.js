// pages/payment.js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Payment() {
  const router = useRouter();
  const { checkoutId } = router.query;
  const [checkout, setCheckout] = useState(null);
  const [dots, setDots] = useState("");

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

  // Animated dots for loading
  useEffect(() => {
    const dotsTimer = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".");
    }, 500);
    return () => clearInterval(dotsTimer);
  }, []);

  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "40px 20px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    wrapper: {
      maxWidth: 600,
      width: "100%",
    },
    card: {
      background: "white",
      borderRadius: 24,
      padding: "50px 40px",
      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2)",
      textAlign: "center",
    },
    loadingCard: {
      background: "white",
      borderRadius: 24,
      padding: "60px 40px",
      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2)",
      textAlign: "center",
    },
    spinner: {
      width: 60,
      height: 60,
      border: "6px solid #f3f4f6",
      borderTop: "6px solid #667eea",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
      margin: "0 auto 24px",
    },
    iconContainer: {
      width: 120,
      height: 120,
      margin: "0 auto 30px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 64,
    },
    successIcon: {
      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      boxShadow: "0 10px 30px rgba(16, 185, 129, 0.3)",
      animation: "scaleIn 0.5s ease-out",
    },
    pendingIcon: {
      background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      boxShadow: "0 10px 30px rgba(245, 158, 11, 0.3)",
      animation: "pulse 2s ease-in-out infinite",
    },
    failedIcon: {
      background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
      boxShadow: "0 10px 30px rgba(239, 68, 68, 0.3)",
      animation: "shake 0.5s ease-out",
    },
    title: {
      margin: "0 0 16px 0",
      fontSize: 32,
      fontWeight: 700,
      color: "#2d3748",
    },
    statusBadge: {
      display: "inline-block",
      padding: "10px 24px",
      borderRadius: 20,
      fontSize: 16,
      fontWeight: 600,
      marginBottom: 24,
    },
    successBadge: {
      background: "#d1fae5",
      color: "#065f46",
    },
    pendingBadge: {
      background: "#fef3c7",
      color: "#92400e",
    },
    failedBadge: {
      background: "#fee2e2",
      color: "#991b1b",
    },
    message: {
      fontSize: 18,
      color: "#4a5568",
      lineHeight: 1.6,
      marginBottom: 32,
    },
    infoBox: {
      background: "#f7fafc",
      borderRadius: 12,
      padding: 20,
      marginBottom: 32,
      textAlign: "left",
    },
    infoRow: {
      display: "flex",
      justifyContent: "space-between",
      padding: "12px 0",
      borderBottom: "1px solid #e2e8f0",
    },
    infoLabel: {
      fontSize: 14,
      color: "#718096",
      fontWeight: 500,
    },
    infoValue: {
      fontSize: 14,
      color: "#2d3748",
      fontWeight: 600,
    },
    buttonGroup: {
      display: "flex",
      gap: 12,
      justifyContent: "center",
      flexWrap: "wrap",
    },
    button: {
      padding: "14px 28px",
      borderRadius: 12,
      fontSize: 16,
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.3s ease",
      textDecoration: "none",
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      border: "none",
    },
    primaryButton: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
    },
    secondaryButton: {
      background: "white",
      color: "#667eea",
      border: "2px solid #667eea",
    },
    loadingText: {
      fontSize: 18,
      color: "#4a5568",
      marginBottom: 12,
    },
    subText: {
      fontSize: 14,
      color: "#718096",
    },
  };

  // Add keyframes for animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes scaleIn {
        0% { transform: scale(0); opacity: 0; }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); opacity: 1; }
      }
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Loading State
  if (!checkout) {
    return (
      <div style={styles.container}>
        <div style={styles.wrapper}>
          <div style={styles.loadingCard}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Loading payment status{dots}</p>
            <p style={styles.subText}>Please wait while we fetch your payment information</p>
          </div>
        </div>
      </div>
    );
  }

  // Determine status styling
  const isPaid = checkout.status === "PAID";
  const isPending = checkout.status === "PENDING" || checkout.status === "WAITING";
  const isFailed = checkout.status === "FAILED" || checkout.status === "EXPIRED";

  let statusConfig = {
    icon: "⏳",
    iconStyle: styles.pendingIcon,
    badge: styles.pendingBadge,
    title: "Payment Pending",
    message: "We're waiting for your payment confirmation. Please complete the payment process.",
  };

  if (isPaid) {
    statusConfig = {
      icon: "✅",
      iconStyle: styles.successIcon,
      badge: styles.successBadge,
      title: "Payment Successful!",
      message: "Thank you for your payment. Your order has been confirmed and will be processed shortly.",
    };
  } else if (isFailed) {
    statusConfig = {
      icon: "❌",
      iconStyle: styles.failedIcon,
      badge: styles.failedBadge,
      title: "Payment Failed",
      message: "Unfortunately, your payment could not be processed. Please try again or contact support.",
    };
  }

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.card}>
          {/* Status Icon */}
          <div style={{ ...styles.iconContainer, ...statusConfig.iconStyle }}>
            {statusConfig.icon}
          </div>

          {/* Title */}
          <h1 style={styles.title}>{statusConfig.title}</h1>

          {/* Status Badge */}
          <div style={{ ...styles.statusBadge, ...statusConfig.badge }}>
            Status: {checkout.status}
          </div>

          {/* Message */}
          <p style={styles.message}>{statusConfig.message}</p>

          {/* Order Info */}
          {checkout.checkoutId && (
            <div style={styles.infoBox}>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Order ID</span>
                <span style={styles.infoValue}>{checkout.checkoutId || checkoutId}</span>
              </div>
              {checkout.amount && (
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Amount</span>
                  <span style={styles.infoValue}>
                    Rp {checkout.amount.toLocaleString('id-ID')}
                  </span>
                </div>
              )}
              {checkout.payer_email && (
                <div style={{ ...styles.infoRow, borderBottom: "none" }}>
                  <span style={styles.infoLabel}>Email</span>
                  <span style={styles.infoValue}>{checkout.payer_email}</span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div style={styles.buttonGroup}>
            {isPaid ? (
              <>
                <Link
                  href="/"
                  style={{ ...styles.button, ...styles.primaryButton }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.5)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.4)";
                  }}
                >
                  🏠 Back to Home
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={() => router.reload()}
                  style={{ ...styles.button, ...styles.secondaryButton }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = "#f7fafc";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = "white";
                  }}
                >
                  🔄 Refresh Status
                </button>
                <Link
                  href="/"
                  style={{ ...styles.button, ...styles.primaryButton }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.5)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.4)";
                  }}
                >
                  🏠 Back to Home
                </Link>
              </>
            )}
          </div>

          {/* Auto-refresh indicator for pending */}
          {isPending && (
            <p style={{ ...styles.subText, marginTop: 24 }}>
              🔄 Auto-refreshing every 3 seconds...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}