import React, { useState, useEffect } from 'react';
import AdminDashboard from '../components/admin/AdminDashboard';
import UserManagement from '../components/admin/UserManagement';
import { useAuth } from '../contexts/AuthContext';
import './AdminPage.css';

const AdminPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 检查管理员权限
  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        setLoading(true);
        
        // 模拟检查管理员权限
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 这里应该调用真实的API检查用户是否有管理员权限
        if (user && user.role === 'admin') {
          setAdminUser({
            admin_id: 'admin_001',
            admin_name: user.name,
            admin_level: 'admin',
            permissions: ['user_management', 'task_management', 'payment_management', 'data_analytics']
          });
        } else {
          setError('您没有管理员权限');
        }
      } catch (error) {
        setError('检查管理员权限失败: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      checkAdminAccess();
    } else {
      setError('请先登录');
      setLoading(false);
    }
  }, [user]);

  const tabs = [
    { id: 'dashboard', label: '仪表板', icon: '📊' },
    { id: 'users', label: '用户管理', icon: '👥' },
    { id: 'tasks', label: '任务管理', icon: '📋' },
    { id: 'payments', label: '资金管理', icon: '💰' },
    { id: 'reports', label: '举报处理', icon: '🚨' },
    { id: 'settings', label: '系统设置', icon: '⚙️' },
    { id: 'logs', label: '操作日志', icon: '📝' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard adminUser={adminUser} />;
      case 'users':
        return <UserManagement />;
      case 'tasks':
        return <div className="coming-soon">任务管理功能即将推出</div>;
      case 'payments':
        return <div className="coming-soon">资金管理功能即将推出</div>;
      case 'reports':
        return <div className="coming-soon">举报处理功能即将推出</div>;
      case 'settings':
        return <div className="coming-soon">系统设置功能即将推出</div>;
      case 'logs':
        return <div className="coming-soon">操作日志功能即将推出</div>;
      default:
        return <AdminDashboard adminUser={adminUser} />;
    }
  };

  if (loading) {
    return (
      <div className="admin-page-loading">
        <div className="loading-spinner"></div>
        <p>检查管理员权限中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page-error">
        <div className="error-icon">🚫</div>
        <h2>访问被拒绝</h2>
        <p>{error}</p>
        <button 
          className="btn btn-primary"
          onClick={() => window.location.href = '/dashboard'}
        >
          返回个人中心
        </button>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* 侧边栏 */}
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <div className="admin-logo">
            <span className="logo-icon">🛡️</span>
            <span className="logo-text">管理后台</span>
          </div>
        </div>
        
        <div className="admin-info">
          <div className="admin-avatar">
            {adminUser?.admin_name?.charAt(0) || 'A'}
          </div>
          <div className="admin-details">
            <div className="admin-name">{adminUser?.admin_name || '管理员'}</div>
            <div className="admin-level">{adminUser?.admin_level || 'admin'}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span className="nav-label">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn">
            <span className="logout-icon">🚪</span>
            <span className="logout-text">退出管理</span>
          </button>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="admin-main">
        <div className="main-header">
          <div className="header-left">
            <h1>{tabs.find(tab => tab.id === activeTab)?.label || '仪表板'}</h1>
            <p>管理员后台 - {new Date().toLocaleDateString('zh-CN')}</p>
          </div>
          <div className="header-right">
            <div className="header-actions">
              <button className="action-btn" title="刷新">
                🔄
              </button>
              <button className="action-btn" title="通知">
                🔔
                <span className="notification-badge">3</span>
              </button>
              <button className="action-btn" title="帮助">
                ❓
              </button>
            </div>
          </div>
        </div>

        <div className="main-content">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
