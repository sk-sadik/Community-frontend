import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './IssueDetails.css';

const IssueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchIssueData();
  }, [id]);

  const fetchIssueData = async () => {
  setLoading(true);

  try {
    const [issueRes, commentsRes] = await Promise.all([
      axios.get(`/api/issues/${id}`),
      axios.get(`/api/comments/${id}`)
    ]);

    if (issueRes.data.success) {
      console.log("========== ISSUE DATA ==========");
      console.log(issueRes.data.data);
      console.log("IMAGE URL:", issueRes.data.data.image);

      setIssue(issueRes.data.data);
    }

    if (commentsRes.data.success) {
      setComments(commentsRes.data.data);
    }
  } catch (err) {
    console.error(err);
    setError("Failed to load issue details.");
  } finally {
    setLoading(false);
  }
};

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommentLoading(true);
    try {
      const res = await axios.post('/api/comments', { issue: id, comment: newComment });
      if (res.data.success) {
        setComments([...comments, res.data.data]);
        setNewComment('');
      }
    } catch (err) {
      console.error('Failed to add comment:', err.response?.data?.message);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`/api/comments/${commentId}`);
      setComments(comments.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error('Failed to delete comment:', err.response?.data?.message);
    }
  };

  const handleDeleteIssue = async () => {
    if (!window.confirm('Are you sure you want to delete this issue? This action cannot be undone.')) return;
    try {
      await axios.delete(`/api/issues/${id}`);
      navigate('/');
    } catch (err) {
      alert('Failed to delete issue.');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short', month: 'long', day: 'numeric', year: 'numeric'
    });
  };

  const getStatusClass = (status) => status?.toLowerCase().replace(' ', '');

  if (loading) return (
    <div className="dashboard-loading" style={{ height: '70vh' }}>
      <div className="spinner"></div>
      <p>Loading issue details...</p>
    </div>
  );

  if (error || !issue) return (
    <div className="container" style={{ marginTop: '3rem' }}>
      <div className="auth-alert danger">{error || 'Issue not found.'}</div>
      <Link to="/" className="btn btn-secondary" style={{ marginTop: '1rem' }}>← Back to Dashboard</Link>
    </div>
  );

  const isOwner = user?._id === issue.reportedBy?._id;
  const isAdmin = user?.role === 'admin';

  return (
    <div className="container">
      <div className="details-breadcrumb">
        <Link to="/" className="breadcrumb-link">Dashboard</Link>
        <span> / </span>
        <span>{issue.category}</span>
      </div>

      <div className="details-layout">
        {/* Main Content */}
        <div className="details-main">
          {/* Issue Header */}
          <div className="details-hero glass-panel">
            <img
              src={issue.image}
              alt={issue.title}
              className="details-image"
            />
            <div className="details-overlay">
              <div className="details-badges">
                <span className={`badge badge-status ${getStatusClass(issue.status)}`}>{issue.status}</span>
                <span className={`badge badge-priority ${issue.priority.toLowerCase()}`}>{issue.priority} Priority</span>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}>{issue.category}</span>
              </div>
            </div>
          </div>

          <div className="details-content-card glass-panel">
            <div className="details-title-row">
              <h1 className="details-title">{issue.title}</h1>
              {(isOwner || isAdmin) && (
                <div className="details-actions">
                  {isOwner && (
                    <Link to={`/issues/${id}/edit`} className="btn btn-secondary btn-sm">✏️ Edit</Link>
                  )}
                  {(isOwner || isAdmin) && (
                    <button onClick={handleDeleteIssue} className="btn btn-danger btn-sm">🗑️ Delete</button>
                  )}
                </div>
              )}
            </div>

            <p className="details-description">{issue.description}</p>
          </div>

          {/* Comments Section */}
          <div className="comments-section glass-panel">
            <h3 className="comments-title">💬 Community Discussion ({comments.length})</h3>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="comment-form">
              <textarea
                className="form-control"
                placeholder="Share your thoughts or updates on this issue..."
                rows="3"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button type="submit" className="btn btn-primary" disabled={commentLoading || !newComment.trim()}>
                {commentLoading ? 'Posting...' : 'Post Comment'}
              </button>
            </form>

            {/* Comment List */}
            <div className="comment-list">
              {comments.length === 0 ? (
                <p className="no-comments">No comments yet. Be the first to comment!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment._id} className="comment-item">
                    <div className="comment-header">
                      <div className="comment-avatar">
                        {comment.user?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <span className="comment-author">{comment.user?.name || 'Unknown'}</span>
                        <span className="comment-date">{formatDate(comment.createdAt)}</span>
                      </div>
                      {(user?._id === comment.user?._id || isAdmin) && (
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="comment-delete-btn"
                          title="Delete comment"
                        >
                          ×
                        </button>
                      )}
                    </div>
                    <p className="comment-text">{comment.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="details-sidebar">
          <div className="sidebar-card glass-panel">
            <h3 className="sidebar-title">Issue Details</h3>
            <div className="sidebar-info-list">
              <div className="sidebar-info-item">
                <span className="info-label">Status</span>
                <span className={`badge badge-status ${getStatusClass(issue.status)}`}>{issue.status}</span>
              </div>
              <div className="sidebar-info-item">
                <span className="info-label">Priority</span>
                <span className={`badge badge-priority ${issue.priority.toLowerCase()}`}>{issue.priority}</span>
              </div>
              <div className="sidebar-info-item">
                <span className="info-label">Category</span>
                <span className="info-value">{issue.category}</span>
              </div>
              <div className="sidebar-info-item">
                <span className="info-label">Reported On</span>
                <span className="info-value">{formatDate(issue.createdAt)}</span>
              </div>
              <div className="sidebar-info-item">
                <span className="info-label">Reported By</span>
                <span className="info-value">{issue.reportedBy?.name || 'Unknown'}</span>
              </div>
            </div>
          </div>

          <div className="sidebar-card glass-panel">
            <h3 className="sidebar-title">📍 Location</h3>
            <div className="sidebar-info-list">
              {issue.location?.address && (
                <div className="sidebar-info-item">
                  <span className="info-label">Address</span>
                  <span className="info-value">{issue.location.address}</span>
                </div>
              )}
              {issue.location?.city && (
                <div className="sidebar-info-item">
                  <span className="info-label">City</span>
                  <span className="info-value">{issue.location.city}</span>
                </div>
              )}
              {issue.location?.district && (
                <div className="sidebar-info-item">
                  <span className="info-label">District</span>
                  <span className="info-value">{issue.location.district}</span>
                </div>
              )}
              {issue.location?.state && (
                <div className="sidebar-info-item">
                  <span className="info-label">State</span>
                  <span className="info-value">{issue.location.state}</span>
                </div>
              )}
              {issue.location?.pincode && (
                <div className="sidebar-info-item">
                  <span className="info-label">Pincode</span>
                  <span className="info-value">{issue.location.pincode}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetails;
