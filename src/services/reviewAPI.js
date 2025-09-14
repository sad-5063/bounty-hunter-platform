import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 评价相关API
export const reviewAPI = {
  // 创建评价
  createReview: async (reviewData) => {
    try {
      const response = await api.post('/reviews', reviewData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '创建评价失败');
    }
  },

  // 获取用户评价
  getUserReviews: async (userId, page = 1, limit = 20) => {
    try {
      const response = await api.get(`/users/${userId}/reviews`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取用户评价失败');
    }
  },

  // 获取任务评价
  getTaskReviews: async (taskId) => {
    try {
      const response = await api.get(`/tasks/${taskId}/reviews`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取任务评价失败');
    }
  },

  // 更新评价
  updateReview: async (reviewId, reviewData) => {
    try {
      const response = await api.put(`/reviews/${reviewId}`, reviewData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '更新评价失败');
    }
  },

  // 删除评价
  deleteReview: async (reviewId) => {
    try {
      const response = await api.delete(`/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '删除评价失败');
    }
  },

  // 获取评价详情
  getReview: async (reviewId) => {
    try {
      const response = await api.get(`/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取评价详情失败');
    }
  },

  // 获取用户信誉评分
  getUserReputation: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/reputation`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取用户信誉评分失败');
    }
  },

  // 举报评价
  reportReview: async (reviewId, reason) => {
    try {
      const response = await api.post(`/reviews/${reviewId}/report`, {
        reason
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '举报评价失败');
    }
  },

  // 获取评价统计
  getReviewStats: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/review-stats`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取评价统计失败');
    }
  },

  // 搜索评价
  searchReviews: async (query, params = {}) => {
    try {
      const response = await api.get('/reviews/search', {
        params: { query, ...params }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '搜索评价失败');
    }
  },

  // 获取最新评价
  getLatestReviews: async (limit = 10) => {
    try {
      const response = await api.get('/reviews/latest', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取最新评价失败');
    }
  },

  // 获取高评分用户
  getTopRatedUsers: async (limit = 10) => {
    try {
      const response = await api.get('/reviews/top-rated-users', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取高评分用户失败');
    }
  },

  // 验证是否可以评价
  canReview: async (taskId, userId) => {
    try {
      const response = await api.get(`/reviews/can-review`, {
        params: { taskId, userId }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '验证评价权限失败');
    }
  },

  // 获取评价模板
  getReviewTemplates: async () => {
    try {
      const response = await api.get('/reviews/templates');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取评价模板失败');
    }
  },

  // 批量评价
  batchReview: async (reviews) => {
    try {
      const response = await api.post('/reviews/batch', { reviews });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '批量评价失败');
    }
  }
};

export default reviewAPI;