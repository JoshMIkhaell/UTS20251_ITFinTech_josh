import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function HomePage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cart, setCart] = useState({});
  const [showCartModal, setShowCartModal] = useState(false);

  useEffect(() => {
    // Cek apakah user sudah login
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    // Fetch products dari database
    fetchProducts();

    // Load cart dari localStorage hanya jika sudah login
    if (token) {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (e) {
          console.error('Error parsing cart:', e);
        }
      }
    }
  }, []);

  // Simpan cart ke localStorage setiap kali berubah
  useEffect(() => {
    if (isLoggedIn) {
      if (Object.keys(cart).length > 0) {
        localStorage.setItem('cart', JSON.stringify(cart));
      } else {
        localStorage.removeItem('cart');
      }
    }
  }, [cart, isLoggedIn]);

  async function fetchProducts() {
    try {
      const res = await axios.get('/api/products');
      setProducts(res.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  function handleAddToCart(product) {
    // Cek login sebelum menambah ke keranjang
    if (!isLoggedIn) {
      alert('Silakan login terlebih dahulu untuk menambahkan produk ke keranjang');
      router.push('/login');
      return;
    }

    setCart(prevCart => {
      const currentQty = prevCart[product._id] || 0;
      return {
        ...prevCart,
        [product._id]: currentQty + 1
      };
    });
    alert(`${product.name} berhasil ditambahkan ke keranjang!`);
  }

  function handleRemoveFromCart(productId) {
    setCart(prevCart => {
      const newCart = { ...prevCart };
      delete newCart[productId];
      return newCart;
    });
  }

  function handleUpdateQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
    } else {
      setCart(prevCart => ({
        ...prevCart,
        [productId]: newQuantity
      }));
    }
  }

  function getTotalPrice() {
    return Object.entries(cart).reduce((total, [productId, qty]) => {
      const product = products.find(p => p._id === productId);
      return total + ((product?.price || 0) * qty);
    }, 0);
  }

  function getTotalItems() {
    return Object.values(cart).reduce((total, qty) => total + qty, 0);
  }

  function getCartItems() {
    return Object.entries(cart).map(([productId, qty]) => {
      const product = products.find(p => p._id === productId);
      return { product, qty, id: productId };
    }).filter(item => item.product);
  }

  function handleCheckout() {
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('Silakan login terlebih dahulu untuk melakukan checkout');
      router.push('/login');
      return;
    }

    if (Object.keys(cart).length === 0) {
      alert('Keranjang belanja Anda masih kosong');
      return;
    }

    router.push('/checkout');
  }

  function handleCartClick() {
    // Cek login sebelum membuka keranjang
    if (!isLoggedIn) {
      alert('Silakan login terlebih dahulu untuk melihat keranjang');
      router.push('/login');
      return;
    }
    setShowCartModal(true);
  }

  function handleLogout() {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setCart({});
    localStorage.removeItem('cart');
    router.reload();
  }

  const cartItems = getCartItems();

  return (
    <>
      <div className="page-wrapper">
        <header className="header">
          <div className="header-content">
            <div className="logo">
              <span className="logo-icon">🛍️</span>
              <h1>PaymentGateway Store</h1>
            </div>
            
            <nav className="nav-buttons">
              <button onClick={handleCartClick} className="btn-cart">
                🛒 Keranjang
                {isLoggedIn && getTotalItems() > 0 && (
                  <span className="cart-badge">{getTotalItems()}</span>
                )}
              </button>
              
              {isLoggedIn ? (
                <>
                  <button onClick={() => router.push('/orders')} className="btn-nav">
                    📦 Pesanan Saya
                  </button>
                  <button onClick={handleLogout} className="btn-logout">
                    🚪 Logout
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => router.push('/login')} className="btn-login">
                    🔐 Login
                  </button>
                  <button onClick={() => router.push('/register')} className="btn-register">
                    📝 Daftar
                  </button>
                </>
              )}
            </nav>
          </div>
        </header>

        <main className="main-content">
          <div className="hero">
            <h2>Selamat Datang di Toko Kami</h2>
            <p>Jelajahi produk-produk berkualitas dengan harga terbaik</p>
            {!isLoggedIn && (
              <div className="login-notice">
                <span className="notice-icon">ℹ️</span>
                <p>Silakan login untuk menambahkan produk ke keranjang</p>
              </div>
            )}
          </div>

          {loading ? (
            <div className="loading">
              <div className="spinner-large"></div>
              <p>Memuat produk...</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">📦</span>
                  <p>Belum ada produk tersedia</p>
                </div>
              ) : (
                products.map((product) => (
                  <div key={product._id} className="product-card">
                    <div className="product-image">
                      {product.image ? (
                        <img src={product.image} alt={product.name} />
                      ) : (
                        <div className="placeholder-image">
                          <span>📦</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="product-info">
                      <h3 className="product-name">{product.name}</h3>
                      {product.category && (
                        <span className="product-category">{product.category}</span>
                      )}
                      {product.description && (
                        <p className="product-description">{product.description}</p>
                      )}
                      <div className="product-price">
                        Rp {product.price.toLocaleString('id-ID')}
                      </div>
                      <button 
                        onClick={() => handleAddToCart(product)} 
                        className={`btn-add-cart ${!isLoggedIn ? 'disabled' : ''}`}
                      >
                        {isLoggedIn ? '🛒 Tambah ke Keranjang' : '🔒 Login untuk Membeli'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </main>

        <footer className="footer">
          <p>© 2025 PaymentGateway Store. All rights reserved.</p>
        </footer>

        {showCartModal && (
          <div className="modal-overlay" onClick={() => setShowCartModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>🛒 Keranjang Belanja</h2>
                <button className="btn-close" onClick={() => setShowCartModal(false)}>✕</button>
              </div>

              <div className="modal-body">
                {cartItems.length === 0 ? (
                  <div className="empty-cart">
                    <span className="empty-icon">🛒</span>
                    <p>Keranjang belanja Anda masih kosong</p>
                  </div>
                ) : (
                  <>
                    <div className="cart-items">
                      {cartItems.map((item) => (
                        <div key={item.id} className="cart-item">
                          {item.product.image ? (
                            <img src={item.product.image} alt={item.product.name} className="cart-item-image" />
                          ) : (
                            <div className="cart-item-image" style={{background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px'}}>
                              📦
                            </div>
                          )}
                          <div className="cart-item-info">
                            <h4>{item.product.name}</h4>
                            <p className="cart-item-price">
                              Rp {item.product.price.toLocaleString('id-ID')}
                            </p>
                          </div>
                          <div className="cart-item-actions">
                            <div className="quantity-controls">
                              <button onClick={() => handleUpdateQuantity(item.id, item.qty - 1)} className="btn-qty">−</button>
                              <span className="quantity">{item.qty}</span>
                              <button onClick={() => handleUpdateQuantity(item.id, item.qty + 1)} className="btn-qty">+</button>
                            </div>
                            <button onClick={() => handleRemoveFromCart(item.id)} className="btn-remove">🗑️</button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="cart-summary">
                      <div className="summary-row">
                        <span>Total Item:</span>
                        <span className="summary-value">{getTotalItems()} item</span>
                      </div>
                      <div className="summary-row total">
                        <span>Total Harga:</span>
                        <span className="summary-value">Rp {getTotalPrice().toLocaleString('id-ID')}</span>
                      </div>
                    </div>

                    <button onClick={handleCheckout} className="btn-checkout">
                      💳 Lanjut ke Checkout
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .page-wrapper {
          min-height: 100vh;
          background: linear-gradient(to bottom, #f8fafc, #e2e8f0);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }

        .header {
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-icon {
          font-size: 32px;
        }

        .logo h1 {
          font-size: 24px;
          font-weight: 800;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .nav-buttons {
          display: flex;
          gap: 12px;
        }

        .btn-cart, .btn-nav, .btn-login, .btn-register, .btn-logout {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .btn-cart {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }

        .btn-cart:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }

        .cart-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #ef4444;
          color: white;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
        }

        .btn-nav {
          background: #f1f5f9;
          color: #475569;
        }

        .btn-nav:hover {
          background: #e2e8f0;
        }

        .btn-login {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-login:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .btn-register {
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
        }

        .btn-register:hover {
          background: #667eea;
          color: white;
        }

        .btn-logout {
          background: #fee2e2;
          color: #991b1b;
        }

        .btn-logout:hover {
          background: #fecaca;
        }

        .main-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .hero {
          text-align: center;
          margin-bottom: 48px;
        }

        .hero h2 {
          font-size: 36px;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 12px;
        }

        .hero p {
          font-size: 18px;
          color: #64748b;
        }

        .login-notice {
          margin-top: 20px;
          padding: 16px 24px;
          background: #fef3c7;
          border: 2px solid #fbbf24;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          gap: 12px;
        }

        .notice-icon {
          font-size: 24px;
        }

        .login-notice p {
          font-size: 16px;
          color: #92400e;
          font-weight: 600;
          margin: 0;
        }

        .loading {
          text-align: center;
          padding: 60px 20px;
        }

        .spinner-large {
          width: 48px;
          height: 48px;
          border: 4px solid #e2e8f0;
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 16px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }

        .product-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transition: all 0.3s;
        }

        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .product-image {
          width: 100%;
          height: 200px;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .placeholder-image {
          font-size: 64px;
          opacity: 0.3;
        }

        .product-info {
          padding: 20px;
        }

        .product-name {
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 8px;
        }

        .product-category {
          display: inline-block;
          padding: 4px 12px;
          background: #e0e7ff;
          color: #4338ca;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .product-description {
          font-size: 14px;
          color: #64748b;
          margin-bottom: 16px;
          line-height: 1.5;
        }

        .product-price {
          font-size: 24px;
          font-weight: 800;
          color: #667eea;
          margin-bottom: 16px;
        }

        .btn-add-cart {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-add-cart:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }

        .btn-add-cart.disabled {
          background: linear-gradient(135deg, #64748b 0%, #475569 100%);
          cursor: pointer;
        }

        .btn-add-cart.disabled:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(100, 116, 139, 0.4);
        }

        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 60px 20px;
        }

        .empty-icon {
          font-size: 64px;
          display: block;
          margin-bottom: 16px;
          opacity: 0.3;
        }

        .empty-state p {
          font-size: 18px;
          color: #64748b;
        }

        .footer {
          background: white;
          padding: 24px;
          text-align: center;
          margin-top: 48px;
          border-top: 1px solid #e2e8f0;
        }

        .footer p {
          color: #64748b;
          font-size: 14px;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          max-width: 600px;
          width: 100%;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          padding: 24px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h2 {
          font-size: 24px;
          font-weight: 800;
          color: #1e293b;
        }

        .btn-close {
          background: #f1f5f9;
          border: none;
          border-radius: 8px;
          width: 36px;
          height: 36px;
          font-size: 20px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-close:hover {
          background: #e2e8f0;
        }

        .modal-body {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
        }

        .empty-cart {
          text-align: center;
          padding: 40px 20px;
        }

        .empty-cart .empty-icon {
          font-size: 64px;
          display: block;
          margin-bottom: 16px;
          opacity: 0.3;
        }

        .empty-cart p {
          font-size: 16px;
          color: #64748b;
        }

        .cart-items {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
        }

        .cart-item {
          display: flex;
          gap: 16px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 12px;
        }

        .cart-item-image {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 8px;
          flex-shrink: 0;
        }

        .cart-item-info {
          flex: 1;
        }

        .cart-item-info h4 {
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 4px;
        }

        .cart-item-price {
          font-size: 18px;
          font-weight: 700;
          color: #667eea;
        }

        .cart-item-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: flex-end;
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          background: white;
          border-radius: 8px;
          padding: 4px;
        }

        .btn-qty {
          width: 28px;
          height: 28px;
          border: none;
          background: #667eea;
          color: white;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-qty:hover {
          background: #5568d3;
        }

        .quantity {
          min-width: 32px;
          text-align: center;
          font-weight: 700;
          color: #1e293b;
        }

        .btn-remove {
          background: #fee2e2;
          border: none;
          border-radius: 6px;
          padding: 6px 12px;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-remove:hover {
          background: #fecaca;
        }

        .cart-summary {
          background: #f8fafc;
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 16px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          color: #64748b;
        }

        .summary-row.total {
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
          margin-top: 8px;
          padding-top: 12px;
          border-top: 2px solid #e2e8f0;
        }

        .summary-value {
          font-weight: 700;
        }

        .btn-checkout {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 18px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-checkout:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            gap: 16px;
          }

          .nav-buttons {
            width: 100%;
            justify-content: center;
            flex-wrap: wrap;
          }

          .hero h2 {
            font-size: 28px;
          }

          .products-grid {
            grid-template-columns: 1fr;
          }

          .cart-item {
            flex-direction: column;
          }

          .cart-item-image {
            width: 100%;
            height: 150px;
          }

          .cart-item-actions {
            flex-direction: row;
            justify-content: space-between;
            width: 100%;
          }

          .login-notice {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </>
  );
}