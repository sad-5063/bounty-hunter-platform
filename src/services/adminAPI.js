// 管理员相关API服务
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class AdminAPI {
  // ==================== 用户管理 ====================

  // 获取用户列表
  async getUsers(params = {}) {
    const queryParams = new URLSearchParams(params);
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/users?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取用户列表失败');
    }

    return await response.json();
  }

  // 获取用户详情
  async getUserDetails(userId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取用户详情失败');
    }

    return await response.json();
  }

  // 封禁用户
  async banUser(userId, reason) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/ban`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '封禁用户失败');
    }

    return await response.json();
  }

  // 解封用户
  async unbanUser(userId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/unban`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '解封用户失败');
    }

    return await response.json();
  }

  // 暂停用户
  async suspendUser(userId, reason, duration) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/suspend`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason, duration }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '暂停用户失败');
    }

    return await response.json();
  }

  // 认证用户
  async verifyUser(userId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '认证用户失败');
    }

    return await response.json();
  }

  // ==================== 任务管理 ====================

  // 获取任务列表
  async getTasks(params = {}) {
    const queryParams = new URLSearchParams(params);
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/tasks?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取任务列表失败');
    }

    return await response.json();
  }

  // 审核任务
  async reviewTask(taskId, decision, notes) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/tasks/${taskId}/review`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ decision, notes }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '审核任务失败');
    }

    return await response.json();
  }

  // 删除任务
  async deleteTask(taskId, reason) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '删除任务失败');
    }

    return await response.json();
  }

  // 推荐任务
  async featureTask(taskId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/tasks/${taskId}/feature`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '推荐任务失败');
    }

    return await response.json();
  }

  // ==================== 资金管理 ====================

  // 获取提现申请
  async getWithdrawalRequests(params = {}) {
    const queryParams = new URLSearchParams(params);
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/withdrawals?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取提现申请失败');
    }

    return await response.json();
  }

  // 审核提现申请
  async reviewWithdrawal(withdrawalId, decision, notes) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/withdrawals/${withdrawalId}/review`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ decision, notes }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '审核提现申请失败');
    }

    return await response.json();
  }

  // 获取资金统计
  async getFinancialStats(params = {}) {
    const queryParams = new URLSearchParams(params);
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/financial/stats?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取资金统计失败');
    }

    return await response.json();
  }

  // ==================== 数据统计 ====================

  // 获取仪表板数据
  async getDashboardData() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取仪表板数据失败');
    }

    return await response.json();
  }

  // 获取用户统计
  async getUserStats(params = {}) {
    const queryParams = new URLSearchParams(params);
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/stats/users?${queryParams}`, {
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

  // 获取任务统计
  async getTaskStats(params = {}) {
    const queryParams = new URLSearchParams(params);
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/stats/tasks?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取任务统计失败');
    }

    return await response.json();
  }

  // 获取收入统计
  async getRevenueStats(params = {}) {
    const queryParams = new URLSearchParams(params);
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/stats/revenue?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取收入统计失败');
    }

    return await response.json();
  }

  // ==================== 举报处理 ====================

  // 获取举报列表
  async getReports(params = {}) {
    const queryParams = new URLSearchParams(params);
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/reports?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取举报列表失败');
    }

    return await response.json();
  }

  // 处理举报
  async handleReport(reportId, decision, action, notes) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/reports/${reportId}/handle`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ decision, action, notes }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '处理举报失败');
    }

    return await response.json();
  }

  // ==================== 系统设置 ====================

  // 获取系统配置
  async getSystemConfigs() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/configs`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取系统配置失败');
    }

    return await response.json();
  }

  // 更新系统配置
  async updateSystemConfig(configKey, configValue) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/configs/${configKey}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ config_value: configValue }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '更新系统配置失败');
    }

    return await response.json();
  }

  // 获取维护计划
  async getMaintenancePlans() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/maintenance`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取维护计划失败');
    }

    return await response.json();
  }

  // 创建维护计划
  async createMaintenancePlan(planData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/maintenance`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(planData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '创建维护计划失败');
    }

    return await response.json();
  }

  // ==================== 操作日志 ====================

  // 获取操作日志
  async getActionLogs(params = {}) {
    const queryParams = new URLSearchParams(params);
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/logs?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取操作日志失败');
    }

    return await response.json();
  }

  // 导出数据
  async exportData(dataType, params = {}) {
    const queryParams = new URLSearchParams(params);
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/export/${dataType}?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '导出数据失败');
    }

    return await response.blob();
  }

  // ==================== 权限检查 ====================

  // 检查管理员权限
  async checkAdminAccess() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/access`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '权限检查失败');
    }

    return await response.json();
  }

  // 获取管理员信息
  async getAdminInfo() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/info`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取管理员信息失败');
    }

    return await response.json();
  }
}

export const adminAPI = new AdminAPI();

