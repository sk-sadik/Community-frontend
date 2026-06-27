import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import IssueCard from '../components/IssueCard';
import './Dashboard.css';

const CATEGORIES = ['Road', 'Municipal', 'Electrical', 'Garbage', 'Drainage', 'Water Supply', 'Street Light', 'Public Property', 'Others'];
const STATUSES = ['Pending', 'Verified', 'Assigned', 'In Progress', 'Resolved', 'Rejected'];
const PRIORITIES = ['Low', 'Medium', 'High'];

const Dashboard = () => {
  const [issues, setIssues] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: 9 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [city, setCity] = useState('');

  const fetchIssues = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 9 };
      if (search) params.search = search;
      if (category) params.category = category;
      if (status) params.status = status;
      if (priority) params.priority = priority;
      if (city) params.city = city;

      const res = await axios.get('/api/issues', { params });
      if (res.data.success) {
        setIssues(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      setError('Failed to load issues. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues(1);
  }, [category, status, priority, city]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchIssues(1);
  };

  const handleReset = () => {
    setSearch('');
    setCategory('');
    setStatus('');
    setPriority('');
    setCity('');
  };

  return (
    <div className="container">
      <div className="dashboard-header">
        <div className="page-header">
          <h1 className="page-title">Community Issues</h1>
          <p className="page-subtitle">
            Explore, support, and track public issues reported by citizens
          </p>
        </div>
        
      </div>

      {/* Search & Filter Bar */}
      <div className="filter-bar glass-panel">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search issues by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>

        <div className="filter-row">
          <select className="form-control filter-select" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <select className="form-control filter-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <select className="form-control filter-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="">All Priorities</option>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>

          <input
            type="text"
            className="form-control filter-select"
            placeholder="Filter by City..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />

          <button onClick={handleReset} className="btn btn-secondary">Reset</button>
        </div>
      </div>

      {/* Issue Count */}
      <div className="dashboard-count">
        {!loading && (
          <span>{pagination.total} issue{pagination.total !== 1 ? 's' : ''} found</span>
        )}
      </div>

      {/* Error message */}
      {error && <div className="auth-alert danger" style={{ marginBottom: '1rem' }}>{error}</div>}

      {/* Issue Grid */}
      {loading ? (
        <div className="dashboard-loading">
          <div className="spinner"></div>
          <p>Loading issues...</p>
        </div>
      ) : issues.length === 0 ? (
        <div className="dashboard-empty glass-panel">
          <div className="empty-icon">???</div>
          <h3>No Issues Found</h3>
          <p>Try adjusting your filters or be the first to report an issue in your area.</p>
          <Link to="/report" className="btn btn-primary" style={{ marginTop: '1rem' }}>Report an Issue</Link>
        </div>
      ) : (
        <div className="issue-grid">
          {issues.map((issue) => (
            <IssueCard key={issue._id} issue={issue} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination-bar">
          <button
            className="btn btn-secondary"
            disabled={pagination.page === 1}
            onClick={() => fetchIssues(pagination.page - 1)}
          >
            ? Previous
          </button>
          <span className="page-info">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            className="btn btn-secondary"
            disabled={pagination.page === pagination.pages}
            onClick={() => fetchIssues(pagination.page + 1)}
          >
            Next ?
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
