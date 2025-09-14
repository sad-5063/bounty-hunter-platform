import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const AdminDashboard = ({ adminUser }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTasks: 0,
    totalRevenue: 0,
    pendingReviews: 0,
    activeUsers: 0,
    completedTasks: 0,
    monthlyRevenue: 0,
    userGrowth: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // 模拟数据加载
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // 这里应该调用真实的API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStats({
          totalUsers: 12543,
          totalTasks: 8932,
          totalRevenue: 1256789.50,
          pendingReviews: 23,
          activeUsers: 3456,
          completedTasks: 6789,
          monthlyRevenue: 156789.25,
          userGrowth: 12.5
        });

        setRecentActivities([
          {
            id: 1,
            type: 'user_registration',
            description: '新用户注册',
            user: '张三',
            time: '2分钟前',
            status: 'success'
          },
          {
            id: 2,
            type: 'task_completion',
            description: '任务完成',
            user: '李四',
            task: '网站设计',
            time: '5分钟前',
            status: 'success'
          },
          {
            id: 3,
            type: 'payment_withdrawal',
            description: '提现申请',
            user: '王五',
            amount: 1500,
            time: '10分钟前',
            status: 'pending'
          },
          {
            id: 4,
            type: 'user_report',
            description: '用户举报',
            user: '赵六',
            reason: '不当行为',
            time: '15分钟前',
            status: 'pending'
          }
        ]);
      } catch (error) {
        console.error('加载仪表板数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('zh-CN').format(num);
  };

  const getActivityIcon = (type) => {
    const icons = {
      user_registration: '👤',
      task_completion: '✅',
      payment_withdrawal: '💰',
      user_report: '🚨',
      task_creation: '📝',
      review_posted: '⭐'
    };
    return icons[type] || '📋';
  };

  const getActivityColor = (status) => {
    const colors = {
      success: '#10b981',
      pending: '#f59e0b',
      error: '#ef4444',
      warning: '#f59e0b'
    };
    return colors[status] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="loading-spinner"></div>
        <p>加载仪表板数据中...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* 欢迎区域 */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>欢迎回来，{adminUser?.admin_name || '管理员'}！</h1>
          <p>今天是 {new Date().toLocaleDateString('zh-CN', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
          })}</p>
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
      </div>

      {/* 统计卡片 */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon users">👥</div>
          <div className="stat-content">
            <div className="stat-value">{formatNumber(stats.totalUsers)}</div>
            <div className="stat-label">总用户数</div>
            <div className="stat-change positive">+{stats.userGrowth}%</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon tasks">📋</div>
          <div className="stat-content">
            <div className="stat-value">{formatNumber(stats.totalTasks)}</div>
            <div className="stat-label">总任务数</div>
            <div className="stat-change positive">+8.2%</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue">💰</div>
          <div className="stat-content">
            <div className="stat-value">{formatCurrency(stats.totalRevenue)}</div>
            <div className="stat-label">总收入</div>
            <div className="stat-change positive">+15.3%</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon reviews">⏳</div>
          <div className="stat-content">
            <div className="stat-value">{stats.pendingReviews}</div>
            <div className="stat-label">待审核</div>
            <div className="stat-change warning">需要处理</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon active">🟢</div>
          <div className="stat-content">
            <div className="stat-value">{formatNumber(stats.activeUsers)}</div>
            <div className="stat-label">活跃用户</div>
            <div className="stat-change positive">+5.7%</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon completed">✅</div>
          <div className="stat-content">
            <div className="stat-value">{formatNumber(stats.completedTasks)}</div>
            <div className="stat-label">已完成任务</div>
            <div className="stat-change positive">+12.1%</div>
          </div>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="charts-section">
        <div className="chart-container">
          <div className="chart-header">
            <h3>收入趋势</h3>
            <div className="chart-controls">
              <button className="chart-btn active">7天</button>
              <button className="chart-btn">30天</button>
              <button className="chart-btn">90天</button>
            </div>
          </div>
          <div className="chart-placeholder">
            <div className="chart-mock">
              <div className="chart-bars">
                {[65, 78, 82, 75, 88, 92, 85].map((height, index) => (
                  <div 
                    key={index}
                    className="chart-bar"
                    style={{ height: `${height}%` }}
                  ></div>
                ))}
              </div>
              <div className="chart-labels">
                <span>周一</span>
                <span>周二</span>
                <span>周三</span>
                <span>周四</span>
                <span>周五</span>
                <span>周六</span>
                <span>周日</span>
              </div>
            </div>
          </div>
        </div>

        <div className="chart-container">
          <div className="chart-header">
            <h3>用户增长</h3>
            <div className="chart-controls">
              <button className="chart-btn active">月</button>
              <button className="chart-btn">季</button>
              <button className="chart-btn">年</button>
            </div>
          </div>
          <div className="chart-placeholder">
            <div className="chart-mock">
              <div className="chart-line">
                <svg viewBox="0 0 300 150" className="line-chart">
                  <polyline
                    points="0,120 50,100 100,80 150,60 200,40 250,20 300,10"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                  />
                </svg>
              </div>
              <div className="chart-labels">
                <span>1月</span>
                <span>2月</span>
                <span>3月</span>
                <span>4月</span>
                <span>5月</span>
                <span>6月</span>
                <span>7月</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 最近活动 */}
      <div className="recent-activities">
        <div className="activities-header">
          <h3>最近活动</h3>
          <button className="view-all-btn">查看全部</button>
        </div>
        <div className="activities-list">
          {recentActivities.map(activity => (
            <div key={activity.id} className="activity-item">
              <div className="activity-icon">
                {getActivityIcon(activity.type)}
              </div>
              <div className="activity-content">
                <div className="activity-description">
                  {activity.description}
                  {activity.user && <span className="activity-user"> - {activity.user}</span>}
                  {activity.task && <span className="activity-task"> ({activity.task})</span>}
                  {activity.amount && <span className="activity-amount"> ¥{activity.amount}</span>}
                </div>
                <div className="activity-time">{activity.time}</div>
              </div>
              <div 
                className="activity-status"
                style={{ color: getActivityColor(activity.status) }}
              >
                {activity.status === 'success' ? '✓' : 
                 activity.status === 'pending' ? '⏳' : '⚠️'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 快速操作 */}
      <div className="quick-actions">
        <h3>快速操作</h3>
        <div className="actions-grid">
          <button className="action-btn">
            <span className="action-icon">👥</span>
            <span className="action-text">用户管理</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">📋</span>
            <span className="action-text">任务审核</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">💰</span>
            <span className="action-text">资金管理</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">📊</span>
            <span className="action-text">数据报表</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">⚙️</span>
            <span className="action-text">系统设置</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">🚨</span>
            <span className="action-text">举报处理</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
