import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import './NotificationCenter.css';

const NotificationCenter = ({ 
  notifications, 
  onMarkAsRead, 
  onMarkAllAsRead, 
  onDeleteNotification,
  onDeleteAllNotifications,
  loading = false 
}) => {
  const [filterType, setFilterType] = useState('all');
  const [showSettings, setShowSettings] = useState(false);

  // 获取通知图标
  const getNotificationIcon = (type) => {
    const icons = {
      task_assigned: '📋',
      task_completed: '✅',
      task_cancelled: '❌',
      payment_received: '💰',
      payment_sent: '💸',
      payment_failed: '⚠️',
      review_received: '⭐',
      review_posted: '📝',
      account_verified: '🎉',
      account_suspended: '🚫',
      system_maintenance: '🔧',
      new_feature: '🆕',
      promotion: '🎁'
    };
    return icons[type] || '🔔';
  };

  // 获取通知优先级颜色
  const getPriorityColor = (priority) => {
    const colors = {
      low: '#6b7280',
      normal: '#3b82f6',
      high: '#f59e0b',
      urgent: '#ef4444'
    };
    return colors[priority] || '#3b82f6';
  };

  // 格式化时间
  const formatNotificationTime = (timestamp) => {
    return formatDistanceToNow(new Date(timestamp), { 
      addSuffix: true, 
      locale: zhCN 
    });
  };

  // 过滤通知
  const filteredNotifications = notifications.filter(notification => {
    switch (filterType) {
      case 'unread':
        return !notification.is_read;
      case 'read':
        return notification.is_read;
      case 'urgent':
        return notification.priority === 'urgent';
      case 'task':
        return notification.category === 'task';
      case 'payment':
        return notification.category === 'payment';
      case 'system':
        return notification.category === 'system';
      default:
        return true;
    }
  });

  // 统计未读通知数
  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="notification-center-loading">
        <div className="loading-spinner"></div>
        <p>加载通知中...</p>
      </div>
    );
  }

  return (
    <div className="notification-center">
      {/* 头部 */}
      <div className="notification-header">
        <div className="header-left">
          <h3>通知中心</h3>
          {unreadCount > 0 && (
            <span className="unread-count">{unreadCount}</span>
          )}
        </div>
        <div className="header-actions">
          {unreadCount > 0 && (
            <button 
              className="action-btn"
              onClick={onMarkAllAsRead}
              title="全部标记为已读"
            >
              ✓
            </button>
          )}
          <button 
            className="action-btn"
            onClick={() => setShowSettings(!showSettings)}
            title="通知设置"
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* 通知设置 */}
      {showSettings && (
        <div className="notification-settings">
          <h4>通知设置</h4>
          <div className="settings-grid">
            <label className="setting-item">
              <input type="checkbox" defaultChecked />
              <span>任务通知</span>
            </label>
            <label className="setting-item">
              <input type="checkbox" defaultChecked />
              <span>付款通知</span>
            </label>
            <label className="setting-item">
              <input type="checkbox" defaultChecked />
              <span>评价通知</span>
            </label>
            <label className="setting-item">
              <input type="checkbox" defaultChecked />
              <span>系统通知</span>
            </label>
            <label className="setting-item">
              <input type="checkbox" />
              <span>促销通知</span>
            </label>
          </div>
        </div>
      )}

      {/* 筛选标签 */}
      <div className="notification-filters">
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            全部 ({notifications.length})
          </button>
          <button 
            className={`filter-tab ${filterType === 'unread' ? 'active' : ''}`}
            onClick={() => setFilterType('unread')}
          >
            未读 ({unreadCount})
          </button>
          <button 
            className={`filter-tab ${filterType === 'urgent' ? 'active' : ''}`}
            onClick={() => setFilterType('urgent')}
          >
            紧急
          </button>
          <button 
            className={`filter-tab ${filterType === 'task' ? 'active' : ''}`}
            onClick={() => setFilterType('task')}
          >
            任务
          </button>
          <button 
            className={`filter-tab ${filterType === 'payment' ? 'active' : ''}`}
            onClick={() => setFilterType('payment')}
          >
            付款
          </button>
        </div>
      </div>

      {/* 通知列表 */}
      <div className="notifications-container">
        {filteredNotifications.length === 0 ? (
          <div className="no-notifications">
            <div className="empty-icon">🔔</div>
            <h4>暂无通知</h4>
            <p>
              {filterType === 'all' ? '您还没有收到任何通知' : '没有找到符合条件的通知'}
            </p>
          </div>
        ) : (
          <div className="notifications-list">
            {filteredNotifications.map(notification => (
              <div
                key={notification.notification_id}
                className={`notification-item ${!notification.is_read ? 'unread' : ''} ${notification.priority}`}
                onClick={() => !notification.is_read && onMarkAsRead(notification.notification_id)}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.notification_type)}
                </div>
                
                <div className="notification-content">
                  <div className="notification-header">
                    <h4 className="notification-title">{notification.title}</h4>
                    <div className="notification-meta">
                      <span 
                        className="priority-badge"
                        style={{ backgroundColor: getPriorityColor(notification.priority) }}
                      >
                        {notification.priority}
                      </span>
                      <span className="notification-time">
                        {formatNotificationTime(notification.created_at)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="notification-body">
                    <p className="notification-text">{notification.content}</p>
                  </div>
                  
                  {notification.data && Object.keys(notification.data).length > 0 && (
                    <div className="notification-data">
                      {notification.data.task_title && (
                        <span className="data-item">任务: {notification.data.task_title}</span>
                      )}
                      {notification.data.amount && (
                        <span className="data-item">金额: ¥{notification.data.amount}</span>
                      )}
                      {notification.data.hunter_name && (
                        <span className="data-item">猎人: {notification.data.hunter_name}</span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="notification-actions">
                  {!notification.is_read && (
                    <button 
                      className="action-btn mark-read"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkAsRead(notification.notification_id);
                      }}
                      title="标记为已读"
                    >
                      ✓
                    </button>
                  )}
                  <button 
                    className="action-btn delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNotification(notification.notification_id);
                    }}
                    title="删除通知"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 底部操作 */}
      {notifications.length > 0 && (
        <div className="notification-footer">
          <button 
            className="clear-all-btn"
            onClick={onDeleteAllNotifications}
          >
            清空所有通知
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;

