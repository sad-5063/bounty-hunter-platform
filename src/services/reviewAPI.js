// 评价相关API服务
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ReviewAPI {
  // 提交任务评价
  async submitReview(reviewData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '提交评价失败');
    }

    return await response.json();
  }

  // 获取任务评价列表
  async getTaskReviews(taskId, params = {}) {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/reviews?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取评价列表失败');
    }

    return await response.json();
  }

  // 获取用户评价列表
  async getUserReviews(userId, params = {}) {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${API_BASE_URL}/users/${userId}/reviews?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取用户评价失败');
    }

    return await response.json();
  }

  // 获取用户信誉信息
  async getUserReputation(userId) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/reputation`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取信誉信息失败');
    }

    return await response.json();
  }

  // 更新评价
  async updateReview(reviewId, reviewData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '更新评价失败');
    }

    return await response.json();
  }

  // 删除评价
  async deleteReview(reviewId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '删除评价失败');
    }

    return await response.json();
  }

  // 回复评价
  async replyToReview(reviewId, replyData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/replies`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(replyData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '回复评价失败');
    }

    return await response.json();
  }

  // 举报评价
  async reportReview(reviewId, reportData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/report`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reportData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '举报评价失败');
    }

    return await response.json();
  }

  // 标记评价有用
  async markReviewHelpful(reviewId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/helpful`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '标记有用失败');
    }

    return await response.json();
  }

  // 获取信誉徽章列表
  async getReputationBadges() {
    const response = await fetch(`${API_BASE_URL}/reputation/badges`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取徽章列表失败');
    }

    return await response.json();
  }

  // 获取用户徽章
  async getUserBadges(userId) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/badges`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取用户徽章失败');
    }

    return await response.json();
  }

  // 获取信誉统计
  async getReputationStats(userId, params = {}) {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${API_BASE_URL}/users/${userId}/reputation/stats?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取信誉统计失败');
    }

    return await response.json();
  }

  // 获取信誉历史
  async getReputationHistory(userId, params = {}) {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${API_BASE_URL}/users/${userId}/reputation/history?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取信誉历史失败');
    }

    return await response.json();
  }

  // 检查是否可以评价
  async canReview(taskId, reviewType) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/reviews/can-review`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ task_id: taskId, review_type: reviewType }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '检查评价权限失败');
    }

    return await response.json();
  }

  // 获取评价模板
  async getReviewTemplates(reviewType) {
    const response = await fetch(`${API_BASE_URL}/reviews/templates?type=${reviewType}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取评价模板失败');
    }

    return await response.json();
  }

  // 批量获取用户信誉
  async getBatchUserReputation(userIds) {
    const response = await fetch(`${API_BASE_URL}/reputation/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_ids: userIds }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '批量获取信誉失败');
    }

    return await response.json();
  }
}

export const reviewAPI = new ReviewAPI();
