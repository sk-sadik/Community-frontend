import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './IssueForm.css';

const CATEGORIES = ['Road', 'Municipal', 'Electrical', 'Garbage', 'Drainage', 'Water Supply', 'Street Light', 'Public Property', 'Others'];

const CreateIssue = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef();
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'Medium',
    address: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    latitude: '',
    longitude: '',
    image: null
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.image) {
      setError('Please select an image for the issue');
      return;
    }

    if (!formData.category) {
      setError('Please select a category');
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('priority', formData.priority);
    data.append('address', formData.address);
    data.append('city', formData.city);
    data.append('district', formData.district);
    data.append('state', formData.state);
    data.append('pincode', formData.pincode);
    if (formData.latitude) data.append('latitude', formData.latitude);
    if (formData.longitude) data.append('longitude', formData.longitude);
    data.append('image', formData.image);

    setLoading(true);
    try {
      const res = await axios.post('/api/issues', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        navigate(`/issues/${res.data.data._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit issue. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header" style={{ margin: '2rem 0 1.5rem' }}>
        <h1 className="page-title">Report an Issue</h1>
        <p className="page-subtitle">Provide accurate details to help authorities resolve your issue faster</p>
      </div>

      <div className="issue-form-card glass-panel">
        {error && <div className="auth-alert danger" style={{ marginBottom: '1.5rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="issue-form-layout">
          {/* Left Column */}
          <div className="issue-form-col">
            <h3 className="form-section-title">Issue Information</h3>

            <div className="form-group">
              <label className="form-label" htmlFor="title">Issue Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                className="form-control"
                placeholder="e.g. Large pothole on main road"
                value={formData.title}
                onChange={handleChange}
                required
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                className="form-control"
                placeholder="Describe the issue in detail..."
                rows="4"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  className="form-control"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  name="priority"
                  className="form-control"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            {/* Image Upload */}
            <div className="form-group">
              <label className="form-label">Issue Image *</label>
              <div
                className={`image-dropzone ${imagePreview ? 'has-image' : ''}`}
                onClick={() => fileInputRef.current.click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="image-preview" />
                ) : (
                  <div className="dropzone-placeholder">
                    <span className="dropzone-icon">📷</span>
                    <p>Click to upload an image</p>
                    <span className="dropzone-hint">JPG, PNG, WEBP up to 5MB</span>
                  </div>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
              {imagePreview && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ marginTop: '0.5rem', fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                  onClick={() => { setImagePreview(null); setFormData({ ...formData, image: null }); fileInputRef.current.value = ''; }}
                >
                  Remove Image
                </button>
              )}
            </div>
          </div>

          {/* Right Column - Location */}
          <div className="issue-form-col">
            <h3 className="form-section-title">📍 Location Details</h3>

            <div className="form-group">
              <label className="form-label" htmlFor="address">Street Address *</label>
              <textarea
                id="address"
                name="address"
                className="form-control"
                placeholder="e.g. Near Nexus Mall, Kavuri Hills"
                rows="2"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="city">City *</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  className="form-control"
                  placeholder="e.g. Hyderabad"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="district">District</label>
                <input
                  type="text"
                  id="district"
                  name="district"
                  className="form-control"
                  placeholder="e.g. Rangareddy"
                  value={formData.district}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="state">State</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  className="form-control"
                  placeholder="e.g. Telangana"
                  value={formData.state}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="pincode">Pincode</label>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  className="form-control"
                  placeholder="e.g. 500033"
                  value={formData.pincode}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ flex: 1 }}
              >
                {loading ? 'Submitting...' : '🚀 Submit Issue Report'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateIssue;
