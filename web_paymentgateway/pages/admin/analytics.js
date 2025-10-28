// Lokasi: pages/admin/analytics.js

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminAnalytics() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('daily'); // daily or monthly
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0
  });

  useEffect(() => {
    const token = localStorage.getItem('admin-token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin-token');
      
      const res = await fetch(`/api/admin/analytics?period=${period}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setChartData(data.chartData || []);
        setStats(data.stats || {});
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin-token');
    router.push('/admin/login');
  };

  // Format currency
  const formatCurrency = (value) => {
    return `Rp ${value.toLocaleString('id-ID')}`;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: '#2563eb', 
        color: 'white', 
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0 }}>Analytics & Reports</h1>
          <button onClick={handleLogout} style={{
            backgroundColor: 'white',
            color: '#2563eb',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
        
        {/* Navigation Menu */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap'
        }}>
          <Link href="/admin/dashboard">
            <span style={{
              padding: '10px 20px',
              backgroundColor: '#64748b',
              color: 'white',
              borderRadius: '4px',
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-block'
            }}>Dashboard</span>
          </Link>
          <Link href="/admin/orders">
            <span style={{
              padding: '10px 20px',
              backgroundColor: '#64748b',
              color: 'white',
              borderRadius: '4px',
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-block'
            }}>Orders</span>
          </Link>
          <Link href="/admin/products">
            <span style={{
              padding: '10px 20px',
              backgroundColor: '#64748b',
              color: 'white',
              borderRadius: '4px',
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-block'
            }}>Products</span>
          </Link>
          <Link href="/admin/analytics">
            <span style={{
              padding: '10px 20px',
              backgroundColor: '#2563eb',
              color: 'white',
              borderRadius: '4px',
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-block'
            }}>Analytics</span>
          </Link>
        </div>

        {/* Period Toggle */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          display: 'flex',
          gap: '10px',
          alignItems: 'center'
        }}>
          <span style={{ fontWeight: 'bold', marginRight: '10px' }}>View by:</span>
          <button
            onClick={() => setPeriod('daily')}
            style={{
              padding: '8px 20px',
              backgroundColor: period === 'daily' ? '#2563eb' : '#e2e8f0',
              color: period === 'daily' ? 'white' : '#475569',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: period === 'daily' ? 'bold' : 'normal'
            }}
          >
            Daily (Last 30 Days)
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            style={{
              padding: '8px 20px',
              backgroundColor: period === 'monthly' ? '#2563eb' : '#e2e8f0',
              color: period === 'monthly' ? 'white' : '#475569',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: period === 'monthly' ? 'bold' : 'normal'
            }}
          >
            Monthly (Last 12 Months)
          </button>
        </div>

        {/* Summary Stats */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#64748b', fontSize: '14px' }}>
              Total Revenue ({period === 'daily' ? '30 Days' : '12 Months'})
            </h3>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>
              {formatCurrency(stats.totalRevenue || 0)}
            </p>
          </div>

          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#64748b', fontSize: '14px' }}>Total Orders</h3>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#2563eb' }}>
              {stats.totalOrders || 0}
            </p>
          </div>

          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#64748b', fontSize: '14px' }}>Avg Order Value</h3>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>
              {formatCurrency(stats.avgOrderValue || 0)}
            </p>
          </div>
        </div>

        {/* Revenue Chart */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '30px', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h2 style={{ marginTop: 0, marginBottom: '20px' }}>
            Revenue Trend ({period === 'daily' ? 'Daily' : 'Monthly'})
          </h2>
          
          {loading ? (
            <p style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading chart...</p>
          ) : chartData.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              No data available for this period
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis tickFormatter={(value) => `Rp ${(value / 1000000).toFixed(1)}M`} />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  labelStyle={{ color: '#000' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Revenue"
                  dot={{ fill: '#10b981', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Orders Chart */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '30px', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginTop: 0, marginBottom: '20px' }}>
            Orders Count ({period === 'daily' ? 'Daily' : 'Monthly'})
          </h2>
          
          {loading ? (
            <p style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading chart...</p>
          ) : chartData.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              No data available for this period
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip 
                  labelStyle={{ color: '#000' }}
                />
                <Legend />
                <Bar dataKey="orders" fill="#2563eb" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}