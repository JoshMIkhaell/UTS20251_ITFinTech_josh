// Lokasi: pages/admin/dashboard.js

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    paidOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [chartData, setChartData] = useState({
    labels: [],
    pending: [],
    paid: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin-token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('admin-token');
      
      // Fetch all orders for stats and chart
      const ordersRes = await fetch('/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        const allOrders = ordersData.orders || [];
        
        // Calculate stats
        const totalOrders = allOrders.length;
        const pendingOrders = allOrders.filter(o => o.status === 'PENDING').length;
        const paidOrders = allOrders.filter(o => o.status === 'PAID' || o.status === 'LUNAS').length;
        const totalRevenue = allOrders
          .filter(o => o.status === 'PAID' || o.status === 'LUNAS')
          .reduce((sum, o) => sum + (o.amount || 0), 0);

        setStats({
          totalOrders,
          totalRevenue,
          pendingOrders,
          paidOrders
        });

        // Set recent orders (5 terbaru)
        setRecentOrders(allOrders.slice(0, 5));

        // Process chart data
        processChartData(allOrders);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const processChartData = (orders) => {
    // Group orders by date (last 7 days)
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      last7Days.push(date.toISOString().split('T')[0]);
    }

    const labels = last7Days.map(date => {
      const d = new Date(date);
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    });

    const pendingByDate = {};
    const paidByDate = {};

    last7Days.forEach(date => {
      pendingByDate[date] = 0;
      paidByDate[date] = 0;
    });

    orders.forEach(order => {
      const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
      if (pendingByDate.hasOwnProperty(orderDate)) {
        if (order.status === 'PAID' || order.status === 'LUNAS') {
          paidByDate[orderDate]++;
        } else if (order.status === 'PENDING') {
          pendingByDate[orderDate]++;
        }
      }
    });

    setChartData({
      labels,
      pending: last7Days.map(date => pendingByDate[date]),
      paid: last7Days.map(date => paidByDate[date])
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('admin-token');
    router.push('/admin/login');
  };

  // Simple Bar Chart Component
  const BarChart = ({ data }) => {
    const maxValue = Math.max(...data.pending, ...data.paid, 1);
    const chartHeight = 250;

    return (
      <div style={{ padding: '20px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', fontWeight: '700' }}>
          Orders Last 7 Days
        </h3>
        
        {/* Legend */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: '#f59e0b', borderRadius: '4px' }}></div>
            <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>Pending</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: '#10b981', borderRadius: '4px' }}></div>
            <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>Paid/Lunas</span>
          </div>
        </div>

        {/* Chart */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-end', 
          justifyContent: 'space-around',
          height: chartHeight + 'px',
          borderBottom: '2px solid #e2e8f0',
          padding: '0 10px',
          gap: '5px'
        }}>
          {data.labels.map((label, index) => {
            const pendingHeight = (data.pending[index] / maxValue) * chartHeight;
            const paidHeight = (data.paid[index] / maxValue) * chartHeight;
            
            return (
              <div key={index} style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                flex: 1,
                gap: '5px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  gap: '4px', 
                  alignItems: 'flex-end',
                  height: '100%'
                }}>
                  {/* Pending Bar */}
                  <div style={{
                    width: '20px',
                    height: pendingHeight > 0 ? pendingHeight + 'px' : '2px',
                    backgroundColor: '#f59e0b',
                    borderRadius: '4px 4px 0 0',
                    position: 'relative',
                    transition: 'height 0.3s ease'
                  }}>
                    {data.pending[index] > 0 && (
                      <span style={{
                        position: 'absolute',
                        top: '-20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: '#f59e0b'
                      }}>
                        {data.pending[index]}
                      </span>
                    )}
                  </div>
                  
                  {/* Paid Bar */}
                  <div style={{
                    width: '20px',
                    height: paidHeight > 0 ? paidHeight + 'px' : '2px',
                    backgroundColor: '#10b981',
                    borderRadius: '4px 4px 0 0',
                    position: 'relative',
                    transition: 'height 0.3s ease'
                  }}>
                    {data.paid[index] > 0 && (
                      <span style={{
                        position: 'absolute',
                        top: '-20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: '#10b981'
                      }}>
                        {data.paid[index]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* X-axis labels */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-around',
          marginTop: '10px',
          padding: '0 10px'
        }}>
          {data.labels.map((label, index) => (
            <div key={index} style={{ 
              flex: 1,
              textAlign: 'center',
              fontSize: '12px',
              color: '#64748b',
              fontWeight: '600'
            }}>
              {label}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '5px solid #e2e8f0',
            borderTopColor: '#2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#64748b', fontWeight: '600' }}>Loading dashboard...</p>
          <style jsx>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: '#2563eb', 
        color: 'white', 
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>📊 Dashboard Admin</h1>
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
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        
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
              backgroundColor: '#2563eb',
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
              backgroundColor: '#64748b',
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

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '24px', 
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px', 
                backgroundColor: '#dbeafe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>📦</div>
              <h3 style={{ margin: 0, color: '#64748b', fontSize: '14px', fontWeight: '600' }}>Total Orders</h3>
            </div>
            <p style={{ margin: 0, fontSize: '36px', fontWeight: 'bold', color: '#2563eb' }}>
              {stats.totalOrders}
            </p>
          </div>

          <div style={{ 
            backgroundColor: 'white', 
            padding: '24px', 
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px', 
                backgroundColor: '#d1fae5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>💰</div>
              <h3 style={{ margin: 0, color: '#64748b', fontSize: '14px', fontWeight: '600' }}>Total Revenue</h3>
            </div>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
              Rp {stats.totalRevenue.toLocaleString('id-ID')}
            </p>
          </div>

          <div style={{ 
            backgroundColor: 'white', 
            padding: '24px', 
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px', 
                backgroundColor: '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>⏳</div>
              <h3 style={{ margin: 0, color: '#64748b', fontSize: '14px', fontWeight: '600' }}>Pending Payment</h3>
            </div>
            <p style={{ margin: 0, fontSize: '36px', fontWeight: 'bold', color: '#f59e0b' }}>
              {stats.pendingOrders}
            </p>
          </div>

          <div style={{ 
            backgroundColor: 'white', 
            padding: '24px', 
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px', 
                backgroundColor: '#d1fae5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>✅</div>
              <h3 style={{ margin: 0, color: '#64748b', fontSize: '14px', fontWeight: '600' }}>Paid Orders</h3>
            </div>
            <p style={{ margin: 0, fontSize: '36px', fontWeight: 'bold', color: '#10b981' }}>
              {stats.paidOrders}
            </p>
          </div>
        </div>

        {/* Chart Section */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '24px', 
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          marginBottom: '30px'
        }}>
          {chartData.labels.length > 0 ? (
            <BarChart data={chartData} />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📊</div>
              <p>Belum ada data untuk ditampilkan</p>
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '24px', 
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '20px', fontWeight: 'bold' }}>
            📋 Recent Orders
          </h2>
          
          {recentOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>📦</div>
              <p style={{ color: '#64748b', margin: 0 }}>Belum ada orders</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Order ID</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Customer</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Product</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#475569' }}>Amount</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#475569' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, index) => (
                    <tr key={order._id || index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px', fontFamily: 'monospace', color: '#64748b', fontSize: '13px' }}>
                        #{order._id?.slice(-8)}
                      </td>
                      <td style={{ padding: '12px', fontWeight: '500' }}>{order.customerName}</td>
                      <td style={{ padding: '12px' }}>{order.productName}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#2563eb' }}>
                        Rp {order.amount?.toLocaleString('id-ID')}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span style={{
                          padding: '6px 14px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          backgroundColor: (order.status === 'PAID' || order.status === 'LUNAS') ? '#d1fae5' : '#fef3c7',
                          color: (order.status === 'PAID' || order.status === 'LUNAS') ? '#065f46' : '#92400e'
                        }}>
                          {(order.status === 'PAID' || order.status === 'LUNAS') ? '✅ Lunas' : '⏳ Pending'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', color: '#64748b' }}>
                        {new Date(order.createdAt).toLocaleDateString('id-ID', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <Link href="/admin/orders">
              <span style={{
                padding: '12px 24px',
                backgroundColor: '#2563eb',
                color: 'white',
                borderRadius: '8px',
                cursor: 'pointer',
                textDecoration: 'none',
                display: 'inline-block',
                fontWeight: 'bold',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}>View All Orders →</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}