import React from 'react';
import { Link } from 'react-router-dom';
import './IssueCard.css';

const IssueCard = ({ issue }) => {
  const {
    _id,
    title,
    description,
    category,
    image,
    location,
    priority,
    status,
    reportedBy,
    createdAt
  } = issue;

  // Format date
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Build backend image URL
  const imageUrl = `http://localhost:5050/${image}`;

  return (
    <div className="issue-card glass-panel">
      <div className="issue-card-image-wrapper">
        <img src={imageUrl} alt={title} className="issue-card-image" onerror="this.src='https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=400&q=80'" />
        <div className="issue-card-badges">
          <span className={`badge badge-priority ${priority.toLowerCase()}`}>
            {priority}
          </span>
          <span className={`badge badge-status ${status.toLowerCase().replace(' ', '')}`}>
            {status}
          </span>
        </div>
      </div>

      <div className="issue-card-content">
        <div className="issue-card-category-row">
          <span className="issue-card-category">{category}</span>
          <span className="issue-card-city">📍 {location?.city}</span>
        </div>

        <h3 className="issue-card-title">{title}</h3>
        <p className="issue-card-desc">
          {description.length > 90 ? `${description.substring(0, 90)}...` : description}
        </p>

        <div className="issue-card-footer">
          <div className="issue-card-reporter">
            <span className="reporter-label">Reported by:</span>
            <span className="reporter-name">{reportedBy?.name || 'Anonymous User'}</span>
          </div>
          <span className="issue-card-date">{formatDate(createdAt)}</span>
        </div>

        <Link to={`/issues/${_id}`} className="btn btn-primary btn-view-details">
          View Progress & Chat
        </Link>
      </div>
    </div>
  );
};

export default IssueCard;
