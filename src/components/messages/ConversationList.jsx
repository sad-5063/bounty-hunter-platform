import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import './ConversationList.css';

const ConversationList = ({ 
  conversations, 
  currentUser, 
  onSelectConversation, 
  onStartNewChat,
  loading = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // 过滤对话
  const filteredConversations = conversations.filter(conversation => {
    const otherUser = conversation.participant1_id === currentUser.user_id 
      ? conversation.participant2 
      : conversation.participant1;
    
    const matchesSearch = otherUser?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    switch (filterType) {
      case 'unread':
        const unreadCount = conversation.participant1_id === currentUser.user_id 
          ? conversation.unread_count_participant1 
          : conversation.unread_count_participant2;
        matchesFilter = unreadCount > 0;
        break;
      case 'archived':
        matchesFilter = conversation.is_archived;
        break;
      case 'active':
        matchesFilter = !conversation.is_archived && conversation.is_active;
        break;
    }
    
    return matchesSearch && matchesFilter;
  });

  // 格式化最后消息时间
  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';
    return formatDistanceToNow(new Date(timestamp), { 
      addSuffix: true, 
      locale: zhCN 
    });
  };

  // 截断消息内容
  const truncateMessage = (content, maxLength = 50) => {
    if (!content) return '';
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };

  // 获取未读消息数
  const getUnreadCount = (conversation) => {
    return conversation.participant1_id === currentUser.user_id 
      ? conversation.unread_count_participant1 
      : conversation.unread_count_participant2;
  };

  // 检查是否被静音
  const isMuted = (conversation) => {
    return conversation.participant1_id === currentUser.user_id 
      ? conversation.is_muted_participant1 
      : conversation.is_muted_participant2;
  };

  if (loading) {
    return (
      <div className="conversation-list-loading">
        <div className="loading-spinner"></div>
        <p>加载对话中...</p>
      </div>
    );
  }

  return (
    <div className="conversation-list">
      {/* 头部 */}
      <div className="conversation-header">
        <h3>消息</h3>
        <button 
          className="new-chat-btn"
          onClick={onStartNewChat}
          title="新建对话"
        >
          ✏️
        </button>
      </div>

      {/* 搜索和筛选 */}
      <div className="conversation-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="搜索对话..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            全部
          </button>
          <button 
            className={`filter-tab ${filterType === 'unread' ? 'active' : ''}`}
            onClick={() => setFilterType('unread')}
          >
            未读
          </button>
          <button 
            className={`filter-tab ${filterType === 'archived' ? 'active' : ''}`}
            onClick={() => setFilterType('archived')}
          >
            已归档
          </button>
        </div>
      </div>

      {/* 对话列表 */}
      <div className="conversations-container">
        {filteredConversations.length === 0 ? (
          <div className="no-conversations">
            <div className="empty-icon">💬</div>
            <h4>暂无对话</h4>
            <p>
              {searchTerm ? '没有找到匹配的对话' : '开始与用户聊天吧'}
            </p>
            {!searchTerm && (
              <button 
                className="start-chat-btn"
                onClick={onStartNewChat}
              >
                开始聊天
              </button>
            )}
          </div>
        ) : (
          <div className="conversations-list">
            {filteredConversations.map(conversation => {
              const otherUser = conversation.participant1_id === currentUser.user_id 
                ? conversation.participant2 
                : conversation.participant1;
              const unreadCount = getUnreadCount(conversation);
              const muted = isMuted(conversation);
              
              return (
                <div
                  key={conversation.conversation_id}
                  className={`conversation-item ${conversation.is_active ? 'active' : ''} ${conversation.is_archived ? 'archived' : ''}`}
                  onClick={() => onSelectConversation(conversation)}
                >
                  <div className="conversation-avatar">
                    {otherUser?.name?.charAt(0) || 'U'}
                  </div>
                  
                  <div className="conversation-content">
                    <div className="conversation-header">
                      <div className="conversation-user">
                        <span className="user-name">{otherUser?.name || '未知用户'}</span>
                        {muted && <span className="muted-icon">🔇</span>}
                        {conversation.is_archived && <span className="archived-icon">📁</span>}
                      </div>
                      <div className="conversation-meta">
                        {conversation.last_message_at && (
                          <span className="last-message-time">
                            {formatLastMessageTime(conversation.last_message_at)}
                          </span>
                        )}
                        {unreadCount > 0 && (
                          <span className="unread-badge">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="conversation-preview">
                      <span className="last-message">
                        {conversation.last_message ? 
                          truncateMessage(conversation.last_message.content) : 
                          '暂无消息'
                        }
                      </span>
                    </div>
                  </div>
                  
                  <div className="conversation-actions">
                    <button 
                      className="action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        // 处理更多操作
                      }}
                      title="更多选项"
                    >
                      ⋮
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
