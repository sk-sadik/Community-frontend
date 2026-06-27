import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './IssueForm.css';

const CATEGORIES = ['Road', 'Municipal', 'Electrical', 'Garbage', 'Drainage', 'Water Supply', 'Street Light', 'Public Property', 'Others'];

const EditIssue = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const fileInputRef = useRef();
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
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

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const res = await axios.get(`/api/issues/${id}`);
        if (res.data.success) {
          const issue = res.data.data;
          // Check ownership
          if (issue.reportedBy._id !== user?._id && user?.role !== 'admin') {
            navigate('/');
            return;
          }
          setFormData({
            title: issue.title || '',
            description: issue.description || '',
            category: issue.category || '',
            priority: issue.priority || 'Medium',
            address: issue.location?.address || '',
            city: issue.location?.city || '',
            district: issue.location?.district || '',
            state: issue.location?.state || '',
            pincode: issue.location?.pincode || '',
            latitude: issue.location?.latitude || '',
            longitude: issue.location?.longitude || '',
            image: null
          });
          setImagePreview(`http://localhost:5050/${issue.image}`);
        }
      } catch (err) {
        setError('Failed to load issue details.');
      } finally {
        setFetchLoading(false);
      }
    };
    fetchIssue();
  }, [id]);

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

    const data = new FormData();
    if (formData.title) data.append('title', formData.title);
    if (formData.description) data.append('description', formData.description);
    if (formData.category) data.append('category', formData.category);
    if (formData.priority) data.append('priority', formData.priority);
    if (formData.address) data.append('address', formData.address);
    if (formData.city) data.append('city', formData.city);
    if (formData.district) data.append('district', formData.district);
    if (formData.state) data.append('state', formData.state);
    if (formData.pincode) data.append('pincode', formData.pincode);
    if (formData.latitude) data.append('latitude', formData.latitude);
    if (formData.longitude) data.append('longitude', formData.longitude);
    if (formData.image) data.append('image', formData.image);

    setLoading(true);
    try {
      const res = await axios.put(`/api/issues/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        navigate(`/issues/${id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update issue.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="dashboard-loading" style={{ height: '60vh' }}>
        <div className="spinner"></div>
        <p>Loading issue...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header" style={{ margin: '2rem 0 1.5rem' }}>
        <h1 className="page-title">Edit Issue</h1>
        <p className="page-subtitle">Update the details of this reported issue</p>
      </div>

      <div className="issue-form-card glass-panel">
        {error && <div className="auth-alert danger" style={{ marginBottom: '1.5rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="issue-form-layout">
          {/* Left Column */}
          <div className="issue-form-col">
            <h3 className="form-section-title">Issue Information</h3>

            <div className="form-group">
              <label className="form-label">Issue Title</label>
              <input type="text" name="title" className="form-control" value={formData.title} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea name="description" className="form-control" rows="4" value={formData.description} onChange={handleChange} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select name="category" className="form-control" value={formData.category} onChange={handleChange}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <select name="priority" className="form-control" value={formData.priority} onChange={handleChange}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            {/* Image Upload */}
            <div className="form-group">
              <label className="form-label">Update Image (Optional)</label>
              <div className={`image-dropzone ${imagePreview ? 'has-image' : ''}`} onClick={() => fileInputRef.current.click()}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="image-preview" />
                ) : (
                  <div className="dropzone-placeholder">
                    <span className="dropzone-icon">📷</span>
                    <p>Click to change image</p>
                  </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
            </div>
          </div>

          {/* Right Column - Location */}
          <div className="issue-form-col">
            <h3 className="form-section-title">📍 Location Details</h3>

            <div className="form-group">
              <label className="form-label">Street Address</label>
              <textarea name="address" className="form-control" rows="2" value={formData.address} onChange={handleChange} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">City</label>
                <input type="text" name="city" className="form-control" value={formData.city} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">District</label>
                <input type="text" name="district" className="form-control" value={formData.district} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">State</label>
                <input type="text" name="state" className="form-control" value={formData.state} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Pincode</label>
                <input type="text" name="pincode" className="form-control" value={formData.pincode} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Latitude</label>
                <input type="number" step="any" name="latitude" className="form-control" value={formData.latitude} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Longitude</label>
                <input type="number" step="any" name="longitude" className="form-control" value={formData.longitude} onChange={handleChange} />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => navigate(`/issues/${id}`)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
                {loading ? 'Saving...' : '💾 Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditIssue;
