import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './AuthForm.css';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    agreeTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return false;
    }
    if (formData.password.length < 6) {
      setError('密码长度至少6位');
      return false;
    }
    if (!formData.agreeTerms) {
      setError('请同意用户协议和隐私政策');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <div className="auth-header">
          <h2>加入赏金猎人平台</h2>
          <p>创建您的账户，开始您的赏金猎人之路</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">姓名</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="请输入您的姓名"
            />
          </div>

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
            <label htmlFor="phone">手机号码 (可选)</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="请输入您的手机号码"
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
              placeholder="至少6位字符"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">确认密码</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="请再次输入密码"
            />
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                required
              />
              <span className="checkmark"></span>
              我同意 <Link to="/terms" className="auth-link">用户协议</Link> 和 <Link to="/privacy" className="auth-link">隐私政策</Link>
            </label>
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? '注册中...' : '创建账户'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            已有账户？ 
            <Link to="/login" className="auth-link">
              立即登录
            </Link>
          </p>
        </div>

        {/* 第三方注册 (后期扩展) */}
        <div className="social-login">
          <div className="divider">
            <span>或使用以下方式注册</span>
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

export default RegisterForm;
