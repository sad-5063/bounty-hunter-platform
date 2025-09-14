import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { taskAPI } from '../services/taskAPI';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import './TaskDetailPage.css';

const TaskDetailPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [task, setTask] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationData, setApplicationData] = useState({
    message: '',
    proposedReward: '',
    estimatedCompletionDate: ''
  });

  useEffect(() => {
    loadTaskDetails();
  }, [taskId]);

  const loadTaskDetails = async () => {
    setLoading(true);
    setError('');

    try {
      const [taskData, applicationsData] = await Promise.all([
        taskAPI.getTaskById(taskId),
        taskAPI.getTaskApplications(taskId)
      ]);
      
      setTask(taskData);
      setApplications(applicationsData);
    } catch (error) {
      setError('加载任务详情失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('请先登录');
      return;
    }

    setApplying(true);
    try {
      await taskAPI.applyTask(taskId, applicationData);
      alert('申请成功！');
      setShowApplicationForm(false);
      setApplicationData({ message: '', proposedReward: '', estimatedCompletionDate: '' });
      loadTaskDetails(); // 重新加载数据
    } catch (error) {
      alert('申请失败: ' + error.message);
    } finally {
      setApplying(false);
    }
  };

  const formatReward = (amount, currency = 'CNY') => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: '#f59e0b',
      active: '#10b981',
      in_progress: '#3b82f6',
      completed: '#059669',
      cancelled: '#ef4444',
      disputed: '#dc2626'
    };
    return statusColors[status] || '#6b7280';
  };

  const getStatusText = (status) => {
    const statusTexts = {
      pending: '待接单',
      active: '进行中',
      in_progress: '执行中',
      completed: '已完成',
      cancelled: '已取消',
      disputed: '争议中'
    };
    return statusTexts[status] || status;
  };

  const canApply = () => {
    return isAuthenticated && 
           task?.status === 'pending' && 
           task?.publisher_id !== user?.user_id &&
           !applications.some(app => app.hunter_id === user?.user_id);
  };

  if (loading) {
    return (
      <div className="task-detail-loading">
        <div className="loading-spinner"></div>
        <p>加载任务详情中...</p>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="task-detail-error">
        <div className="error-icon">❌</div>
        <h3>加载失败</h3>
        <p>{error || '任务不存在'}</p>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/tasks')}
        >
          返回任务大厅
        </button>
      </div>
    );
  }

  return (
    <div className="task-detail-page">
      <div className="task-detail-container">
        {/* 任务头部信息 */}
        <div className="task-header">
          <div className="task-title-section">
            <div className="task-status">
              <span 
                className="status-badge"
                style={{ backgroundColor: getStatusColor(task.status) }}
              >
                {getStatusText(task.status)}
              </span>
              {task.priority !== 'normal' && (
                <span className="priority-badge">
                  {task.priority === 'high' ? '高优先级' : 
                   task.priority === 'urgent' ? '紧急' : '低优先级'}
                </span>
              )}
            </div>
            <h1 className="task-title">{task.title}</h1>
            <div className="task-meta">
              <span className="task-category">📂 {task.category}</span>
              {task.city && <span className="task-location">📍 {task.city}</span>}
              <span className="task-time">
                {formatDistanceToNow(new Date(task.created_at), { 
                  addSuffix: true, 
                  locale: zhCN 
                })}
              </span>
            </div>
          </div>
          
          <div className="task-reward-section">
            <div className="reward-amount">
              {formatReward(task.reward, task.currency)}
            </div>
            <div className="reward-label">赏金金额</div>
          </div>
        </div>

        {/* 任务内容 */}
        <div className="task-content">
          <div className="task-main">
            <div className="task-description">
              <h3>任务描述</h3>
              <div className="description-content">
                {task.description.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* 任务要求 */}
            <div className="task-requirements">
              <h3>任务要求</h3>
              <div className="requirements-grid">
                {task.experience_level && (
                  <div className="requirement-item">
                    <span className="requirement-label">经验要求</span>
                    <span className="requirement-value">
                      {task.experience_level === 'beginner' ? '初级' :
                       task.experience_level === 'intermediate' ? '中级' :
                       task.experience_level === 'expert' ? '高级' : '不限'}
                    </span>
                  </div>
                )}
                
                {task.estimated_hours && (
                  <div className="requirement-item">
                    <span className="requirement-label">预计工时</span>
                    <span className="requirement-value">{task.estimated_hours} 小时</span>
                  </div>
                )}
                
                {task.deadline && (
                  <div className="requirement-item">
                    <span className="requirement-label">截止时间</span>
                    <span className="requirement-value">
                      {new Date(task.deadline).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                )}
                
                {task.max_applicants && (
                  <div className="requirement-item">
                    <span className="requirement-label">最大申请人数</span>
                    <span className="requirement-value">{task.max_applicants} 人</span>
                  </div>
                )}
              </div>
            </div>

            {/* 技能要求 */}
            {task.skills_required && task.skills_required.length > 0 && (
              <div className="task-skills">
                <h3>技能要求</h3>
                <div className="skills-list">
                  {task.skills_required.map((skill, index) => (
                    <span key={index} className="skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 任务统计 */}
            <div className="task-stats">
              <h3>任务统计</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-number">{task.view_count || 0}</span>
                  <span className="stat-label">浏览次数</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{task.application_count || 0}</span>
                  <span className="stat-label">申请人数</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{applications.length}</span>
                  <span className="stat-label">有效申请</span>
                </div>
              </div>
            </div>
          </div>

          {/* 侧边栏 */}
          <div className="task-sidebar">
            {/* 发布者信息 */}
            <div className="publisher-info">
              <h3>任务发布者</h3>
              <div className="publisher-card">
                <div className="publisher-avatar">
                  {task.publisher?.name?.charAt(0) || 'U'}
                </div>
                <div className="publisher-details">
                  <div className="publisher-name">{task.publisher?.name || '匿名用户'}</div>
                  <div className="publisher-reputation">
                    信誉值: {task.publisher?.reputation_score || 5.0}
                  </div>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="task-actions">
              {canApply() ? (
                <button 
                  className="btn btn-primary btn-large"
                  onClick={() => setShowApplicationForm(true)}
                >
                  申请任务
                </button>
              ) : (
                <div className="action-disabled">
                  {!isAuthenticated ? '请先登录' :
                   task.publisher_id === user?.user_id ? '这是您发布的任务' :
                   applications.some(app => app.hunter_id === user?.user_id) ? '您已申请此任务' :
                   '任务不可申请'}
                </div>
              )}
              
              <button 
                className="btn btn-secondary"
                onClick={() => navigate('/tasks')}
              >
                返回任务大厅
              </button>
            </div>

            {/* 申请表单 */}
            {showApplicationForm && (
              <div className="application-form">
                <h3>申请任务</h3>
                <form onSubmit={handleApplicationSubmit}>
                  <div className="form-group">
                    <label>申请说明</label>
                    <textarea
                      value={applicationData.message}
                      onChange={(e) => setApplicationData({
                        ...applicationData,
                        message: e.target.value
                      })}
                      placeholder="请说明您的能力和完成任务的计划..."
                      rows={4}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>期望报酬 (可选)</label>
                    <input
                      type="number"
                      value={applicationData.proposedReward}
                      onChange={(e) => setApplicationData({
                        ...applicationData,
                        proposedReward: e.target.value
                      })}
                      placeholder="如果与发布者价格不同，请填写"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>预计完成时间</label>
                    <input
                      type="date"
                      value={applicationData.estimatedCompletionDate}
                      onChange={(e) => setApplicationData({
                        ...applicationData,
                        estimatedCompletionDate: e.target.value
                      })}
                      required
                    />
                  </div>
                  
                  <div className="form-actions">
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={applying}
                    >
                      {applying ? '提交中...' : '提交申请'}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => setShowApplicationForm(false)}
                    >
                      取消
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPage;
