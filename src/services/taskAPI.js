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

// 任务相关API
export const taskAPI = {
  // 获取任务列表
  getTasks: async (params = {}) => {
    try {
      const response = await api.get('/tasks', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取任务列表失败');
    }
  },

  // 获取任务详情
  getTask: async (taskId) => {
    try {
      const response = await api.get(`/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取任务详情失败');
    }
  },

  // 创建任务
  createTask: async (taskData) => {
    try {
      const response = await api.post('/tasks', taskData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '创建任务失败');
    }
  },

  // 更新任务
  updateTask: async (taskId, taskData) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, taskData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '更新任务失败');
    }
  },

  // 删除任务
  deleteTask: async (taskId) => {
    try {
      const response = await api.delete(`/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '删除任务失败');
    }
  },

  // 接受任务
  acceptTask: async (taskId) => {
    try {
      const response = await api.post(`/tasks/${taskId}/accept`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '接受任务失败');
    }
  },

  // 完成任务
  completeTask: async (taskId, completionData) => {
    try {
      const response = await api.post(`/tasks/${taskId}/complete`, completionData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '完成任务失败');
    }
  },

  // 取消任务
  cancelTask: async (taskId, reason) => {
    try {
      const response = await api.post(`/tasks/${taskId}/cancel`, { reason });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '取消任务失败');
    }
  },

  // 获取用户的任务
  getUserTasks: async (userId, params = {}) => {
    try {
      const response = await api.get(`/users/${userId}/tasks`, { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取用户任务失败');
    }
  },

  // 搜索任务
  searchTasks: async (query, params = {}) => {
    try {
      const response = await api.get('/tasks/search', {
        params: { query, ...params }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '搜索任务失败');
    }
  },

  // 获取任务分类
  getCategories: async () => {
    try {
      const response = await api.get('/tasks/categories');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取任务分类失败');
    }
  },

  // 上传任务附件
  uploadAttachment: async (taskId, file) => {
    try {
      const formData = new FormData();
      formData.append('attachment', file);
      
      const response = await api.post(`/tasks/${taskId}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '上传附件失败');
    }
  },

  // 删除任务附件
  deleteAttachment: async (taskId, attachmentId) => {
    try {
      const response = await api.delete(`/tasks/${taskId}/attachments/${attachmentId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '删除附件失败');
    }
  },

  // 获取任务统计
  getTaskStats: async () => {
    try {
      const response = await api.get('/tasks/stats');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取任务统计失败');
    }
  }
};

export default taskAPI;
