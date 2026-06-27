import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
  const { register, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    city: '',
    role: 'user'
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const { name, email, password, phone, city } = formData;
    if (!name || !email || !password || !phone || !city) {
      setErrorMsg('Please enter all required fields');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    const result = await register(formData);
    setIsLoading(false);

    if (result && !result.success) {
      setErrorMsg(result.message);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card glass-panel wide">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join the portal to report and track community concerns</p>
        </div>

        {errorMsg && <div className="auth-alert danger">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="auth-form-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-control"
              placeholder="e.g. Jane Doe"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              placeholder="e.g. jane@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              placeholder="Min. 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="phone">Phone Number *</label>
            <input
              type="text"
              id="phone"
              name="phone"
              className="form-control"
              placeholder="e.g. 9876543210"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

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


          <div className="form-group full-width">
            <label className="form-label" htmlFor="address">Full Address</label>
            <textarea
              id="address"
              name="address"
              className="form-control"
              placeholder="e.g. Apt 4B, Sector 3, Kavuri Hills"
              rows="2"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-auth-submit full-width"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login" className="auth-link-alt">Sign In Here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
