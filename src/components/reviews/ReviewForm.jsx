import React, { useState } from 'react';
import './ReviewForm.css';

const ReviewForm = ({ task, targetUser, reviewType, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
    quality_rating: 5,
    communication_rating: 5,
    timeliness_rating: 5,
    professionalism_rating: 5,
    is_anonymous: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleRatingChange = (rating, field = 'rating') => {
    setFormData({
      ...formData,
      [field]: rating
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSubmit({
        task_id: task.task_id,
        target_id: targetUser.user_id,
        review_type: reviewType,
        ...formData
      });
    } catch (error) {
      setError(error.message || '提交评价失败');
    } finally {
      setLoading(false);
    }
  };

  const getReviewTitle = () => {
    if (reviewType === 'publisher_to_hunter') {
      return `评价猎人：${targetUser.name}`;
    } else if (reviewType === 'hunter_to_publisher') {
      return `评价发布者：${targetUser.name}`;
    }
    return '任务评价';
  };

  const getRatingLabels = () => {
    return {
      1: '很差',
      2: '较差',
      3: '一般',
      4: '良好',
      5: '优秀'
    };
  };

  const StarRating = ({ rating, onRatingChange, field = 'rating', label }) => (
    <div className="rating-group">
      <label className="rating-label">{label}</label>
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`star ${star <= rating ? 'active' : ''}`}
            onClick={() => onRatingChange(star, field)}
            disabled={loading}
          >
            ⭐
          </button>
        ))}
        <span className="rating-text">{getRatingLabels()[rating]}</span>
      </div>
    </div>
  );

  return (
    <div className="review-form-overlay">
      <div className="review-form">
        <div className="review-form-header">
          <h3>{getReviewTitle()}</h3>
          <p>任务：{task.title}</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="review-form-content">
            {/* 总体评分 */}
            <div className="rating-section">
              <StarRating
                rating={formData.rating}
                onRatingChange={handleRatingChange}
                label="总体评分"
              />
            </div>

            {/* 详细评分 */}
            <div className="detailed-ratings">
              <h4>详细评分</h4>
              <div className="rating-grid">
                <StarRating
                  rating={formData.quality_rating}
                  onRatingChange={handleRatingChange}
                  field="quality_rating"
                  label="工作质量"
                />
                <StarRating
                  rating={formData.communication_rating}
                  onRatingChange={handleRatingChange}
                  field="communication_rating"
                  label="沟通能力"
                />
                <StarRating
                  rating={formData.timeliness_rating}
                  onRatingChange={handleRatingChange}
                  field="timeliness_rating"
                  label="准时性"
                />
                <StarRating
                  rating={formData.professionalism_rating}
                  onRatingChange={handleRatingChange}
                  field="professionalism_rating"
                  label="专业程度"
                />
              </div>
            </div>

            {/* 评价内容 */}
            <div className="comment-section">
              <label htmlFor="comment">评价内容</label>
              <textarea
                id="comment"
                name="comment"
                value={formData.comment}
                onChange={handleInputChange}
                placeholder="请详细描述您的工作体验，包括优点和需要改进的地方..."
                rows={4}
                disabled={loading}
              />
              <div className="comment-hint">
                请提供具体、客观的评价，这将帮助其他用户做出更好的选择
              </div>
            </div>

            {/* 匿名评价 */}
            <div className="anonymous-section">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_anonymous"
                  checked={formData.is_anonymous}
                  onChange={handleInputChange}
                  disabled={loading}
                />
                <span className="checkmark"></span>
                匿名评价
              </label>
              <div className="anonymous-hint">
                选择匿名评价后，您的姓名将不会显示在评价中
              </div>
            </div>
          </div>

          <div className="review-form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              取消
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
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
