import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <h1>个人中心</h1>
        
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>个人信息</h3>
            <div className="user-info">
              <p><strong>姓名:</strong> {user?.name}</p>
              <p><strong>邮箱:</strong> {user?.email}</p>
              <p><strong>角色:</strong> {user?.role}</p>
              <p><strong>信誉值:</strong> {user?.reputation}</p>
            </div>
          </div>
          
          <div className="dashboard-card">
            <h3>钱包余额</h3>
            <div className="wallet-info">
              <p className="balance">¥{user?.wallet_balance || 0}</p>
              <button className="btn btn-primary">充值</button>
            </div>
          </div>
          
          <div className="dashboard-card">
            <h3>我的任务</h3>
            <div className="task-stats">
              <p>发布任务: 0</p>
              <p>接受任务: 0</p>
              <p>完成任务: 0</p>
            </div>
          </div>
          
          <div className="dashboard-card">
            <h3>快速操作</h3>
            <div className="quick-actions">
              <button className="btn btn-secondary">发布任务</button>
              <button className="btn btn-secondary">浏览任务</button>
              <button className="btn btn-secondary">查看消息</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;