import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './AuthForm.css';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || '登录失败，请检查邮箱和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <div className="auth-header">
          <h2>登录赏金猎人平台</h2>
          <p>欢迎回来！请登录您的账户</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">邮箱地址</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="请输入您的邮箱"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">密码</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="请输入您的密码"
            />
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            还没有账户？ 
            <Link to="/register" className="auth-link">
              立即注册
            </Link>
          </p>
          <p>
            <Link to="/forgot-password" className="auth-link">
              忘记密码？
            </Link>
          </p>
        </div>

        {/* 第三方登录 (后期扩展) */}
        <div className="social-login">
          <div className="divider">
            <span>或使用以下方式登录</span>
          </div>
          <div className="social-buttons">
            <button className="social-button google-button" disabled>
              <span>🔍</span> Google (即将推出)
            </button>
            <button className="social-button facebook-button" disabled>
              <span>📘</span> Facebook (即将推出)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
