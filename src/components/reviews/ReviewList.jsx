import React from 'react';
import './ReviewList.css';

const ReviewList = ({ reviews, user }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => {
      const starNumber = index + 1;
      return (
        <span 
          key={starNumber}
          className={`star ${starNumber <= rating ? 'active' : ''}`}
        >
          ⭐
        </span>
      );
    });
  };

  const getRatingText = (rating) => {
    switch (rating) {
      case 1: return '很差';
      case 2: return '较差';
      case 3: return '一般';
      case 4: return '良好';
      case 5: return '优秀';
      default: return '未评分';
    }
  };

  if (reviews.length === 0) {
    return (
      <div className="review-list">
        <div className="review-header">
          <h3>用户评价</h3>
          <span className="review-count">暂无评价</span>
        </div>
        <div className="empty-reviews">
          <div className="empty-icon">💬</div>
          <p>还没有人评价过这个用户</p>
        </div>
      </div>
    );
  }

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return (
    <div className="review-list">
      <div className="review-header">
        <h3>用户评价</h3>
        <div className="review-summary">
          <div className="average-rating">
            <span className="rating-number">{averageRating.toFixed(1)}</span>
            <div className="rating-stars">
              {renderStars(Math.round(averageRating))}
            </div>
            <span className="rating-text">{getRatingText(Math.round(averageRating))}</span>
          </div>
          <span className="review-count">({reviews.length} 条评价)</span>
        </div>
      </div>

      <div className="reviews-container">
        {reviews.map(review => (
          <div key={review.review_id} className="review-item">
            <div className="reviewer-info">
              <div className="reviewer-avatar">
                {review.reviewer.avatar_url ? (
                  <img src={review.reviewer.avatar_url} alt={review.reviewer.name} />
                ) : (
                  <div className="avatar-placeholder">
                    {review.reviewer.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="reviewer-details">
                <h4>{review.reviewer.name}</h4>
                <span className="review-date">{formatDate(review.created_at)}</span>
              </div>
            </div>

            <div className="review-content">
              <div className="review-rating">
                <div className="rating-stars">
                  {renderStars(review.rating)}
                </div>
                <span className="rating-text">{getRatingText(review.rating)}</span>
              </div>
              
              {review.comment && (
                <div className="review-comment">
                  <p>{review.comment}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;
