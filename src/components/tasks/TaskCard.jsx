import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import './TaskCard.css';

const TaskCard = ({ task, showActions = true }) => {
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

  const getPriorityColor = (priority) => {
    const priorityColors = {
      low: '#10b981',
      normal: '#6b7280',
      high: '#f59e0b',
      urgent: '#ef4444'
    };
    return priorityColors[priority] || '#6b7280';
  };

  const getPriorityText = (priority) => {
    const priorityTexts = {
      low: '低',
      normal: '普通',
      high: '高',
      urgent: '紧急'
    };
    return priorityTexts[priority] || priority;
  };

  return (
    <div className="task-card">
      <div className="task-header">
        <div className="task-status">
          <span 
            className="status-badge"
            style={{ backgroundColor: getStatusColor(task.status) }}
          >
            {getStatusText(task.status)}
          </span>
          {task.priority !== 'normal' && (
            <span 
              className="priority-badge"
              style={{ backgroundColor: getPriorityColor(task.priority) }}
            >
              {getPriorityText(task.priority)}
            </span>
          )}
        </div>
        <div className="task-reward">
          {formatReward(task.reward, task.currency)}
        </div>
      </div>

      <div className="task-content">
        <Link to={`/tasks/${task.task_id}`} className="task-title">
          {task.title}
        </Link>
        
        <p className="task-description">
          {task.description.length > 150 
            ? `${task.description.substring(0, 150)}...` 
            : task.description
          }
        </p>

        <div className="task-meta">
          <div className="task-category">
            <span className="category-icon">📂</span>
            <span>{task.category}</span>
          </div>
          
          {task.city && (
            <div className="task-location">
              <span className="location-icon">📍</span>
              <span>{task.city}</span>
            </div>
          )}
          
          {task.deadline && (
            <div className="task-deadline">
              <span className="deadline-icon">⏰</span>
              <span>
                {formatDistanceToNow(new Date(task.deadline), { 
                  addSuffix: true, 
                  locale: zhCN 
                })}
              </span>
            </div>
          )}
        </div>

        {task.skills_required && task.skills_required.length > 0 && (
          <div className="task-skills">
            {task.skills_required.slice(0, 3).map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}
              </span>
            ))}
            {task.skills_required.length > 3 && (
              <span className="skill-tag more">
                +{task.skills_required.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="task-stats">
          <div className="stat-item">
            <span className="stat-icon">👁️</span>
            <span>{task.view_count || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">📝</span>
            <span>{task.application_count || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">⏱️</span>
            <span>{task.estimated_hours || 'N/A'}h</span>
          </div>
        </div>
      </div>

      {showActions && (
        <div className="task-actions">
          <Link 
            to={`/tasks/${task.task_id}`} 
            className="btn btn-primary btn-sm"
          >
            查看详情
          </Link>
          {task.status === 'pending' && (
            <button className="btn btn-secondary btn-sm">
              申请任务
            </button>
          )}
        </div>
      )}

      <div className="task-footer">
        <div className="task-publisher">
          <span className="publisher-avatar">
            {task.publisher?.name?.charAt(0) || 'U'}
          </span>
          <span className="publisher-name">
            {task.publisher?.name || '匿名用户'}
          </span>
        </div>
        <div className="task-time">
          {formatDistanceToNow(new Date(task.created_at), { 
            addSuffix: true, 
            locale: zhCN 
          })}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
