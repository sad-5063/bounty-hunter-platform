// 用户相关API服务
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class UserAPI {
  // 上传头像
  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/users/upload-avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '头像上传失败');
    }

    const result = await response.json();
    return result.avatar_url;
  }

  // 获取用户统计信息
  async getUserStats(userId, token) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取用户统计失败');
    }

    return await response.json();
  }

  // 获取用户任务历史
  async getUserTasks(userId, token, params = {}) {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${API_BASE_URL}/users/${userId}/tasks?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取任务历史失败');
    }

    return await response.json();
  }

  // 获取用户评价历史
  async getUserReviews(userId, token) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/reviews`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取评价历史失败');
    }

    return await response.json();
  }

  // 删除用户账户
  async deleteAccount(token, password) {
    const response = await fetch(`${API_BASE_URL}/users/delete-account`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '删除账户失败');
    }

    return await response.json();
  }

  // 获取用户通知
  async getNotifications(token, params = {}) {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${API_BASE_URL}/users/notifications?${queryParams}`, {
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
  async markNotificationAsRead(token, notificationId) {
    const response = await fetch(`${API_BASE_URL}/users/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '标记通知失败');
    }

    return await response.json();
  }

  // 获取用户设置
  async getUserSettings(token) {
    const response = await fetch(`${API_BASE_URL}/users/settings`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取用户设置失败');
    }

    return await response.json();
  }

  // 更新用户设置
  async updateUserSettings(token, settings) {
    const response = await fetch(`${API_BASE_URL}/users/settings`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '更新用户设置失败');
    }

    return await response.json();
  }
}

export const userAPI = new UserAPI();
