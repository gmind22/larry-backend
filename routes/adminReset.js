import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const navigate = useNavigate();

  const logAction = (message) => {
    const logs = JSON.parse(localStorage.getItem('adminLogs')) || [];
    const newLog = {
      message,
      timestamp: new Date().toISOString(),
    };
    logs.push(newLog);
    localStorage.setItem('adminLogs', JSON.stringify(logs));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/admin/login', { username, password });
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('currentAdmin', JSON.stringify(res.data.admin));
      logAction(`${res.data.admin.username} logged in`);
      navigate('/admin/dashboard');
    } catch (err) {
      alert(err.response?.data?.error || 'Login failed');
    }
  };

  const handleResetPassword = async () => {
    try {
      const res = await axios.post('/admin/request-reset-token', { email: resetEmail });
      alert(res.data.message || 'Check your email for the reset link.');
      setShowModal(false);
      setResetEmail('');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send reset token.');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '400px' }}>
      <h3 className="mb-4">Admin Login</h3>
      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <label className="form-label">Username</label>
          <input
            type="text"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-dark w-100">Login</button>
      </form>

      <div className="text-center mt-3">
        <button onClick={() => setShowModal(true)} className="btn btn-link text-decoration-none">
          Forgot Password?
        </button>
      </div>

      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reset Admin Password</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter admin email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleResetPassword}>
                  Send Reset Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
