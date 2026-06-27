import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './AdminDashboard.css';

const STATUSES = ['Pending', 'Verified', 'Assigned', 'In Progress', 'Resolved', 'Rejected'];

const AdminDashboard = () => {
  const { user: currentUser } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [issues, setIssues] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [dashRes, usersRes, issuesRes] = await Promise.all([
        axios.get('/api/admin/dashboard'),
        axios.get('/api/admin/users'),
        axios.get('/api/admin/issues')
      ]);

      if (dashRes.data.success) setStats(dashRes.data.data);
      if (usersRes.data.success) setUsers(usersRes.data.data);
      if (issuesRes.data.success) setIssues(issuesRes.data.data);
    } catch (err) {
      console.error('Error loading admin data:', err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (issueId, newStatus) => {
    setStatusUpdating(issueId);
    try {
      const res = await axios.put(`/api/admin/issues/${issueId}/status`, { status: newStatus });
      if (res.data.success) {
        setIssues(issues.map((i) => i._id === issueId ? { ...i, status: newStatus } : i));
      }
    } catch (err) {
      console.error('Status update failed:', err.response?.data?.message);
    } finally {
      setStatusUpdating('');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user and all their associated data permanently?')) return;
    try {
      await axios.delete(`/api/admin/users/${userId}`);
      setUsers(users.filter((u) => u._id !== userId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleDeleteIssue = async (issueId) => {
    if (!window.confirm('Delete this issue permanently?')) return;
    try {
      await axios.delete(`/api/admin/issues/${issueId}`);
      setIssues(issues.filter((i) => i._id !== issueId));
    } catch (err) {
      alert('Failed to delete issue');
    }
  };

  const handleRoleUpdate = async (userId, newRole) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    try {
      const res = await axios.put(`/api/admin/users/${userId}/role`, { role: newRole });
      if (res.data.success) {
        setUsers(users.map((u) => u._id === userId ? { ...u, role: newRole } : u));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const getStatusClass = (s) => s?.toLowerCase().replace(' ', '');

  if (loading) return (
    <div className="dashboard-loading" style={{ height: '60vh' }}>
      <div className="spinner"></div>
      <p>Loading admin panel...</p>
    </div>
  );

  return (
    <div className="container">
      <div className="page-header" style={{ margin: '2rem 0 1.5rem' }}>
        <h1 className="page-title">Admin Control Panel</h1>
        <p className="page-subtitle">Monitor platform activity and manage reported issues</p>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {['overview', 'issues', 'users'].map((tab) => (
          <button
            key={tab}
            className={`admin-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'overview' && '📊'} {tab === 'issues' && '🗂️'} {tab === 'users' && '👥'}
            {' '}{tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="overview-tab">
          <div className="stats-grid">
            <div className="stat-card glass-panel">
              <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--primary)' }}>👥</div>
              <div>
                <div className="stat-number">{stats.totalUsers}</div>
                <div className="stat-label">Total Users</div>
              </div>
            </div>
            <div className="stat-card glass-panel">
              <div className="stat-icon" style={{ background: 'rgba(20,184,166,0.15)', color: 'var(--accent)' }}>📋</div>
              <div>
                <div className="stat-number">{stats.totalIssues}</div>
                <div className="stat-label">Total Issues</div>
              </div>
            </div>
            <div className="stat-card glass-panel">
              <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>⏳</div>
              <div>
                <div className="stat-number">{stats.pendingIssues}</div>
                <div className="stat-label">Pending Issues</div>
              </div>
            </div>
            <div className="stat-card glass-panel">
              <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--success)' }}>✅</div>
              <div>
                <div className="stat-number">{stats.resolvedIssues}</div>
                <div className="stat-label">Resolved Issues</div>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="category-breakdown glass-panel">
            <h3 className="breakdown-title">Issues by Category</h3>
            {Object.entries(stats.categoryWiseCount).map(([cat, count]) => {
              const pct = stats.totalIssues > 0 ? Math.round((count / stats.totalIssues) * 100) : 0;
              return (
                <div key={cat} className="category-bar-item">
                  <div className="category-bar-header">
                    <span className="category-bar-label">{cat}</span>
                    <span className="category-bar-count">{count}</span>
                  </div>
                  <div className="category-bar-track">
                    <div className="category-bar-fill" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Issues Tab */}
      {activeTab === 'issues' && (
        <div className="admin-table-section glass-panel">
          <h3 className="admin-table-title">All Reported Issues ({issues.length})</h3>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>City</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue) => (
                  <tr key={issue._id}>
                    <td className="issue-title-cell">
                      <a href={`/issues/${issue._id}`} style={{ color: 'var(--primary)' }}>{issue.title}</a>
                    </td>
                    <td>{issue.category}</td>
                    <td>{issue.location?.city}</td>
                    <td><span className={`badge badge-priority ${issue.priority.toLowerCase()}`}>{issue.priority}</span></td>
                    <td>
                      <select
                        className="status-select"
                        value={issue.status}
                        onChange={(e) => handleStatusUpdate(issue._id, e.target.value)}
                        disabled={statusUpdating === issue._id}
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>{formatDate(issue.createdAt)}</td>
                    <td>
                      <button 
                        className="btn btn-success btn-xs" 
                        onClick={() => handleStatusUpdate(issue._id, 'Resolved')}
                        disabled={statusUpdating === issue._id || issue.status === 'Resolved'}
                        style={{ marginRight: '0.5rem' }}
                      >
                        {statusUpdating === issue._id ? '...' : 'Resolved'}
                      </button>
                      <button className="btn btn-danger btn-xs" onClick={() => handleDeleteIssue(issue._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="admin-table-section glass-panel">
          <h3 className="admin-table-title">Registered Users ({users.length})</h3>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>City</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.phone}</td>
                    <td>{u.city}</td>
                    <td>
                      <select
                        className="status-select"
                        value={u.role}
                        onChange={(e) => handleRoleUpdate(u._id, e.target.value)}
                        disabled={u._id === currentUser?._id}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>{formatDate(u.createdAt)}</td>
                    <td>
                      <button className="btn btn-danger btn-xs" onClick={() => handleDeleteUser(u._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
