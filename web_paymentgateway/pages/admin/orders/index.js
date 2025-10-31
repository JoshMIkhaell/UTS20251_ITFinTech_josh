// Lokasi: pages/admin/orders/index.js

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function AdminOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('admin-token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin-token');
      
      const url = filter === 'ALL' 
        ? '/api/admin/orders'
        : `/api/admin/orders?status=${filter}`;

      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      } else if (res.status === 401) {
        router.push('/admin/login');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    const statusLabel = newStatus === 'LUNAS' ? 'Lunas (Paid)' : 'Pending';
    
    if (!confirm(`Apakah Anda yakin ingin mengubah status order ini menjadi ${statusLabel}?`)) {
      return;
    }

    setUpdatingOrderId(orderId);

    try {
      const token = localStorage.getItem('admin-token');
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert('✅ Status order berhasil diupdate!');
        fetchOrders(); // Refresh data
      } else {
        alert('❌ Gagal update status: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('❌ Terjadi kesalahan saat update status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin-token');
    router.push('/admin/login');
  };

  const getStatusDisplay = (status) => {
    if (status === 'PAID' || status === 'LUNAS') {
      return { label: '✓ Lunas', bg: '#d1fae5', color: '#065f46' };
    }
    return { label: '⏳ Waiting Payment', bg: '#fef3c7', color: '#92400e' };
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .action-btn {
          padding: 6px 12px;
          border: none;
          borderRadius: 6px;
          fontSize: 12px;
          fontWeight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin: 2px;
        }
        .action-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>

      {/* Header */}
      <div style={{ 
        backgroundColor: '#2563eb', 
        color: 'white', 
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>📦 Orders Management</h1>
          <button 
            onClick={handleLogout}
            style={{
              backgroundColor: 'white',
              color: '#2563eb',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
        
        {/* Navigation Menu */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '15px', 
          borderRadius: '12px', 
          marginBottom: '20px',
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <Link href="/admin/dashboard">
            <span style={{
              padding: '10px 20px',
              backgroundColor: '#64748b',
              color: 'white',
              borderRadius: '8px',
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-block',
              fontWeight: '600',
              fontSize: '14px'
            }}>📊 Dashboard</span>
          </Link>
          <Link href="/admin/orders">
            <span style={{
              padding: '10px 20px',
              backgroundColor: '#2563eb',
              color: 'white',
              borderRadius: '8px',
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-block',
              fontWeight: '600',
              fontSize: '14px'
            }}>📦 Orders</span>
          </Link>
          <Link href="/admin/products">
            <span style={{
              padding: '10px 20px',
              backgroundColor: '#64748b',
              color: 'white',
              borderRadius: '8px',
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-block',
              fontWeight: '600',
              fontSize: '14px'
            }}>🛍️ Products</span>
          </Link>
        </div>

        {/* Filter Buttons */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '12px', 
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '16px', fontWeight: '600' }}>Filter by Status:</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setFilter('ALL')}
              style={{
                padding: '10px 20px',
                backgroundColor: filter === 'ALL' ? '#2563eb' : '#f1f5f9',
                color: filter === 'ALL' ? 'white' : '#64748b',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
            >
              All Orders
            </button>
            <button
              onClick={() => setFilter('PENDING')}
              style={{
                padding: '10px 20px',
                backgroundColor: filter === 'PENDING' ? '#f59e0b' : '#f1f5f9',
                color: filter === 'PENDING' ? 'white' : '#64748b',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
            >
              ⏳ Waiting Payment
            </button>
            <button
              onClick={() => setFilter('PAID')}
              style={{
                padding: '10px 20px',
                backgroundColor: filter === 'PAID' ? '#10b981' : '#f1f5f9',
                color: filter === 'PAID' ? 'white' : '#64748b',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
            >
              ✅ Lunas
            </button>
            <button
              onClick={() => setFilter('LUNAS')}
              style={{
                padding: '10px 20px',
                backgroundColor: filter === 'LUNAS' ? '#10b981' : '#f1f5f9',
                color: filter === 'LUNAS' ? 'white' : '#64748b',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
            >
              ✅ Lunas (Alt)
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px', fontWeight: '600' }}>Total Orders</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2563eb' }}>{orders.length}</div>
          </div>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px', fontWeight: '600' }}>Pending</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>
              {orders.filter(o => o.status === 'PENDING').length}
            </div>
          </div>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px', fontWeight: '600' }}>Paid/Lunas</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>
              {orders.filter(o => o.status === 'PAID' || o.status === 'LUNAS').length}
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '24px', 
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
              Orders List ({orders.length})
            </h2>
            <button 
              onClick={fetchOrders}
              disabled={loading}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: loading ? '#e2e8f0' : '#f1f5f9',
                border: 'none', 
                borderRadius: '6px', 
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600', 
                fontSize: '14px',
                color: '#475569',
                transition: 'all 0.2s'
              }}
            >
              {loading ? '⏳ Loading...' : '🔄 Refresh'}
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ width: '50px', height: '50px', border: '5px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
              <p style={{ color: '#64748b', fontWeight: '600' }}>Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.3 }}>📦</div>
              <p style={{ color: '#64748b', fontSize: '16px', margin: 0 }}>
                Belum ada orders {filter !== 'ALL' && `dengan status "${filter}"`}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '14px' }}>Order ID</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '14px' }}>Customer</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#475569', fontSize: '14px' }}>Product</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#475569', fontSize: '14px' }}>Amount</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#475569', fontSize: '14px' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#475569', fontSize: '14px' }}>Date</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#475569', fontSize: '14px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const statusDisplay = getStatusDisplay(order.status);
                    const isPending = order.status === 'PENDING';
                    const isPaid = order.status === 'PAID' || order.status === 'LUNAS';

                    return (
                      <tr key={order._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '12px', fontFamily: 'monospace', color: '#64748b', fontSize: '13px' }}>
                          #{order._id?.slice(-8)}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '2px' }}>
                            {order.customerName || 'N/A'}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            {order.customerEmail || ''}
                          </div>
                        </td>
                        <td style={{ padding: '12px', fontSize: '14px', maxWidth: '250px' }}>
                          {order.productName || order.product?.name || 'N/A'}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: '700', color: '#2563eb', fontSize: '15px' }}>
                          Rp {(order.amount || 0).toLocaleString('id-ID')}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span style={{
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            backgroundColor: statusDisplay.bg,
                            color: statusDisplay.color,
                            whiteSpace: 'nowrap',
                            display: 'inline-block'
                          }}>
                            {statusDisplay.label}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                          {new Date(order.createdAt).toLocaleString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {isPending && (
                              <button
                                className="action-btn"
                                onClick={() => handleUpdateStatus(order._id, 'LUNAS')}
                                disabled={updatingOrderId === order._id}
                                style={{
                                  backgroundColor: '#10b981',
                                  color: 'white'
                                }}
                              >
                                {updatingOrderId === order._id ? '⏳' : '✅'} Mark Paid
                              </button>
                            )}
                            {isPaid && (
                              <button
                                className="action-btn"
                                onClick={() => handleUpdateStatus(order._id, 'PENDING')}
                                disabled={updatingOrderId === order._id}
                                style={{
                                  backgroundColor: '#f59e0b',
                                  color: 'white'
                                }}
                              >
                                {updatingOrderId === order._id ? '⏳' : '⏳'} Mark Pending
                              </button>
                            )}
                            <button
                              className="action-btn"
                              onClick={() => {
                                const details = `ORDER DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Order ID: ${order._id}
Customer: ${order.customerName || 'N/A'}
Email: ${order.customerEmail || 'N/A'}
Products: ${order.productName || 'N/A'}
Total: Rp ${(order.amount || 0).toLocaleString('id-ID')}
Status: ${order.status}
Date: ${new Date(order.createdAt).toLocaleString('id-ID')}`;
                                alert(details);
                              }}
                              style={{
                                backgroundColor: '#64748b',
                                color: 'white'
                              }}
                            >
                              👁️ View
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}