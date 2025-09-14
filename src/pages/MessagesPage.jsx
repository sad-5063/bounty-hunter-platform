import React, { useState } from 'react';
import './MessagesPage.css';

const MessagesPage = () => {
  const [activeTab, setActiveTab] = useState('messages');
  const [messages] = useState([
    {
      id: 1,
      sender: '张三',
      senderEmail: 'zhangsan@example.com',
      subject: '关于网站设计任务的讨论',
      content: '您好，我想了解一下网站设计任务的具体要求...',
      date: '2025-01-10',
      unread: true
    },
    {
      id: 2,
      sender: '李四',
      senderEmail: 'lisi@example.com',
      subject: '任务完成确认',
      content: '任务已经完成，请查看附件...',
      date: '2025-01-09',
      unread: false
    }
  ]);

  const [notifications] = useState([
    {
      id: 1,
      type: 'task_accepted',
      title: '任务被接受',
      content: '您的"网站设计任务"已被接受',
      date: '2025-01-10',
      unread: true
    },
    {
      id: 2,
      type: 'payment_received',
      title: '收到付款',
      content: '您收到了¥2000的任务完成费用',
      date: '2025-01-09',
      unread: false
    }
  ]);

  return (
    <div className="messages-page">
      <div className="messages-container">
        <h1>消息中心</h1>
        
        <div className="messages-tabs">
          <button 
            className={`tab ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            私信 ({messages.filter(m => m.unread).length})
          </button>
          <button 
            className={`tab ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            通知 ({notifications.filter(n => n.unread).length})
          </button>
        </div>
        
        <div className="messages-content">
          {activeTab === 'messages' && (
            <div className="messages-section">
              <div className="messages-list">
                {messages.map(message => (
                  <div key={message.id} className={`message-item ${message.unread ? 'unread' : ''}`}>
                    <div className="message-header">
                      <div className="message-sender">{message.sender}</div>
                      <div className="message-date">{message.date}</div>
                    </div>
                    <div className="message-subject">{message.subject}</div>
                    <div className="message-content">{message.content}</div>
                    <div className="message-actions">
                      <button className="btn btn-primary">回复</button>
                      <button className="btn btn-secondary">删除</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'notifications' && (
            <div className="notifications-section">
              <div className="notifications-list">
                {notifications.map(notification => (
                  <div key={notification.id} className={`notification-item ${notification.unread ? 'unread' : ''}`}>
                    <div className="notification-icon">
                      {notification.type === 'task_accepted' ? '🎯' : '💰'}
                    </div>
                    <div className="notification-content">
                      <div className="notification-title">{notification.title}</div>
                      <div className="notification-text">{notification.content}</div>
                      <div className="notification-date">{notification.date}</div>
                    </div>
                    <div className="notification-actions">
                      <button className="btn btn-secondary">标记已读</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;