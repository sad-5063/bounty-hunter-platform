// 消息相关API服务
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class MessageAPI {
  // ==================== 私信相关 ====================
  
  // 获取对话列表
  async getConversations(params = {}) {
    const queryParams = new URLSearchParams(params);
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/conversations?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取对话列表失败');
    }

    return await response.json();
  }

  // 创建新对话
  async createConversation(participantId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/conversations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ participant_id: participantId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '创建对话失败');
    }

    return await response.json();
  }

  // 获取对话消息
  async getConversationMessages(conversationId, params = {}) {
    const queryParams = new URLSearchParams(params);
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取消息失败');
    }

    return await response.json();
  }

  // 发送消息
  async sendMessage(messageData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '发送消息失败');
    }

    return await response.json();
  }

  // 标记消息为已读
  async markMessageAsRead(messageId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/messages/${messageId}/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '标记已读失败');
    }

    return await response.json();
  }

  // 删除消息
  async deleteMessage(messageId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/messages/${messageId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '删除消息失败');
    }

    return await response.json();
  }

  // 归档对话
  async archiveConversation(conversationId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/archive`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '归档对话失败');
    }

    return await response.json();
  }

  // 静音对话
  async muteConversation(conversationId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/mute`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '静音对话失败');
    }

    return await response.json();
  }

  // ==================== 通知相关 ====================

  // 获取通知列表
  async getNotifications(params = {}) {
    const queryParams = new URLSearchParams(params);
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/notifications?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取通知失败');
    }

    return await response.json();
  }

  // 标记通知为已读
  async markNotificationAsRead(notificationId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '标记通知已读失败');
    }

    return await response.json();
  }

  // 标记所有通知为已读
  async markAllNotificationsAsRead() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '标记全部已读失败');
    }

    return await response.json();
  }

  // 删除通知
  async deleteNotification(notificationId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '删除通知失败');
    }

    return await response.json();
  }

  // 删除所有通知
  async deleteAllNotifications() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/notifications/delete-all`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '清空通知失败');
    }

    return await response.json();
  }

  // ==================== 通知设置 ====================

  // 获取通知设置
  async getNotificationSettings() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/notification-settings`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取通知设置失败');
    }

    return await response.json();
  }

  // 更新通知设置
  async updateNotificationSettings(settings) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/notification-settings`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '更新通知设置失败');
    }

    return await response.json();
  }

  // ==================== 消息草稿 ====================

  // 保存消息草稿
  async saveMessageDraft(conversationId, content) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/message-drafts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ conversation_id: conversationId, content }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '保存草稿失败');
    }

    return await response.json();
  }

  // 获取消息草稿
  async getMessageDraft(conversationId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/message-drafts/${conversationId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取草稿失败');
    }

    return await response.json();
  }

  // 删除消息草稿
  async deleteMessageDraft(conversationId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/message-drafts/${conversationId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '删除草稿失败');
    }

    return await response.json();
  }

  // ==================== 实时通信 ====================

  // 建立WebSocket连接
  connectWebSocket(userId) {
    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:3001/ws';
    const ws = new WebSocket(`${wsUrl}?userId=${userId}`);
    
    ws.onopen = () => {
      console.log('WebSocket连接已建立');
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      return data;
    };
    
    ws.onclose = () => {
      console.log('WebSocket连接已关闭');
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket错误:', error);
    };
    
    return ws;
  }

  // 发送实时消息
  sendRealtimeMessage(ws, messageData) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'message',
        data: messageData
      }));
    }
  }

  // 发送正在输入状态
  sendTypingStatus(ws, conversationId, isTyping) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'typing',
        data: { conversation_id: conversationId, is_typing: isTyping }
      }));
    }
  }

  // ==================== 文件上传 ====================

  // 上传消息附件
  async uploadMessageAttachment(file, conversationId) {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversation_id', conversationId);

    const response = await fetch(`${API_BASE_URL}/messages/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '上传附件失败');
    }

    return await response.json();
  }

  // ==================== 搜索功能 ====================

  // 搜索消息
  async searchMessages(query, params = {}) {
    const queryParams = new URLSearchParams({ q: query, ...params });
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/messages/search?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '搜索消息失败');
    }

    return await response.json();
  }

  // 搜索对话
  async searchConversations(query, params = {}) {
    const queryParams = new URLSearchParams({ q: query, ...params });
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/conversations/search?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '搜索对话失败');
    }

    return await response.json();
  }
}

export const messageAPI = new MessageAPI();
