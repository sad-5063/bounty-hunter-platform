import React, { useState, useEffect } from 'react';
import ConversationList from '../components/messages/ConversationList';
import ChatInterface from '../components/messages/ChatInterface';
import NotificationCenter from '../components/messages/NotificationCenter';
import { messageAPI } from '../services/messageAPI';
import { useAuth } from '../contexts/AuthContext';
import './MessagesPage.css';

const MessagesPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('conversations');
  const [conversations, setConversations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 加载对话列表
  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await messageAPI.getConversations();
      setConversations(response.conversations || []);
    } catch (error) {
      setError('加载对话失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 加载通知列表
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await messageAPI.getNotifications();
      setNotifications(response.notifications || []);
    } catch (error) {
      setError('加载通知失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 选择对话
  const handleSelectConversation = async (conversation) => {
    try {
      setLoading(true);
      const response = await messageAPI.getConversationMessages(conversation.conversation_id);
      setSelectedConversation({
        ...conversation,
        messages: response.messages || []
      });
    } catch (error) {
      setError('加载消息失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 发送消息
  const handleSendMessage = async (messageData) => {
    try {
      const response = await messageAPI.sendMessage(messageData);
      
      // 更新本地消息列表
      if (selectedConversation) {
        setSelectedConversation(prev => ({
          ...prev,
          messages: [...(prev.messages || []), response.message]
        }));
      }
      
      // 更新对话列表中的最后消息
      setConversations(prev => 
        prev.map(conv => 
          conv.conversation_id === messageData.conversation_id
            ? { ...conv, last_message: response.message, last_message_at: response.message.created_at }
            : conv
        )
      );
    } catch (error) {
      throw new Error('发送消息失败: ' + error.message);
    }
  };

  // 开始新对话
  const handleStartNewChat = () => {
    // 这里可以打开用户选择对话框
    console.log('开始新对话');
  };

  // 标记通知为已读
  const handleMarkAsRead = async (notificationId) => {
    try {
      await messageAPI.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.notification_id === notificationId
            ? { ...notif, is_read: true, read_at: new Date().toISOString() }
            : notif
        )
      );
    } catch (error) {
      setError('标记已读失败: ' + error.message);
    }
  };

  // 标记所有通知为已读
  const handleMarkAllAsRead = async () => {
    try {
      await messageAPI.markAllNotificationsAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ 
          ...notif, 
          is_read: true, 
          read_at: new Date().toISOString() 
        }))
      );
    } catch (error) {
      setError('标记全部已读失败: ' + error.message);
    }
  };

  // 删除通知
  const handleDeleteNotification = async (notificationId) => {
    try {
      await messageAPI.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(notif => notif.notification_id !== notificationId));
    } catch (error) {
      setError('删除通知失败: ' + error.message);
    }
  };

  // 删除所有通知
  const handleDeleteAllNotifications = async () => {
    try {
      await messageAPI.deleteAllNotifications();
      setNotifications([]);
    } catch (error) {
      setError('清空通知失败: ' + error.message);
    }
  };

  // 组件挂载时加载数据
  useEffect(() => {
    if (user) {
      loadConversations();
      loadNotifications();
    }
  }, [user]);

  // 设置实时更新（这里可以集成WebSocket）
  useEffect(() => {
    // 这里可以设置WebSocket连接来实时接收消息和通知
    // const ws = new WebSocket('ws://localhost:3001/ws');
    // ws.onmessage = (event) => {
    //   const data = JSON.parse(event.data);
    //   // 处理实时消息和通知
    // };
    
    return () => {
      // 清理WebSocket连接
    };
  }, []);

  return (
    <div className="messages-page">
      <div className="messages-header">
        <h2>消息中心</h2>
        <div className="tab-switcher">
          <button 
            className={`tab-btn ${activeTab === 'conversations' ? 'active' : ''}`}
            onClick={() => setActiveTab('conversations')}
          >
            💬 对话
          </button>
          <button 
            className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            🔔 通知
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      <div className="messages-content">
        {activeTab === 'conversations' ? (
          <div className="conversations-layout">
            <div className="conversations-sidebar">
              <ConversationList
                conversations={conversations}
                currentUser={user}
                onSelectConversation={handleSelectConversation}
                onStartNewChat={handleStartNewChat}
                loading={loading}
              />
            </div>
            <div className="chat-main">
              <ChatInterface
                conversation={selectedConversation}
                currentUser={user}
                onSendMessage={handleSendMessage}
                loading={loading}
              />
            </div>
          </div>
        ) : (
          <div className="notifications-layout">
            <NotificationCenter
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
              onDeleteNotification={handleDeleteNotification}
              onDeleteAllNotifications={handleDeleteAllNotifications}
              loading={loading}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
