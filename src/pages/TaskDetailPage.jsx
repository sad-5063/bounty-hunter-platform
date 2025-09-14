import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './TaskDetailPage.css';

const TaskDetailPage = () => {
  const { taskId } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟获取任务详情
    const mockTask = {
      id: parseInt(taskId),
      title: '网站设计任务',
      description: '需要一个现代化的企业官网设计，要求响应式布局，支持多语言，包含产品展示、公司介绍、联系我们等页面。',
      category: '设计',
      reward: 2000,
      deadline: '2025-01-15',
      status: 'open',
      publisher: '张三',
      publisherEmail: 'zhangsan@example.com',
      createdAt: '2025-01-10',
      requirements: [
        '熟悉HTML5、CSS3、JavaScript',
        '有响应式设计经验',
        '能够提供设计稿和代码',
        '按时交付，质量保证'
      ]
    };
    
    setTimeout(() => {
      setTask(mockTask);
      setLoading(false);
    }, 1000);
  }, [taskId]);

  if (loading) {
    return (
      <div className="task-detail-page">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="task-detail-page">
        <div className="error">任务不存在</div>
      </div>
    );
  }

  return (
    <div className="task-detail-page">
      <div className="task-detail-container">
        <div className="task-header">
          <h1>{task.title}</h1>
          <div className="task-status">
            <span className={`status-badge ${task.status}`}>
              {task.status === 'open' ? '开放中' : '已关闭'}
            </span>
          </div>
        </div>
        
        <div className="task-content">
          <div className="task-main">
            <div className="task-section">
              <h3>任务描述</h3>
              <p>{task.description}</p>
            </div>
            
            <div className="task-section">
              <h3>任务要求</h3>
              <ul>
                {task.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
            
            <div className="task-section">
              <h3>任务信息</h3>
              <div className="task-info">
                <div className="info-item">
                  <strong>分类:</strong> {task.category}
                </div>
                <div className="info-item">
                  <strong>发布者:</strong> {task.publisher}
                </div>
                <div className="info-item">
                  <strong>发布时间:</strong> {task.createdAt}
                </div>
                <div className="info-item">
                  <strong>截止时间:</strong> {task.deadline}
                </div>
              </div>
            </div>
          </div>
          
          <div className="task-sidebar">
            <div className="reward-card">
              <h3>任务赏金</h3>
              <div className="reward-amount">¥{task.reward}</div>
              <button className="btn btn-primary">接受任务</button>
            </div>
            
            <div className="contact-card">
              <h3>联系发布者</h3>
              <p>邮箱: {task.publisherEmail}</p>
              <button className="btn btn-secondary">发送消息</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPage;