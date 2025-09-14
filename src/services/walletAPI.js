// 钱包相关API服务
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class WalletAPI {
  // 获取用户钱包信息
  async getWallet() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/wallet`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取钱包信息失败');
    }

    return await response.json();
  }

  // 获取交易记录
  async getTransactions(params = {}) {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const response = await fetch(`${API_BASE_URL}/wallet/transactions?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取交易记录失败');
    }

    return await response.json();
  }

  // 创建充值订单
  async createDeposit(depositData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/wallet/deposit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(depositData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '创建充值订单失败');
    }

    return await response.json();
  }

  // 创建提现申请
  async createWithdrawal(withdrawalData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/wallet/withdraw`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(withdrawalData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '创建提现申请失败');
    }

    return await response.json();
  }

  // 获取充值记录
  async getDeposits(params = {}) {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams(params);
    
    const response = await fetch(`${API_BASE_URL}/wallet/deposits?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取充值记录失败');
    }

    return await response.json();
  }

  // 获取提现记录
  async getWithdrawals(params = {}) {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams(params);
    
    const response = await fetch(`${API_BASE_URL}/wallet/withdrawals?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取提现记录失败');
    }

    return await response.json();
  }

  // 获取支付方式列表
  async getPaymentMethods() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/wallet/payment-methods`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取支付方式失败');
    }

    return await response.json();
  }

  // 添加支付方式
  async addPaymentMethod(paymentMethodData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/wallet/payment-methods`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentMethodData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '添加支付方式失败');
    }

    return await response.json();
  }

  // 删除支付方式
  async deletePaymentMethod(paymentMethodId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/wallet/payment-methods/${paymentMethodId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '删除支付方式失败');
    }

    return await response.json();
  }

  // 设置默认支付方式
  async setDefaultPaymentMethod(paymentMethodId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/wallet/payment-methods/${paymentMethodId}/default`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '设置默认支付方式失败');
    }

    return await response.json();
  }

  // 获取钱包统计信息
  async getWalletStats(params = {}) {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams(params);
    
    const response = await fetch(`${API_BASE_URL}/wallet/stats?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取钱包统计失败');
    }

    return await response.json();
  }

  // 冻结资金
  async freezeFunds(freezeData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/wallet/freeze`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(freezeData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '冻结资金失败');
    }

    return await response.json();
  }

  // 解冻资金
  async unfreezeFunds(unfreezeData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/wallet/unfreeze`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(unfreezeData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '解冻资金失败');
    }

    return await response.json();
  }

  // 获取系统配置
  async getSystemSettings() {
    const response = await fetch(`${API_BASE_URL}/wallet/settings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取系统配置失败');
    }

    return await response.json();
  }

  // 验证支付密码
  async verifyPaymentPassword(password) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/wallet/verify-payment-password`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '支付密码验证失败');
    }

    return await response.json();
  }

  // 设置支付密码
  async setPaymentPassword(passwordData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/wallet/set-payment-password`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(passwordData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '设置支付密码失败');
    }

    return await response.json();
  }

  // 导出交易记录
  async exportTransactions(params = {}) {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams(params);
    
    const response = await fetch(`${API_BASE_URL}/wallet/export?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '导出交易记录失败');
    }

    // 处理文件下载
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return { success: true };
  }
}

export const walletAPI = new WalletAPI();
