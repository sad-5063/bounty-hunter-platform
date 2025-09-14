import React from 'react';
import './TaskCard.css';

const TaskCard = ({ task, onAccept, onViewDetails }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const formatCurrency = (amount) => {
    return `¥${amount.toFixed(2)}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'in_progress': return '#3b82f6';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return '待接单';
      case 'in_progress': return '进行中';
      case 'completed': return '已完成';
      case 'cancelled': return '已取消';
      default: return '未知';
    }
  };

  return (
    <div className="task-card">
      <div className="task-header">
        <h3 className="task-title">{task.title}</h3>
        <span 
          className="task-status"
          style={{ backgroundColor: getStatusColor(task.status) }}
        >
          {getStatusText(task.status)}
        </span>
      </div>
      
      <div className="task-content">
        <p className="task-description">{task.description}</p>
        
        <div className="task-meta">
          <div className="task-info">
            <span className="task-category">📁 {task.category}</span>
            <span className="task-location">📍 {task.location || '不限地区'}</span>
          </div>
          
          <div className="task-details">
            <div className="task-reward">
              <span className="reward-label">赏金：</span>
              <span className="reward-amount">{formatCurrency(task.reward)}</span>
            </div>
            
            <div className="task-deadline">
              <span className="deadline-label">截止：</span>
              <span className="deadline-date">{formatDate(task.deadline)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="task-actions">
        <button 
          className="btn-secondary"
          onClick={() => onViewDetails(task.task_id)}
        >
          查看详情
        </button>
        
        {task.status === 'pending' && (
          <button 
            className="btn-primary"
            onClick={() => onAccept(task.task_id)}
          >
            接受任务
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
