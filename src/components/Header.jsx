import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <Link to="/" className="logo">
            <span className="logo-icon">🎯</span>
            <span className="logo-text">赏金猎人</span>
          </Link>
        </div>

        <nav className="header-nav">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            首页
          </Link>
          <Link 
            to="/tasks" 
            className={`nav-link ${location.pathname === '/tasks' ? 'active' : ''}`}
          >
            任务大厅
          </Link>
          <Link 
            to="/help" 
            className={`nav-link ${location.pathname === '/help' ? 'active' : ''}`}
          >
            帮助
          </Link>
          <Link 
            to="/about" 
            className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}
          >
            关于我们
          </Link>
        </nav>

        <div className="header-right">
          {isAuthenticated ? (
            <div className="user-menu">
              <div className="user-info">
                <span className="user-avatar">
                  {user?.name?.charAt(0) || 'U'}
                </span>
                <span className="user-name">{user?.name}</span>
              </div>
              <div className="user-dropdown">
                <Link to="/dashboard" className="dropdown-item">
                  📊 个人中心
                </Link>
                <Link to="/my-tasks" className="dropdown-item">
                  📋 我的任务
                </Link>
                <Link to="/wallet" className="dropdown-item">
                  💰 钱包
                </Link>
                <div className="dropdown-divider"></div>
                <button onClick={handleLogout} className="dropdown-item logout">
                  🚪 退出登录
                </button>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-secondary btn-sm">
                登录
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                注册
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
