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

// 钱包相关API
export const walletAPI = {
  // 获取钱包信息
  getWallet: async (userId) => {
    try {
      const response = await api.get(`/wallet/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取钱包信息失败');
    }
  },

  // 获取交易记录
  getTransactions: async (userId, page = 1, limit = 20) => {
    try {
      const response = await api.get(`/wallet/${userId}/transactions`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取交易记录失败');
    }
  },

  // 充值
  topUp: async (userId, amount, method) => {
    try {
      const response = await api.post(`/wallet/${userId}/topup`, {
        amount,
        method
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '充值失败');
    }
  },

  // 提现
  withdraw: async (userId, amount, account) => {
    try {
      const response = await api.post(`/wallet/${userId}/withdraw`, {
        amount,
        account
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '提现失败');
    }
  },

  // 转账
  transfer: async (userId, targetUserId, amount, description) => {
    try {
      const response = await api.post(`/wallet/${userId}/transfer`, {
        targetUserId,
        amount,
        description
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '转账失败');
    }
  },

  // 获取余额
  getBalance: async (userId) => {
    try {
      const response = await api.get(`/wallet/${userId}/balance`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取余额失败');
    }
  },

  // 冻结资金
  freezeFunds: async (userId, amount, reason) => {
    try {
      const response = await api.post(`/wallet/${userId}/freeze`, {
        amount,
        reason
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '冻结资金失败');
    }
  },

  // 解冻资金
  unfreezeFunds: async (userId, amount, reason) => {
    try {
      const response = await api.post(`/wallet/${userId}/unfreeze`, {
        amount,
        reason
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '解冻资金失败');
    }
  },

  // 获取交易详情
  getTransaction: async (transactionId) => {
    try {
      const response = await api.get(`/transactions/${transactionId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取交易详情失败');
    }
  },

  // 确认交易
  confirmTransaction: async (transactionId, code) => {
    try {
      const response = await api.post(`/transactions/${transactionId}/confirm`, {
        code
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '确认交易失败');
    }
  },

  // 取消交易
  cancelTransaction: async (transactionId, reason) => {
    try {
      const response = await api.post(`/transactions/${transactionId}/cancel`, {
        reason
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '取消交易失败');
    }
  },

  // 获取钱包统计
  getWalletStats: async (userId) => {
    try {
      const response = await api.get(`/wallet/${userId}/stats`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取钱包统计失败');
    }
  },

  // 设置支付密码
  setPaymentPassword: async (userId, password) => {
    try {
      const response = await api.post(`/wallet/${userId}/payment-password`, {
        password
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '设置支付密码失败');
    }
  },

  // 验证支付密码
  verifyPaymentPassword: async (userId, password) => {
    try {
      const response = await api.post(`/wallet/${userId}/verify-payment-password`, {
        password
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '验证支付密码失败');
    }
  },

  // 获取充值方式
  getPaymentMethods: async () => {
    try {
      const response = await api.get('/wallet/payment-methods');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取支付方式失败');
    }
  },

  // 获取提现方式
  getWithdrawMethods: async () => {
    try {
      const response = await api.get('/wallet/withdraw-methods');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '获取提现方式失败');
    }
  }
};

export default walletAPI;
