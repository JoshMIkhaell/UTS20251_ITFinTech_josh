import { useRouter } from 'next/router';

export default function LoginSelector() {
  const router = useRouter();

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
            <div className="logo">🔐</div>
            <h2>Pilih Jenis Login</h2>
            <p className="subtitle">Silakan pilih cara login Anda</p>
          </div>

          <div className="login-options">
            <div className="option-card" onClick={() => router.push('/login/customer')}>
              <div className="option-icon">👤</div>
              <h3>Login Customer</h3>
              <p>Masuk sebagai pembeli dengan verifikasi OTP WhatsApp</p>
              <button className="btn-option">
                Masuk sebagai Customer →
              </button>
            </div>

            <div className="option-card" onClick={() => router.push('/login/admin')}>
              <div className="option-icon">👨‍💼</div>
              <h3>Login Admin</h3>
              <p>Masuk ke dashboard admin tanpa OTP</p>
              <button className="btn-option admin">
                Masuk sebagai Admin →
              </button>
            </div>
          </div>

          <div className="footer">
            <p>Belum punya akun?</p>
            <a href="/register" className="link">
              Daftar sebagai Customer →
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
          animation-delay: 0s;
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
          max-width: 800px;
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
          margin-bottom: 40px;
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

        .login-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }

        .option-card {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          padding: 32px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;
        }

        .option-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          border-color: #667eea;
        }

        .option-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .option-card h3 {
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 12px;
        }

        .option-card p {
          font-size: 14px;
          color: #64748b;
          margin-bottom: 24px;
          line-height: 1.6;
        }

        .btn-option {
          width: 100%;
          padding: 12px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-option:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .btn-option.admin {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }

        .btn-option.admin:hover {
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
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

        @media (max-width: 768px) {
          .login-options {
            grid-template-columns: 1fr;
          }

          .container {
            padding: 28px 24px;
          }

          h2 {
            font-size: 28px;
          }

          .logo {
            font-size: 56px;
          }
        }
      `}</style>
    </>
  );
}