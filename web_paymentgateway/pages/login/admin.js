import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function AdminLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/login', {
        email: form.email,
        password: form.password,
      });

      if (res.data.isAdmin) {
        setMessage('✅ Login admin berhasil! Mengalihkan...');
        localStorage.setItem('admin-token', res.data.token);
        
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 1000);
      } else {
        setError('Akun ini bukan admin. Silakan login sebagai customer.');
      }

    } catch (err) {
      setError(err.response?.data?.error || 'Login gagal. Periksa email dan password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="page-wrapper">
        <div className="background-decoration">
          <div className="circle circle-1"></div>
          <div className="circle circle-2"></div>
          <div className="circle circle-3"></div>
        </div>

        <div className="container">
          <div className="logo-section">
            <div className="logo">👨‍💼</div>
            <h2>Login Admin</h2>
            <p className="subtitle">Masuk ke dashboard admin</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <label htmlFor="email">
                <span className="label-icon">📧</span>
                Email Admin
              </label>
              <input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">
                <span className="label-icon">🔒</span>
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Masukkan password admin"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary admin">
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Memproses...
                </>
              ) : (
                <>
                  <span>🚀</span>
                  Login Admin
                </>
              )}
            </button>
          </form>

          {message && (
            <div className="alert success">
              <span className="alert-icon">✓</span>
              {message}
            </div>
          )}
          {error && (
            <div className="alert error">
              <span className="alert-icon">✕</span>
              {error}
            </div>
          )}

          <div className="footer">
            <a href="/login" className="link">
              ← Kembali ke pilihan login
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .page-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          position: relative;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }

        .background-decoration {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 0;
          pointer-events: none;
        }

        .circle {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          animation: float 20s infinite ease-in-out;
        }

        .circle-1 {
          width: 300px;
          height: 300px;
          top: -100px;
          left: -100px;
        }

        .circle-2 {
          width: 200px;
          height: 200px;
          bottom: -50px;
          right: -50px;
          animation-delay: 5s;
        }

        .circle-3 {
          width: 150px;
          height: 150px;
          top: 50%;
          right: 10%;
          animation-delay: 10s;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.5;
          }
          50% {
            transform: translateY(-30px) rotate(180deg);
            opacity: 0.8;
          }
        }

        .container {
          width: 100%;
          max-width: 440px;
          position: relative;
          z-index: 1;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          padding: 40px;
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.3),
            0 0 0 1px rgba(255, 255, 255, 0.1);
          animation: slideUp 0.5s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .logo-section {
          text-align: center;
          margin-bottom: 32px;
        }

        .logo {
          font-size: 64px;
          margin-bottom: 16px;
        }

        h2 {
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 8px;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .subtitle {
          color: #64748b;
          font-size: 15px;
          font-weight: 500;
        }
        
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        label {
          font-size: 14px;
          font-weight: 700;
          color: #334155;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        input {
          width: 100%;
          padding: 14px 18px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 16px;
          transition: all 0.3s;
        }
        
        input:focus {
          border-color: #f59e0b;
          outline: none;
          box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.1);
        }

        .btn-primary {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 17px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .btn-primary.admin {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
        }

        .alert {
          margin-top: 20px;
          padding: 16px 20px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .success {
          color: #065f46;
          background: #d1fae5;
          border: 2px solid #6ee7b7;
        }
        
        .error {
          color: #991b1b;
          background: #fee2e2;
          border: 2px solid #fca5a5;
        }

        .footer {
          margin-top: 32px;
          text-align: center;
          padding-top: 24px;
          border-top: 2px solid #f1f5f9;
        }

        .link {
          color: #f59e0b;
          text-decoration: none;
          font-size: 15px;
          font-weight: 700;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}