import React from 'react';
import './ReputationCard.css';

const ReputationCard = ({ user }) => {
  const getReputationLevel = (score) => {
    if (score >= 90) return { level: '专家', color: '#059669', icon: '🏆' };
    if (score >= 80) return { level: '资深', color: '#3b82f6', icon: '⭐' };
    if (score >= 70) return { level: '熟练', color: '#8b5cf6', icon: '🎯' };
    if (score >= 60) return { level: '合格', color: '#f59e0b', icon: '✅' };
    return { level: '新手', color: '#6b7280', icon: '🌱' };
  };

  const getReputationColor = (score) => {
    if (score >= 90) return '#059669';
    if (score >= 80) return '#3b82f6';
    if (score >= 70) return '#8b5cf6';
    if (score >= 60) return '#f59e0b';
    return '#6b7280';
  };

  const reputationInfo = getReputationLevel(user.reputation_score);
  const reputationColor = getReputationColor(user.reputation_score);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  return (
    <div className="reputation-card">
      <div className="reputation-header">
        <div className="reputation-icon">
          {reputationInfo.icon}
        </div>
        <div className="reputation-info">
          <h3>信誉评分</h3>
          <div className="reputation-level" style={{ color: reputationColor }}>
            {reputationInfo.level}
          </div>
        </div>
      </div>

      <div className="reputation-score">
        <div className="score-circle">
          <div 
            className="score-progress"
            style={{ 
              background: `conic-gradient(${reputationColor} ${user.reputation_score * 3.6}deg, #e5e7eb 0deg)`
            }}
          >
            <div className="score-inner">
              <span className="score-number">{user.reputation_score}</span>
              <span className="score-label">分</span>
            </div>
          </div>
        </div>
      </div>

      <div className="reputation-stats">
        <div className="stat-item">
          <span className="stat-label">完成任务</span>
          <span className="stat-value">{user.completed_tasks || 0}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">平均评分</span>
          <span className="stat-value">{user.average_rating?.toFixed(1) || '0.0'}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">注册时间</span>
          <span className="stat-value">{formatDate(user.created_at)}</span>
        </div>
      </div>

      <div className="reputation-badges">
        <div className="badge-section">
          <h4>成就徽章</h4>
          <div className="badges">
            {user.completed_tasks >= 10 && (
              <div className="badge" title="完成10个任务">
                🎯
              </div>
            )}
            {user.completed_tasks >= 50 && (
              <div className="badge" title="完成50个任务">
                🏆
              </div>
            )}
            {user.average_rating >= 4.5 && (
              <div className="badge" title="高评分用户">
                ⭐
              </div>
            )}
            {user.reputation_score >= 90 && (
              <div className="badge" title="信誉专家">
                👑
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="reputation-description">
        <p>
          {user.reputation_score >= 90 ? '信誉卓越，值得信赖的专业用户' :
           user.reputation_score >= 80 ? '信誉良好，经验丰富的资深用户' :
           user.reputation_score >= 70 ? '信誉良好，技能熟练的用户' :
           user.reputation_score >= 60 ? '信誉合格，基础技能用户' :
           '新注册用户，正在建立信誉'}
        </p>
      </div>
    </div>
  );
};

export default ReputationCard;
