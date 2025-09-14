import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <h1>赏金猎人平台</h1>
        </Link>
        
        <nav className="nav">
          <Link to="/" className="nav-link">首页</Link>
          <Link to="/tasks" className="nav-link">任务大厅</Link>
          <Link to="/help" className="nav-link">帮助</Link>
          <Link to="/about" className="nav-link">关于我们</Link>
        </nav>

        <div className="user-section">
          {user ? (
            <div className="user-menu">
              <span className="user-name">欢迎, {user.name}</span>
              <Link to="/dashboard" className="btn btn-primary">个人中心</Link>
              <button onClick={handleLogout} className="btn btn-secondary">退出</button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-secondary">登录</Link>
              <Link to="/register" className="btn btn-primary">注册</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;