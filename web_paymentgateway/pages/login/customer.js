import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function CustomerLogin() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1=Email/Pass, 2=OTP
  const [form, setForm] = useState({ email: '', password: '', otp: '' });
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
        setError('Akun ini adalah admin. Silakan login melalui halaman admin.');
        setLoading(false);
        return;
      }

      if (res.data.requireOTP) {
        setMessage('📱 OTP telah dikirim ke WhatsApp kamu!');
        setTimeout(() => {
          setStep(2); // Pindah ke step 2 setelah 500ms
        }, 500);
      } else {
        setError('Terjadi kesalahan. Silakan coba lagi.');
      }

    } catch (err) {
      setError(err.response?.data?.error || 'Login gagal. Periksa email dan password.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOTP(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/verify-otp', {
        email: form.email,
        code: form.otp,
      });

      setMessage('✅ Login berhasil! Mengalihkan...');
      localStorage.setItem('token', res.data.token);
      
      setTimeout(() => {
        router.push('/');
      }, 1000);

    } catch (err) {
      setError(err.response?.data?.error || 'Kode OTP salah atau sudah kadaluarsa.');
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
          {/* Step Indicator */}
          <div className="step-indicator">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <div className="step-label">Login</div>
            </div>
            <div className="step-line"></div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-label">OTP</div>
            </div>
          </div>

          <div className="logo-section">
            <div className="logo">{step === 1 ? '👤' : '📱'}</div>
            <h2>{step === 1 ? 'Login Customer' : 'Verifikasi OTP'}</h2>
            <p className="subtitle">
              {step === 1 
                ? 'Masuk dengan verifikasi OTP WhatsApp' 
                : 'Masukkan kode yang dikirim ke WhatsApp'}
            </p>
          </div>

          {/* STEP 1: Email & Password */}
          {step === 1 && (
            <form onSubmit={handleLogin} className="login-form">
              <div className="input-group">
                <label htmlFor="email">
                  <span className="label-icon">📧</span>
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="contoh@email.com"
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
                  placeholder="Masukkan password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Memproses...
                  </>
                ) : (
                  <>
                    <span>📱</span>
                    Kirim OTP ke WhatsApp
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: Input OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="login-form otp-form">
              <div className="otp-box">
                <div className="otp-icon">📱</div>
                <p className="otp-info">
                  Kode OTP telah dikirim ke WhatsApp
                </p>
                <p className="otp-email">{form.email}</p>
              </div>

              <div className="input-group">
                <label htmlFor="otp">
                  <span className="label-icon">🔢</span>
                  Kode OTP (6 digit)
                </label>
                <input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  value={form.otp}
                  onChange={(e) => setForm({ ...form, otp: e.target.value.replace(/\D/g, '') })}
                  required
                  maxLength="6"
                  disabled={loading}
                  className="otp-input"
                  autoComplete="one-time-code"
                  autoFocus
                />
                <small className="input-hint">⏱️ Berlaku 5 menit</small>
              </div>

              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Memverifikasi...
                  </>
                ) : (
                  <>
                    <span>✅</span>
                    Verifikasi OTP
                  </>
                )}
              </button>

              <button 
                type="button" 
                onClick={() => {
                  setStep(1);
                  setForm({ ...form, otp: '' });
                  setError('');
                  setMessage('');
                }}
                className="btn-secondary"
                disabled={loading}
              >
                ← Kembali ke Login
              </button>
            </form>
          )}

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

          {step === 1 && (
            <div className="footer">
              <p>Belum punya akun?</p>
              <a href="/register" className="link">
                Daftar sekarang →
              </a>
              <br />
              <a href="/login" className="link-back">
                ← Kembali ke pilihan login
              </a>
            </div>
          )}
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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

        /* Step Indicator */
        .step-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 32px;
          gap: 16px;
        }

        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .step-number {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #e2e8f0;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 16px;
          transition: all 0.3s;
        }

        .step.active .step-number {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          transform: scale(1.1);
        }

        .step-label {
          font-size: 12px;
          font-weight: 600;
          color: #94a3b8;
          transition: all 0.3s;
        }

        .step.active .step-label {
          color: #667eea;
        }

        .step-line {
          width: 60px;
          height: 2px;
          background: #e2e8f0;
        }

        .logo-section {
          text-align: center;
          margin-bottom: 32px;
        }

        .logo {
          font-size: 64px;
          margin-bottom: 16px;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        h2 {
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 8px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.2;
        }

        .subtitle {
          color: #64748b;
          font-size: 15px;
          font-weight: 500;
          margin: 0;
          line-height: 1.5;
        }
        
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .otp-form {
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
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

        .label-icon {
          font-size: 16px;
        }
        
        input {
          width: 100%;
          padding: 14px 18px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 16px;
          box-sizing: border-box;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: white;
          font-family: inherit;
        }
        
        input:focus {
          border-color: #667eea;
          outline: none;
          box-shadow: 
            0 0 0 4px rgba(102, 126, 234, 0.1),
            0 4px 12px rgba(102, 126, 234, 0.2);
          transform: translateY(-2px);
        }

        input:disabled {
          background-color: #f1f5f9;
          cursor: not-allowed;
          opacity: 0.7;
        }

        .otp-input {
          text-align: center;
          font-size: 32px;
          font-weight: 800;
          letter-spacing: 16px;
          font-family: 'Courier New', monospace;
          padding: 20px;
        }

        .input-hint {
          font-size: 12px;
          color: #94a3b8;
          font-style: italic;
          display: block;
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
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.5);
        }

        .btn-primary:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-primary:disabled {
          background: #cbd5e1;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          display: inline-block;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .btn-secondary {
          width: 100%;
          padding: 14px;
          background-color: #f1f5f9;
          color: #475569;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary:hover:not(:disabled) {
          background-color: #e2e8f0;
          border-color: #cbd5e1;
        }

        .btn-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .otp-box {
          background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
          border: 2px solid #93c5fd;
          border-radius: 16px;
          padding: 24px;
          text-align: center;
        }

        .otp-icon {
          font-size: 48px;
          margin-bottom: 12px;
          animation: bounce 2s ease-in-out infinite;
          display: block;
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .otp-info {
          font-size: 15px;
          color: #1e40af;
          margin: 0 0 8px 0;
          font-weight: 600;
          line-height: 1.5;
        }

        .otp-email {
          font-size: 14px;
          color: #3b82f6;
          font-weight: 700;
          margin: 0;
          word-break: break-all;
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
          animation: slideIn 0.3s ease-out;
          line-height: 1.5;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .alert-icon {
          font-size: 20px;
          font-weight: 900;
          flex-shrink: 0;
        }
        
        .success {
          color: #065f46;
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          border: 2px solid #6ee7b7;
        }
        
        .error {
          color: #991b1b;
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
          border: 2px solid #fca5a5;
        }
        
        .footer {
          margin-top: 32px;
          text-align: center;
          padding-top: 24px;
          border-top: 2px solid #f1f5f9;
        }

        .footer p {
          font-size: 14px;
          color: #64748b;
          margin: 0 0 8px 0;
          font-weight: 500;
        }

        .link {
          color: #667eea;
          text-decoration: none;
          font-size: 15px;
          font-weight: 700;
          transition: all 0.2s;
          display: inline-block;
        }
        
        .link:hover {
          color: #764ba2;
          transform: translateX(4px);
        }

        .link-back {
          color: #94a3b8;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s;
          display: inline-block;
          margin-top: 12px;
        }

        .link-back:hover {
          color: #64748b;
        }

        @media (max-width: 480px) {
          .container {
            padding: 28px 24px;
          }

          h2 {
            font-size: 28px;
          }

          .logo {
            font-size: 56px;
          }

          .otp-input {
            font-size: 24px;
            letter-spacing: 8px;
            padding: 16px;
          }

          .page-wrapper {
            padding: 16px;
          }
        }
      `}</style>
    </>
  );
}