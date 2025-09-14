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

// 用户相关API
export const userAPI = {
  // 获取用户资料
  getProfile: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取用户资料失败');
    }
  },

  // 更新用户资料
  updateProfile: async (userId, userData) => {
    try {
      const response = await api.put(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '更新用户资料失败');
    }
  },

  // 上传头像
  uploadAvatar: async (userId, file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await api.post(`/users/${userId}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '上传头像失败');
    }
  },

  // 获取用户任务历史
  getTaskHistory: async (userId, page = 1, limit = 10) => {
    try {
      const response = await api.get(`/users/${userId}/tasks`, {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取任务历史失败');
    }
  },

  // 获取用户钱包余额
  getWalletBalance: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/wallet`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取钱包余额失败');
    }
  },

  // 获取用户信誉评分
  getReputation: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/reputation`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取信誉评分失败');
    }
  },

  // 获取用户统计信息
  getUserStats: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/stats`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取用户统计失败');
    }
  },

  // 搜索用户
  searchUsers: async (query, page = 1, limit = 10) => {
    try {
      const response = await api.get('/users/search', {
        params: { query, page, limit },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '搜索用户失败');
    }
  },

  // 关注用户
  followUser: async (userId, targetUserId) => {
    try {
      const response = await api.post(`/users/${userId}/follow`, {
        targetUserId,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '关注用户失败');
    }
  },

  // 取消关注用户
  unfollowUser: async (userId, targetUserId) => {
    try {
      const response = await api.delete(`/users/${userId}/follow/${targetUserId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '取消关注失败');
    }
  },

  // 获取关注列表
  getFollowing: async (userId, page = 1, limit = 10) => {
    try {
      const response = await api.get(`/users/${userId}/following`, {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取关注列表失败');
    }
  },

  // 获取粉丝列表
  getFollowers: async (userId, page = 1, limit = 10) => {
    try {
      const response = await api.get(`/users/${userId}/followers`, {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取粉丝列表失败');
    }
  },
};

export default userAPI;
