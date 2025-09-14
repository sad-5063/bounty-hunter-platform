import React from 'react';
import './ReputationCard.css';

const ReputationCard = ({ reputation, showDetails = true }) => {
  const getLevelColor = (level) => {
    const colors = {
      newbie: '#6b7280',
      bronze: '#cd7f32',
      silver: '#c0c0c0',
      gold: '#ffd700',
      platinum: '#e5e4e2',
      diamond: '#b9f2ff'
    };
    return colors[level] || '#6b7280';
  };

  const getLevelText = (level) => {
    const texts = {
      newbie: '新手',
      bronze: '青铜',
      silver: '白银',
      gold: '黄金',
      platinum: '白金',
      diamond: '钻石'
    };
    return texts[level] || '未知';
  };

  const getLevelIcon = (level) => {
    const icons = {
      newbie: '🆕',
      bronze: '🥉',
      silver: '🥈',
      gold: '🥇',
      platinum: '💎',
      diamond: '💠'
    };
    return icons[level] || '⭐';
  };

  const getScoreColor = (score) => {
    if (score >= 8) return '#10b981'; // 绿色
    if (score >= 6) return '#f59e0b'; // 橙色
    if (score >= 4) return '#ef4444'; // 红色
    return '#6b7280'; // 灰色
  };

  const getScoreText = (score) => {
    if (score >= 8) return '优秀';
    if (score >= 6) return '良好';
    if (score >= 4) return '一般';
    return '较差';
  };

  const calculateProgress = (score) => {
    return Math.min((score / 10) * 100, 100);
  };

  return (
    <div className="reputation-card">
      <div className="reputation-header">
        <div className="reputation-level">
          <div 
            className="level-badge"
            style={{ backgroundColor: getLevelColor(reputation.reputation_level) }}
          >
            <span className="level-icon">{getLevelIcon(reputation.reputation_level)}</span>
            <span className="level-text">{getLevelText(reputation.reputation_level)}</span>
          </div>
        </div>
        
        <div className="reputation-score">
          <div 
            className="score-value"
            style={{ color: getScoreColor(reputation.reputation_score) }}
          >
            {reputation.reputation_score.toFixed(1)}
          </div>
          <div className="score-label">信誉值</div>
          <div className="score-status">{getScoreText(reputation.reputation_score)}</div>
        </div>
      </div>

      <div className="reputation-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ 
              width: `${calculateProgress(reputation.reputation_score)}%`,
              backgroundColor: getScoreColor(reputation.reputation_score)
            }}
          ></div>
        </div>
        <div className="progress-text">
          0.0 - 10.0
        </div>
      </div>

      {showDetails && (
        <div className="reputation-details">
          <div className="review-stats">
            <div className="stat-item">
              <div className="stat-number">{reputation.total_reviews}</div>
              <div className="stat-label">总评价</div>
            </div>
            <div className="stat-item positive">
              <div className="stat-number">{reputation.positive_reviews}</div>
              <div className="stat-label">好评</div>
            </div>
            <div className="stat-item neutral">
              <div className="stat-number">{reputation.neutral_reviews}</div>
              <div className="stat-label">中评</div>
            </div>
            <div className="stat-item negative">
              <div className="stat-number">{reputation.negative_reviews}</div>
              <div className="stat-label">差评</div>
            </div>
          </div>

          {/* 详细评分 */}
          <div className="detailed-scores">
            <h4>详细评分</h4>
            <div className="score-items">
              {reputation.avg_quality_rating > 0 && (
                <div className="score-item">
                  <span className="score-label">工作质量</span>
                  <div className="score-bar">
                    <div 
                      className="score-fill"
                      style={{ width: `${(reputation.avg_quality_rating / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="score-value">{reputation.avg_quality_rating.toFixed(1)}</span>
                </div>
              )}
              {reputation.avg_communication_rating > 0 && (
                <div className="score-item">
                  <span className="score-label">沟通能力</span>
                  <div className="score-bar">
                    <div 
                      className="score-fill"
                      style={{ width: `${(reputation.avg_communication_rating / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="score-value">{reputation.avg_communication_rating.toFixed(1)}</span>
                </div>
              )}
              {reputation.avg_timeliness_rating > 0 && (
                <div className="score-item">
                  <span className="score-label">准时性</span>
                  <div className="score-bar">
                    <div 
                      className="score-fill"
                      style={{ width: `${(reputation.avg_timeliness_rating / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="score-value">{reputation.avg_timeliness_rating.toFixed(1)}</span>
                </div>
              )}
              {reputation.avg_professionalism_rating > 0 && (
                <div className="score-item">
                  <span className="score-label">专业程度</span>
                  <div className="score-bar">
                    <div 
                      className="score-fill"
                      style={{ width: `${(reputation.avg_professionalism_rating / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="score-value">{reputation.avg_professionalism_rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>

          {/* 信誉徽章 */}
          {reputation.badges && reputation.badges.length > 0 && (
            <div className="reputation-badges">
              <h4>获得徽章</h4>
              <div className="badges-list">
                {reputation.badges.map((badge, index) => (
                  <div key={index} className="badge-item">
                    <span className="badge-icon">{badge.icon}</span>
                    <span className="badge-name">{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="reputation-footer">
        <div className="verification-status">
          {reputation.is_verified ? (
            <span className="verified">✅ 已认证</span>
          ) : (
            <span className="unverified">⏳ 待认证</span>
          )}
        </div>
        <div className="last-updated">
          最后更新：{new Date(reputation.last_calculated_at).toLocaleDateString('zh-CN')}
        </div>
      </div>
    </div>
  );
};

export default ReputationCard;
