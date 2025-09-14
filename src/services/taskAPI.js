// 任务相关API服务
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class TaskAPI {
  // 获取任务列表
  async getTasks(params = {}) {
    const queryParams = new URLSearchParams();
    
    // 添加查询参数
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        if (Array.isArray(params[key])) {
          params[key].forEach(value => queryParams.append(key, value));
        } else {
          queryParams.append(key, params[key]);
        }
      }
    });

    const response = await fetch(`${API_BASE_URL}/tasks?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取任务列表失败');
    }

    return await response.json();
  }

  // 获取任务详情
  async getTaskById(taskId) {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取任务详情失败');
    }

    return await response.json();
  }

  // 创建任务
  async createTask(taskData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '创建任务失败');
    }

    return await response.json();
  }

  // 更新任务
  async updateTask(taskId, taskData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '更新任务失败');
    }

    return await response.json();
  }

  // 删除任务
  async deleteTask(taskId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '删除任务失败');
    }

    return await response.json();
  }

  // 申请任务
  async applyTask(taskId, applicationData = {}) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/apply`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(applicationData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '申请任务失败');
    }

    return await response.json();
  }

  // 获取任务申请列表
  async getTaskApplications(taskId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/applications`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取申请列表失败');
    }

    return await response.json();
  }

  // 接受任务申请
  async acceptApplication(taskId, applicationId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/applications/${applicationId}/accept`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '接受申请失败');
    }

    return await response.json();
  }

  // 拒绝任务申请
  async rejectApplication(taskId, applicationId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/applications/${applicationId}/reject`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '拒绝申请失败');
    }

    return await response.json();
  }

  // 开始任务
  async startTask(taskId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/start`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '开始任务失败');
    }

    return await response.json();
  }

  // 完成任务
  async completeTask(taskId, completionData = {}) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(completionData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '完成任务失败');
    }

    return await response.json();
  }

  // 取消任务
  async cancelTask(taskId, reason = '') {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '取消任务失败');
    }

    return await response.json();
  }

  // 获取任务分类
  async getCategories() {
    const response = await fetch(`${API_BASE_URL}/tasks/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取分类失败');
    }

    return await response.json();
  }

  // 获取技能标签
  async getSkills() {
    const response = await fetch(`${API_BASE_URL}/tasks/skills`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '获取技能标签失败');
    }

    return await response.json();
  }

  // 获取用户的任务
  async getUserTasks(userId, params = {}) {
    const token = localStorage.getItem('token');
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
      throw new Error(error.message || '获取用户任务失败');
    }

    return await response.json();
  }

  // 上传任务附件
  async uploadTaskAttachment(taskId, file) {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/attachments`, {
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

  // 删除任务附件
  async deleteTaskAttachment(taskId, attachmentId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/attachments/${attachmentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '删除附件失败');
    }

    return await response.json();
  }
}

export const taskAPI = new TaskAPI();
