import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/userAPI';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar_url: user.avatar_url || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await updateProfile(profileData);
      setMessage('个人资料更新成功！');
    } catch (error) {
      setMessage('更新失败：' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      // 这里应该调用文件上传API
      const avatarUrl = await userAPI.uploadAvatar(file);
      setProfileData({
        ...profileData,
        avatar_url: avatarUrl
      });
      setMessage('头像上传成功！');
    } catch (error) {
      setMessage('头像上传失败：' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>请先登录</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>个人中心</h1>
        <p>管理您的账户信息和任务历史</p>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-sidebar">
          <div className="user-info">
            <div className="avatar">
              <img 
                src={profileData.avatar_url || '/default-avatar.png'} 
                alt="用户头像"
                onError={(e) => {
                  e.target.src = '/default-avatar.png';
                }}
              />
            </div>
            <h3>{user.name}</h3>
            <p className="user-email">{user.email}</p>
            <div className="user-stats">
              <div className="stat-item">
                <span className="stat-label">信誉值</span>
                <span className="stat-value">{user.reputation_score || 5.0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">钱包余额</span>
                <span className="stat-value">¥{user.wallet_balance || 0}</span>
              </div>
            </div>
          </div>

          <nav className="dashboard-nav">
            <button 
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              📝 个人资料
            </button>
            <button 
              className={`nav-item ${activeTab === 'tasks' ? 'active' : ''}`}
              onClick={() => setActiveTab('tasks')}
            >
              📋 我的任务
            </button>
            <button 
              className={`nav-item ${activeTab === 'wallet' ? 'active' : ''}`}
              onClick={() => setActiveTab('wallet')}
            >
              💰 钱包管理
            </button>
            <button 
              className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              🔒 安全设置
            </button>
          </nav>
        </div>

        <div className="dashboard-main">
          {activeTab === 'profile' && (
            <div className="tab-content">
              <h2>个人资料</h2>
              <form onSubmit={handleSaveProfile} className="profile-form">
                <div className="form-group">
                  <label>头像</label>
                  <div className="avatar-upload">
                    <img 
                      src={profileData.avatar_url || '/default-avatar.png'} 
                      alt="当前头像"
                      className="current-avatar"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="avatar-input"
                    />
                    <button type="button" className="upload-btn">
                      更换头像
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="name">姓名</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={profileData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">邮箱</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    required
                    disabled
                  />
                  <small>邮箱地址不可修改</small>
                </div>

                <div className="form-group">
                  <label htmlFor="phone">手机号码</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    placeholder="请输入手机号码"
                  />
                </div>

                {message && (
                  <div className={`message ${message.includes('成功') ? 'success' : 'error'}`}>
                    {message}
                  </div>
                )}

                <button 
                  type="submit" 
                  className="save-btn"
                  disabled={loading}
                >
                  {loading ? '保存中...' : '保存更改'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="tab-content">
              <h2>我的任务</h2>
              <div className="tasks-overview">
                <div className="task-stats">
                  <div className="stat-card">
                    <h3>发布的任务</h3>
                    <span className="stat-number">0</span>
                  </div>
                  <div className="stat-card">
                    <h3>接受的任务</h3>
                    <span className="stat-number">0</span>
                  </div>
                  <div className="stat-card">
                    <h3>已完成</h3>
                    <span className="stat-number">0</span>
                  </div>
                </div>
                <p className="coming-soon">任务历史功能即将推出...</p>
              </div>
            </div>
          )}

          {activeTab === 'wallet' && (
            <div className="tab-content">
              <h2>钱包管理</h2>
              <div className="wallet-overview">
                <div className="balance-card">
                  <h3>当前余额</h3>
                  <div className="balance-amount">¥{user.wallet_balance || 0}</div>
                </div>
                <div className="wallet-actions">
                  <button className="action-btn primary">充值</button>
                  <button className="action-btn secondary">提现</button>
                </div>
                <p className="coming-soon">钱包功能即将推出...</p>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="tab-content">
              <h2>安全设置</h2>
              <div className="security-settings">
                <div className="setting-item">
                  <h3>修改密码</h3>
                  <p>定期修改密码以保护账户安全</p>
                  <button className="action-btn primary">修改密码</button>
                </div>
                <div className="setting-item">
                  <h3>两步验证</h3>
                  <p>为账户添加额外的安全保护</p>
                  <button className="action-btn secondary">设置两步验证</button>
                </div>
                <p className="coming-soon">安全功能即将推出...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
