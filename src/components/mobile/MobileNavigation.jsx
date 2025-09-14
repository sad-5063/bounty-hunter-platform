import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './MobileNavigation.css';

const MobileNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [showMenu, setShowMenu] = useState(false);

  // 根据当前路径设置活动标签
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setActiveTab('home');
    else if (path === '/tasks') setActiveTab('tasks');
    else if (path === '/dashboard') setActiveTab('profile');
    else if (path === '/messages') setActiveTab('messages');
    else if (path === '/wallet') setActiveTab('wallet');
    else setActiveTab('home');
  }, [location.pathname]);

  const navigationItems = [
    {
      id: 'home',
      label: '首页',
      icon: '🏠',
      path: '/',
      public: true
    },
    {
      id: 'tasks',
      label: '任务',
      icon: '📋',
      path: '/tasks',
      public: true
    },
    {
      id: 'messages',
      label: '消息',
      icon: '💬',
      path: '/messages',
      public: false,
      badge: true // 显示未读消息数
    },
    {
      id: 'wallet',
      label: '钱包',
      icon: '💰',
      path: '/wallet',
      public: false
    },
    {
      id: 'profile',
      label: '我的',
      icon: '👤',
      path: '/dashboard',
      public: false
    }
  ];

  const handleTabClick = (item) => {
    if (!item.public && !user) {
      navigate('/login');
      return;
    }
    
    setActiveTab(item.id);
    navigate(item.path);
    setShowMenu(false);
  };

  const handleMenuToggle = () => {
    setShowMenu(!showMenu);
  };

  const handleLogout = () => {
    // 处理登出逻辑
    localStorage.removeItem('token');
    navigate('/');
    setShowMenu(false);
  };

  return (
    <>
      {/* 移动端底部导航 */}
      <div className="mobile-navigation">
        <div className="nav-items">
          {navigationItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => handleTabClick(item)}
            >
              <div className="nav-icon">
                {item.icon}
                {item.badge && user && (
                  <span className="nav-badge">3</span>
                )}
              </div>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 移动端菜单 */}
      <div className={`mobile-menu-overlay ${showMenu ? 'show' : ''}`}>
        <div className="mobile-menu">
          <div className="menu-header">
            <div className="user-info">
              <div className="user-avatar">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="user-details">
                <div className="user-name">{user?.name || '未登录'}</div>
                <div className="user-status">
                  {user ? '已登录' : '点击登录'}
                </div>
              </div>
            </div>
            <button 
              className="menu-close"
              onClick={handleMenuToggle}
            >
              ✕
            </button>
          </div>

          <div className="menu-content">
            {user ? (
              <>
                <div className="menu-section">
                  <h3>账户管理</h3>
                  <button className="menu-item">
                    <span className="menu-icon">👤</span>
                    <span className="menu-text">个人资料</span>
                  </button>
                  <button className="menu-item">
                    <span className="menu-icon">⚙️</span>
                    <span className="menu-text">账户设置</span>
                  </button>
                  <button className="menu-item">
                    <span className="menu-icon">🔒</span>
                    <span className="menu-text">安全设置</span>
                  </button>
                </div>

                <div className="menu-section">
                  <h3>任务管理</h3>
                  <button className="menu-item">
                    <span className="menu-icon">📝</span>
                    <span className="menu-text">发布任务</span>
                  </button>
                  <button className="menu-item">
                    <span className="menu-icon">📋</span>
                    <span className="menu-text">我的任务</span>
                  </button>
                  <button className="menu-item">
                    <span className="menu-icon">⭐</span>
                    <span className="menu-text">我的评价</span>
                  </button>
                </div>

                <div className="menu-section">
                  <h3>帮助与支持</h3>
                  <button className="menu-item">
                    <span className="menu-icon">❓</span>
                    <span className="menu-text">帮助中心</span>
                  </button>
                  <button className="menu-item">
                    <span className="menu-icon">📞</span>
                    <span className="menu-text">联系客服</span>
                  </button>
                  <button className="menu-item">
                    <span className="menu-icon">📄</span>
                    <span className="menu-text">用户协议</span>
                  </button>
                </div>

                <div className="menu-section">
                  <button className="menu-item logout" onClick={handleLogout}>
                    <span className="menu-icon">🚪</span>
                    <span className="menu-text">退出登录</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="menu-section">
                <button 
                  className="menu-item login"
                  onClick={() => {
                    navigate('/login');
                    setShowMenu(false);
                  }}
                >
                  <span className="menu-icon">🔑</span>
                  <span className="menu-text">登录账户</span>
                </button>
                <button 
                  className="menu-item register"
                  onClick={() => {
                    navigate('/register');
                    setShowMenu(false);
                  }}
                >
                  <span className="menu-icon">📝</span>
                  <span className="menu-text">注册账户</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 移动端顶部导航 */}
      <div className="mobile-header">
        <div className="header-left">
          <button 
            className="menu-toggle"
            onClick={handleMenuToggle}
          >
            ☰
          </button>
          <h1 className="header-title">赏金猎人</h1>
        </div>
        <div className="header-right">
          <button className="header-btn" title="搜索">
            🔍
          </button>
          <button className="header-btn" title="通知">
            🔔
            <span className="notification-dot"></span>
          </button>
        </div>
      </div>
    </>
  );
};

export default MobileNavigation;

