// pages/admin/index.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function AdminDashboard() {
  const router = useRouter();
  const [checkouts, setCheckouts] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    // Cek apakah admin sudah login
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');

    if (!token || !user) {
      // Jika belum login, redirect ke halaman login
      router.push('/admin/login');
      return;
    }

    setAdminUser(JSON.parse(user));

    // Setup axios dengan token untuk semua request
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // Fetch data dashboard
    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      const [checkoutRes, summaryRes] = await Promise.all([
        axios.get('/api/checkout'),
        axios.get('/api/checkout/summary')
      ]);
      
      setCheckouts(checkoutRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      
      // Jika error 401/403, berarti token invalid/expired
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert('Sesi login Anda telah berakhir. Silakan login kembali.');
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Hapus data login dari localStorage
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    
    // Hapus token dari axios headers
    delete axios.defaults.headers.common['Authorization'];
    
    // Redirect ke halaman login
    router.push('/admin/login');
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // Panggil API untuk update status menggunakan endpoint [id].js
      await axios.put(`/api/admin/orders/${orderId}`, { status: newStatus });
      
      // Refresh data setelah update
      const res = await axios.get('/api/checkout');
      setCheckouts(res.data);
      
      alert('Status berhasil diupdate!');
    } catch (err) {
      console.error('Error update status:', err);
      alert('Gagal update status: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) {
    return (
      <div style={{ 
        padding: 20, 
        textAlign: 'center',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <h2>Loading Dashboard...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header dengan tombol logout */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 30,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 8,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: 0 }}>Dashboard Admin</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
          <span style={{ fontSize: 14 }}>
            Halo, <strong>{adminUser?.name || adminUser?.email}</strong>
          </span>
          <button 
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 'bold'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Grafik Omzet */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: 20, 
        borderRadius: 8,
        marginBottom: 20,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2>Grafik Omzet Harian</h2>
        <div style={{ width: '100%', maxWidth: 800, margin: '0 auto' }}>
          <Line
            data={{
              labels: summary.map((s) => s._id),
              datasets: [
                {
                  label: 'Total Omzet (Rp)',
                  data: summary.map((s) => s.total),
                  borderColor: '#0070f3',
                  backgroundColor: 'rgba(0, 112, 243, 0.1)',
                  tension: 0.4,
                  fill: true,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: true,
              plugins: {
                legend: {
                  display: true,
                  position: 'top',
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return 'Omzet: Rp ' + context.parsed.y.toLocaleString('id-ID');
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function(value) {
                      return 'Rp ' + value.toLocaleString('id-ID');
                    }
                  }
                }
              }
            }}
          />
        </div>
      </div>

      {/* Daftar Checkout */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: 20, 
        borderRadius: 8,
        marginBottom: 20,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2>Daftar Pembelian / Checkout</h2>
        <div style={{ overflowX: 'auto' }}>
          <table
            border="1"
            cellPadding="12"
            style={{ width: '100%', borderCollapse: 'collapse' }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ textAlign: 'left' }}>User</th>
                <th style={{ textAlign: 'left' }}>Email</th>
                <th style={{ textAlign: 'right' }}>Total</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'center' }}>Tanggal</th>
                <th style={{ textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {checkouts.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: 30, color: '#666' }}>
                    Belum ada data checkout
                  </td>
                </tr>
              ) : (
                checkouts.map((ch) => (
                  <tr key={ch._id}>
                    <td>{ch.userId?.name || '-'}</td>
                    <td>{ch.userId?.email || '-'}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                      Rp {(ch.total || ch.totalAmount || 0).toLocaleString('id-ID')}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        backgroundColor: ch.status === 'PAID' ? '#d4edda' : 
                                       ch.status === 'PENDING' ? '#fff3cd' : '#f8d7da',
                        color: ch.status === 'PAID' ? '#155724' : 
                               ch.status === 'PENDING' ? '#856404' : '#721c24'
                      }}>
                        {ch.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {new Date(ch.createdAt).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <select 
                        value={ch.status}
                        onChange={(e) => updateOrderStatus(ch._id, e.target.value)}
                        style={{ 
                          padding: '6px 10px',
                          borderRadius: '4px',
                          border: '1px solid #ddd',
                          cursor: 'pointer',
                          fontSize: '13px'
                        }}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="PAID">PAID</option>
                        <option value="EXPIRED">EXPIRED</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD Produk */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: 20, 
        borderRadius: 8,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2>Manajemen Produk</h2>
        <ProductManager />
      </div>
    </div>
  );
}

function ProductManager() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ 
    name: '', 
    price: 0, 
    category: '', 
    description: '' 
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const res = await axios.get('/api/products');
      // Handle berbagai format response
      setProducts(res.data.data || res.data);
    } catch (err) {
      console.error('Gagal ambil produk:', err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/api/products/${editingId}`, form);
      } else {
        await axios.post('/api/products', form);
      }
      setForm({ name: '', price: 0, category: '', description: '' });
      setEditingId(null);
      fetchProducts();
      alert('Produk berhasil disimpan!');
    } catch (err) {
      console.error('Gagal simpan produk:', err);
      alert('Gagal menyimpan produk: ' + (err.response?.data?.error || err.message));
    }
  }

  async function handleDelete(id) {
    if (!confirm('Yakin ingin hapus produk ini?')) return;
    try {
      await axios.delete(`/api/products/${id}`);
      fetchProducts();
      alert('Produk berhasil dihapus!');
    } catch (err) {
      console.error('Gagal hapus produk:', err);
      alert('Gagal hapus produk: ' + (err.response?.data?.error || err.message));
    }
  }

  function handleEdit(p) {
    setForm({ 
      name: p.name, 
      price: p.price,
      category: p.category || '',
      description: p.description || ''
    });
    setEditingId(p._id);
  }

  return (
    <div style={{ marginTop: 20 }}>
      {/* Form Input Produk */}
      <form 
        onSubmit={handleSubmit} 
        style={{ 
          marginBottom: 30, 
          padding: 20, 
          backgroundColor: '#f8f9fa', 
          borderRadius: 8,
          border: '1px solid #dee2e6'
        }}
      >
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: 15,
          marginBottom: 15 
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold', fontSize: 14 }}>
              Nama Produk *
            </label>
            <input
              type="text"
              placeholder="Nama produk"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              style={{ width: '100%', padding: 10, borderRadius: 4, border: '1px solid #ddd' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold', fontSize: 14 }}>
              Harga (Rp) *
            </label>
            <input
              type="number"
              placeholder="Harga"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              required
              style={{ width: '100%', padding: 10, borderRadius: 4, border: '1px solid #ddd' }}
            />
          </div>
        </div>
        
        <div style={{ marginBottom: 15 }}>
          <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold', fontSize: 14 }}>
            Kategori
          </label>
          <input
            type="text"
            placeholder="Kategori produk"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            style={{ width: '100%', padding: 10, borderRadius: 4, border: '1px solid #ddd' }}
          />
        </div>

        <div style={{ marginBottom: 15 }}>
          <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold', fontSize: 14 }}>
            Deskripsi
          </label>
          <textarea
            placeholder="Deskripsi produk"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            style={{ 
              width: '100%', 
              padding: 10, 
              borderRadius: 4, 
              border: '1px solid #ddd',
              minHeight: 80,
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            type="submit"
            style={{ 
              padding: '10px 20px',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {editingId ? '✓ Update Produk' : '+ Tambah Produk'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm({ name: '', price: 0, category: '', description: '' });
              }}
              style={{ 
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              Batal
            </button>
          )}
        </div>
      </form>

      {/* Tabel Produk */}
      <div style={{ overflowX: 'auto' }}>
        <table
          border="1"
          cellPadding="12"
          style={{ borderCollapse: 'collapse', width: '100%' }}
        >
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ textAlign: 'left' }}>Nama Produk</th>
              <th style={{ textAlign: 'left' }}>Kategori</th>
              <th style={{ textAlign: 'right' }}>Harga</th>
              <th style={{ textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: 30, color: '#666' }}>
                  Belum ada produk
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td>{p.category || '-'}</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                    Rp {p.price.toLocaleString('id-ID')}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button 
                      onClick={() => handleEdit(p)}
                      style={{ 
                        marginRight: 8, 
                        padding: '6px 12px',
                        backgroundColor: '#ffc107',
                        color: '#000',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      style={{ 
                        padding: '6px 12px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer'
                      }}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}