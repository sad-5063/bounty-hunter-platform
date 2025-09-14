import React, { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import './ChatInterface.css';

const ChatInterface = ({ 
  conversation, 
  currentUser, 
  onSendMessage, 
  onLoadMoreMessages,
  loading = false 
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  // 处理输入变化
  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    // 发送正在输入状态
    if (value.length > 0 && !isTyping) {
      setIsTyping(true);
      // 这里可以发送正在输入的状态到服务器
    }

    // 清除之前的定时器
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // 设置定时器，停止输入后取消正在输入状态
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  // 发送消息
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    const messageData = {
      conversation_id: conversation.conversation_id,
      content: message.trim(),
      message_type: 'text'
    };

    try {
      await onSendMessage(messageData);
      setMessage('');
      setIsTyping(false);
      inputRef.current?.focus();
    } catch (error) {
      console.error('发送消息失败:', error);
    }
  };

  // 处理键盘事件
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // 添加表情
  const addEmoji = (emoji) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  // 表情列表
  const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'];

  // 格式化时间
  const formatMessageTime = (timestamp) => {
    return formatDistanceToNow(new Date(timestamp), { 
      addSuffix: true, 
      locale: zhCN 
    });
  };

  // 检查是否是连续消息
  const isConsecutiveMessage = (currentMessage, previousMessage) => {
    if (!previousMessage) return false;
    return (
      currentMessage.sender_id === previousMessage.sender_id &&
      new Date(currentMessage.created_at) - new Date(previousMessage.created_at) < 5 * 60 * 1000 // 5分钟内
    );
  };

  if (!conversation) {
    return (
      <div className="chat-interface-empty">
        <div className="empty-icon">💬</div>
        <h3>选择对话</h3>
        <p>从左侧选择一个对话开始聊天</p>
      </div>
    );
  }

  const otherUser = conversation.participant1_id === currentUser.user_id 
    ? conversation.participant2 
    : conversation.participant1;

  return (
    <div className="chat-interface">
      {/* 聊天头部 */}
      <div className="chat-header">
        <div className="user-info">
          <div className="user-avatar">
            {otherUser?.name?.charAt(0) || 'U'}
          </div>
          <div className="user-details">
            <div className="user-name">{otherUser?.name || '未知用户'}</div>
            <div className="user-status">
              {conversation.is_active ? '在线' : '离线'}
            </div>
          </div>
        </div>
        <div className="chat-actions">
          <button className="action-btn" title="语音通话">
            📞
          </button>
          <button className="action-btn" title="视频通话">
            📹
          </button>
          <button className="action-btn" title="更多选项">
            ⋮
          </button>
        </div>
      </div>

      {/* 消息列表 */}
      <div className="messages-container">
        <div className="messages-list">
          {conversation.messages?.map((msg, index) => {
            const isOwn = msg.sender_id === currentUser.user_id;
            const isConsecutive = isConsecutiveMessage(msg, conversation.messages[index - 1]);
            
            return (
              <div key={msg.message_id} className={`message-item ${isOwn ? 'own' : 'other'} ${isConsecutive ? 'consecutive' : ''}`}>
                {!isConsecutive && (
                  <div className="message-avatar">
                    {msg.sender?.name?.charAt(0) || 'U'}
                  </div>
                )}
                <div className="message-content">
                  {!isConsecutive && (
                    <div className="message-header">
                      <span className="sender-name">{msg.sender?.name || '未知用户'}</span>
                      <span className="message-time">{formatMessageTime(msg.created_at)}</span>
                    </div>
                  )}
                  <div className="message-bubble">
                    {msg.content}
                    {msg.is_read && isOwn && (
                      <div className="read-status">✓✓</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {loading && (
            <div className="loading-messages">
              <div className="loading-spinner"></div>
              <span>加载更多消息...</span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 输入区域 */}
      <div className="message-input-container">
        <form onSubmit={handleSendMessage} className="message-input-form">
          <div className="input-actions">
            <button 
              type="button" 
              className="action-btn"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              title="表情"
            >
              😊
            </button>
            <button type="button" className="action-btn" title="图片">
              📷
            </button>
            <button type="button" className="action-btn" title="文件">
              📎
            </button>
          </div>
          
          <div className="input-wrapper">
            <textarea
              ref={inputRef}
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="输入消息..."
              className="message-input"
              rows={1}
              disabled={loading}
            />
            <button 
              type="submit" 
              className="send-btn"
              disabled={!message.trim() || loading}
            >
              {loading ? '⏳' : '📤'}
            </button>
          </div>
        </form>

        {/* 表情选择器 */}
        {showEmojiPicker && (
          <div className="emoji-picker">
            <div className="emoji-grid">
              {emojis.map((emoji, index) => (
                <button
                  key={index}
                  className="emoji-btn"
                  onClick={() => addEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
