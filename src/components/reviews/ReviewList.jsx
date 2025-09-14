import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import './ReviewList.css';

const ReviewList = ({ reviews, loading = false, showFilters = true }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const getRatingStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const getRatingText = (rating) => {
    const texts = {
      1: '很差',
      2: '较差',
      3: '一般',
      4: '良好',
      5: '优秀'
    };
    return texts[rating] || '未知';
  };

  const getReviewTypeText = (type) => {
    const texts = {
      publisher_to_hunter: '发布者评价',
      hunter_to_publisher: '猎人评价',
      mutual: '相互评价'
    };
    return texts[type] || type;
  };

  const filteredAndSortedReviews = reviews
    .filter(review => {
      if (filter === 'all') return true;
      if (filter === 'positive') return review.rating >= 4;
      if (filter === 'negative') return review.rating <= 2;
      if (filter === 'neutral') return review.rating === 3;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

  if (loading) {
    return (
      <div className="review-list-loading">
        <div className="loading-spinner"></div>
        <p>加载评价中...</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="review-list-empty">
        <div className="empty-icon">⭐</div>
        <h3>暂无评价</h3>
        <p>还没有用户对此任务进行评价</p>
      </div>
    );
  }

  return (
    <div className="review-list">
      {showFilters && (
        <div className="review-filters">
          <div className="filter-group">
            <label>筛选：</label>
            <div className="filter-buttons">
              <button 
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                全部 ({reviews.length})
              </button>
              <button 
                className={`filter-btn ${filter === 'positive' ? 'active' : ''}`}
                onClick={() => setFilter('positive')}
              >
                好评 ({reviews.filter(r => r.rating >= 4).length})
              </button>
              <button 
                className={`filter-btn ${filter === 'neutral' ? 'active' : ''}`}
                onClick={() => setFilter('neutral')}
              >
                中评 ({reviews.filter(r => r.rating === 3).length})
              </button>
              <button 
                className={`filter-btn ${filter === 'negative' ? 'active' : ''}`}
                onClick={() => setFilter('negative')}
              >
                差评 ({reviews.filter(r => r.rating <= 2).length})
              </button>
            </div>
          </div>

          <div className="sort-group">
            <label>排序：</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="newest">最新</option>
              <option value="oldest">最早</option>
              <option value="highest">评分最高</option>
              <option value="lowest">评分最低</option>
            </select>
          </div>
        </div>
      )}

      <div className="review-items">
        {filteredAndSortedReviews.map(review => (
          <div key={review.review_id} className="review-item">
            <div className="review-header">
              <div className="reviewer-info">
                <div className="reviewer-avatar">
                  {review.is_anonymous ? '👤' : (review.reviewer?.name?.charAt(0) || 'U')}
                </div>
                <div className="reviewer-details">
                  <div className="reviewer-name">
                    {review.is_anonymous ? '匿名用户' : (review.reviewer?.name || '未知用户')}
                  </div>
                  <div className="review-meta">
                    <span className="review-type">{getReviewTypeText(review.review_type)}</span>
                    <span className="review-time">
                      {formatDistanceToNow(new Date(review.created_at), { 
                        addSuffix: true, 
                        locale: zhCN 
                      })}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="review-rating">
                <div className="rating-stars">
                  {getRatingStars(review.rating)}
                </div>
                <div className="rating-text">
                  {getRatingText(review.rating)}
                </div>
              </div>
            </div>

            {review.comment && (
              <div className="review-comment">
                {review.comment}
              </div>
            )}

            {/* 详细评分 */}
            {(review.quality_rating || review.communication_rating || 
              review.timeliness_rating || review.professionalism_rating) && (
              <div className="detailed-ratings">
                <h5>详细评分</h5>
                <div className="rating-details">
                  {review.quality_rating && (
                    <div className="rating-detail">
                      <span className="rating-label">工作质量</span>
                      <span className="rating-value">{getRatingStars(review.quality_rating)}</span>
                    </div>
                  )}
                  {review.communication_rating && (
                    <div className="rating-detail">
                      <span className="rating-label">沟通能力</span>
                      <span className="rating-value">{getRatingStars(review.communication_rating)}</span>
                    </div>
                  )}
                  {review.timeliness_rating && (
                    <div className="rating-detail">
                      <span className="rating-label">准时性</span>
                      <span className="rating-value">{getRatingStars(review.timeliness_rating)}</span>
                    </div>
                  )}
                  {review.professionalism_rating && (
                    <div className="rating-detail">
                      <span className="rating-label">专业程度</span>
                      <span className="rating-value">{getRatingStars(review.professionalism_rating)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 评价回复 */}
            {review.replies && review.replies.length > 0 && (
              <div className="review-replies">
                {review.replies.map(reply => (
                  <div key={reply.reply_id} className="review-reply">
                    <div className="reply-header">
                      <span className="reply-author">{reply.user?.name || '未知用户'}</span>
                      <span className="reply-time">
                        {formatDistanceToNow(new Date(reply.created_at), { 
                          addSuffix: true, 
                          locale: zhCN 
                        })}
                      </span>
                    </div>
                    <div className="reply-content">
                      {reply.reply_text}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="review-actions">
              <button className="action-btn">
                👍 有用 ({review.helpful_count || 0})
              </button>
              <button className="action-btn">
                💬 回复
              </button>
              <button className="action-btn">
                🚨 举报
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredAndSortedReviews.length === 0 && filter !== 'all' && (
        <div className="no-reviews">
          <p>没有找到符合条件的评价</p>
        </div>
      )}
    </div>
  );
};

export default ReviewList;
