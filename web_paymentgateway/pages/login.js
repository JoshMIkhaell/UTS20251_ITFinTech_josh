import { useState } from 'react';
import axios from 'axios';

export default function LoginPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ email: '', password: '', code: '' });
  // Pisahkan state untuk pesan sukses dan error
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setError(''); // Clear error sebelum mencoba
    setMessage(''); // Clear message sebelum mencoba
    try {
      const res = await axios.post('/api/auth/login', {
        email: form.email,
        password: form.password,
      });
      setMessage('OTP dikirim ke WhatsApp kamu!');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Login gagal.');
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    setError(''); // Clear error sebelum mencoba
    setMessage(''); // Clear message sebelum mencoba
    try {
      const res = await axios.post('/api/auth/verify-otp', {
        email: form.email,
        code: form.code,
      });
      setMessage('Login berhasil! Mengalihkan...');
      localStorage.setItem('token', res.data.token);
      
      // Redirect setelah jeda singkat agar user bisa baca pesan
      setTimeout(() => {
        if (res.data.isAdmin) window.location.href = '/admin/dashboard'; // Lebih spesifik ke dashboard
        else window.location.href = '/';
      }, 1000);

    } catch (err) {
      setError(err.response?.data?.error || 'Verifikasi OTP gagal.');
    }
  }

  return (
    <div className="container">
      <h2>Login</h2>

      {step === 1 && (
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button type="submit">Kirim OTP via WhatsApp</button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerify}>
          <p className="otp-info">
            Masukkan kode OTP yang dikirim ke WhatsApp kamu
          </p>
          <input
            type="text"
            placeholder="Kode OTP"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            required
          />
          <button type="submit">Verifikasi OTP</button>
        </form>
      )}

      {/* Tampilkan pesan sukses atau error */}
      {message && <p className="message success">{message}</p>}
      {error && <p className="message error">{error}</p>}

      {step === 1 && <a className="link" href="/register">Belum punya akun? Daftar di sini</a>}

      {/* Ini adalah block style JSX. Style ini hanya berlaku untuk komponen ini. */}
      <style jsx>{`
        .container {
          max-width: 400px;
          margin: 50px auto;
          padding: 24px;
          border: 1px solid #eaeaea;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          text-align: center;
          background-color: #ffffff;
        }

        h2 {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 24px;
          color: #333;
        }
        
        form {
          display: flex;
          flex-direction: column;
          gap: 16px; /* Memberi jarak antar elemen form, pengganti <br> */
        }
        
        input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 16px;
          box-sizing: border-box; /* Penting agar padding tidak menambah width */
        }
        
        input:focus {
          border-color: #0070f3;
          outline: none;
          box-shadow: 0 0 0 2px rgba(0, 112, 243, 0.2);
        }

        button {
          width: 100%;
          padding: 12px;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        
        button:hover {
          background-color: #005bb5;
        }
        
        .otp-info {
          font-size: 14px;
          color: #555;
          margin: 0;
        }

        .message {
          margin-top: 16px;
          font-size: 14px;
        }
        
        .success {
          color: green;
        }
        
        .error {
          color: red;
        }
        
        .link {
          display: block;
          margin-top: 20px;
          color: #0070f3;
          text-decoration: none;
          font-size: 14px;
        }
        
        .link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
