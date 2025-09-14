import React, { useState } from 'react';
import './ReviewForm.css';

const ReviewForm = ({ taskId, targetUser, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    rating: 5,
    comment: ''
  });
  const [loading, setLoading] = useState(false);

  const handleRatingChange = (rating) => {
    setFormData({ ...formData, rating });
  };

  const handleCommentChange = (e) => {
    setFormData({ ...formData, comment: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit({
        taskId,
        rating: formData.rating,
        comment: formData.comment
      });
    } catch (error) {
      console.error('提交评价失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starNumber = index + 1;
      return (
        <button
          key={starNumber}
          type="button"
          className={`star ${starNumber <= formData.rating ? 'active' : ''}`}
          onClick={() => handleRatingChange(starNumber)}
          disabled={loading}
        >
          ⭐
        </button>
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
      default: return '请评分';
    }
  };

  return (
    <div className="review-form-overlay">
      <div className="review-form">
        <div className="review-header">
          <h3>任务评价</h3>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>

        <div className="review-target">
          <div className="target-info">
            <div className="target-avatar">
              {targetUser.avatar_url ? (
                <img src={targetUser.avatar_url} alt={targetUser.name} />
              ) : (
                <div className="avatar-placeholder">
                  {targetUser.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="target-details">
              <h4>{targetUser.name}</h4>
              <p>请为此次合作进行评价</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="rating-section">
            <label>评分</label>
            <div className="star-rating">
              {renderStars()}
            </div>
            <div className="rating-text">
              {getRatingText(formData.rating)}
            </div>
          </div>

          <div className="comment-section">
            <label htmlFor="comment">评价内容（可选）</label>
            <textarea
              id="comment"
              value={formData.comment}
              onChange={handleCommentChange}
              placeholder="请分享您的合作体验..."
              rows={4}
              maxLength={500}
              disabled={loading}
            />
            <div className="char-count">
              {formData.comment.length}/500
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-cancel"
              onClick={onCancel}
              disabled={loading}
            >
              取消
            </button>
            <button 
              type="submit" 
              className="btn-submit"
              disabled={loading || formData.rating === 0}
            >
              {loading ? '提交中...' : '提交评价'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;
