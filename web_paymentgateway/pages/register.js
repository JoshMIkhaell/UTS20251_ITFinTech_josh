import { useState } from 'react';
import axios from 'axios';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: 'customer', // default
  });
  const [message, setMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      // Kirim role ke API, isAdmin otomatis diatur di backend
      const res = await axios.post('/api/auth/register', form);
      setMessage('✅ Registrasi berhasil! Silakan login.');
    } catch (err) {
      setMessage(err.response?.data?.error || '❌ Gagal registrasi.');
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '50px auto', textAlign: 'center' }}>
      <h2>Daftar Akun Baru</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nama"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        /><br />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        /><br />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        /><br />
        <input
          type="tel"
          placeholder="Nomor WhatsApp (+628...)"
          value={form.phoneNumber}
          onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
          required
        /><br /><br />

        {/* Pilihan join sebagai Customer atau Admin */}
        <div style={{ textAlign: 'left', marginBottom: 10 }}>
          <label>
            <input
              type="radio"
              name="role"
              value="customer"
              checked={form.role === 'customer'}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            />{' '}
            Customer
          </label>
          <br />
          <label>
            <input
              type="radio"
              name="role"
              value="admin"
              checked={form.role === 'admin'}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            />{' '}
            Admin
          </label>
        </div>

        <button type="submit">Daftar</button>
      </form>
      <p style={{ color: 'green', marginTop: 10 }}>{message}</p>
      <a href="/login">Sudah punya akun? Login di sini</a>
    </div>
  );
}
