// 评价控制器 - 后端API实现示例
const { v4: uuidv4 } = require('uuid');
const TaskReview = require('../models/TaskReview');
const ReviewReply = require('../models/ReviewReply');
const UserReputation = require('../models/UserReputation');
const ReputationBadge = require('../models/ReputationBadge');
const ReviewReport = require('../models/ReviewReport');
const ReputationRule = require('../models/ReputationRule');

class ReviewController {
  // 提交任务评价
  async submitReview(req, res) {
    try {
      const userId = req.user.userId;
      const {
        task_id,
        target_id,
        review_type,
        rating,
        comment,
        quality_rating,
        communication_rating,
        timeliness_rating,
        professionalism_rating,
        is_anonymous
      } = req.body;

      // 验证输入
      if (!task_id || !target_id || !review_type || !rating) {
        return res.status(400).json({
          success: false,
          message: '任务ID、目标用户、评价类型和评分是必填项'
        });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: '评分必须在1-5之间'
        });
      }

      // 检查是否已经评价过
      const existingReview = await TaskReview.findOne({
        task_id,
        reviewer_id: userId,
        review_type
      });

      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: '您已经对此任务进行过评价'
        });
      }

      // 创建评价
      const review = new TaskReview({
        review_id: uuidv4(),
        task_id,
        reviewer_id: userId,
        target_id,
        rating: parseInt(rating),
        comment: comment || '',
        quality_rating: quality_rating ? parseInt(quality_rating) : null,
        communication_rating: communication_rating ? parseInt(communication_rating) : null,
        timeliness_rating: timeliness_rating ? parseInt(timeliness_rating) : null,
        professionalism_rating: professionalism_rating ? parseInt(professionalism_rating) : null,
        review_type,
        is_anonymous: is_anonymous || false,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      });

      await review.save();

      // 更新用户信誉
      await this.updateUserReputation(target_id);

      res.status(201).json({
        success: true,
        message: '评价提交成功',
        review: {
          review_id: review.review_id,
          rating: review.rating,
          comment: review.comment,
          review_type: review.review_type,
          created_at: review.created_at
        }
      });

    } catch (error) {
      console.error('提交评价错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 获取任务评价列表
  async getTaskReviews(req, res) {
    try {
      const { taskId } = req.params;
      const {
        page = 1,
        limit = 20,
        filter = 'all',
        sortBy = 'newest'
      } = req.query;

      // 构建查询条件
      const query = { task_id: taskId, status: 'active' };
      
      if (filter !== 'all') {
        switch (filter) {
          case 'positive':
            query.rating = { $gte: 4 };
            break;
          case 'negative':
            query.rating = { $lte: 2 };
            break;
          case 'neutral':
            query.rating = 3;
            break;
        }
      }

      // 排序
      let sort = {};
      switch (sortBy) {
        case 'newest':
          sort = { created_at: -1 };
          break;
        case 'oldest':
          sort = { created_at: 1 };
          break;
        case 'highest':
          sort = { rating: -1 };
          break;
        case 'lowest':
          sort = { rating: 1 };
          break;
        default:
          sort = { created_at: -1 };
      }

      // 分页
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [reviews, total] = await Promise.all([
        TaskReview.find(query)
          .populate('reviewer_id', 'name avatar_url')
          .populate('target_id', 'name avatar_url')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit)),
        TaskReview.countDocuments(query)
      ]);

      res.json({
        success: true,
        reviews,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      });

    } catch (error) {
      console.error('获取任务评价错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 获取用户信誉信息
  async getUserReputation(req, res) {
    try {
      const { userId } = req.params;

      let reputation = await UserReputation.findOne({ user_id: userId });
      
      if (!reputation) {
        // 如果信誉记录不存在，创建一个新的
        reputation = new UserReputation({
          reputation_id: uuidv4(),
          user_id: userId,
          reputation_score: 5.00,
          reputation_level: 'newbie',
          total_reviews: 0,
          positive_reviews: 0,
          negative_reviews: 0,
          neutral_reviews: 0,
          avg_quality_rating: 0.00,
          avg_communication_rating: 0.00,
          avg_timeliness_rating: 0.00,
          avg_professionalism_rating: 0.00,
          badges: [],
          reputation_history: [],
          is_verified: false,
          last_calculated_at: new Date(),
          created_at: new Date(),
          updated_at: new Date()
        });
        await reputation.save();
      }

      res.json({
        success: true,
        reputation
      });

    } catch (error) {
      console.error('获取用户信誉错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 更新用户信誉
  async updateUserReputation(userId) {
    try {
      // 获取用户的所有评价
      const reviews = await TaskReview.find({
        target_id: userId,
        status: 'active'
      });

      if (reviews.length === 0) {
        return;
      }

      // 计算统计数据
      const totalReviews = reviews.length;
      const positiveReviews = reviews.filter(r => r.rating >= 4).length;
      const negativeReviews = reviews.filter(r => r.rating <= 2).length;
      const neutralReviews = reviews.filter(r => r.rating === 3).length;

      // 计算平均评分
      const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
      
      // 计算各维度平均分
      const qualityReviews = reviews.filter(r => r.quality_rating);
      const communicationReviews = reviews.filter(r => r.communication_rating);
      const timelinessReviews = reviews.filter(r => r.timeliness_rating);
      const professionalismReviews = reviews.filter(r => r.professionalism_rating);

      const avgQualityRating = qualityReviews.length > 0 
        ? qualityReviews.reduce((sum, r) => sum + r.quality_rating, 0) / qualityReviews.length 
        : 0;
      const avgCommunicationRating = communicationReviews.length > 0 
        ? communicationReviews.reduce((sum, r) => sum + r.communication_rating, 0) / communicationReviews.length 
        : 0;
      const avgTimelinessRating = timelinessReviews.length > 0 
        ? timelinessReviews.reduce((sum, r) => sum + r.timeliness_rating, 0) / timelinessReviews.length 
        : 0;
      const avgProfessionalismRating = professionalismReviews.length > 0 
        ? professionalismReviews.reduce((sum, r) => sum + r.professionalism_rating, 0) / professionalismReviews.length 
        : 0;

      // 计算信誉值（基于平均评分，范围0-10）
      const reputationScore = Math.min(Math.max(avgRating * 2, 0), 10);

      // 确定信誉等级
      let reputationLevel = 'newbie';
      if (reputationScore >= 9) reputationLevel = 'diamond';
      else if (reputationScore >= 8) reputationLevel = 'platinum';
      else if (reputationScore >= 7) reputationLevel = 'gold';
      else if (reputationScore >= 6) reputationLevel = 'silver';
      else if (reputationScore >= 5) reputationLevel = 'bronze';

      // 更新或创建信誉记录
      await UserReputation.findOneAndUpdate(
        { user_id: userId },
        {
          reputation_score: reputationScore,
          reputation_level: reputationLevel,
          total_reviews: totalReviews,
          positive_reviews: positiveReviews,
          negative_reviews: negativeReviews,
          neutral_reviews: neutralReviews,
          avg_quality_rating: avgQualityRating,
          avg_communication_rating: avgCommunicationRating,
          avg_timeliness_rating: avgTimelinessRating,
          avg_professionalism_rating: avgProfessionalismRating,
          last_calculated_at: new Date(),
          updated_at: new Date()
        },
        { upsert: true, new: true }
      );

      // 检查并授予徽章
      await this.checkAndAwardBadges(userId);

    } catch (error) {
      console.error('更新用户信誉错误:', error);
    }
  }

  // 检查并授予徽章
  async checkAndAwardBadges(userId) {
    try {
      const reputation = await UserReputation.findOne({ user_id: userId });
      if (!reputation) return;

      const badges = await ReputationBadge.find({ is_active: true });
      const userBadges = reputation.badges || [];

      for (const badge of badges) {
        // 检查是否已经拥有此徽章
        if (userBadges.some(b => b.badge_id === badge.badge_id)) {
          continue;
        }

        let shouldAward = false;

        switch (badge.condition_type) {
          case 'rating_threshold':
            if (badge.badge_category === 'quality' && reputation.avg_quality_rating >= badge.condition_value) {
              shouldAward = true;
            } else if (badge.badge_category === 'communication' && reputation.avg_communication_rating >= badge.condition_value) {
              shouldAward = true;
            } else if (badge.badge_category === 'timeliness' && reputation.avg_timeliness_rating >= badge.condition_value) {
              shouldAward = true;
            } else if (badge.badge_category === 'professionalism' && reputation.avg_professionalism_rating >= badge.condition_value) {
              shouldAward = true;
            }
            break;
          case 'review_count':
            if (reputation.total_reviews >= badge.condition_value) {
              shouldAward = true;
            }
            break;
          case 'task_count':
            // 这里需要从任务表获取用户完成的任务数
            // 暂时跳过
            break;
        }

        if (shouldAward) {
          userBadges.push({
            badge_id: badge.badge_id,
            badge_name: badge.badge_name,
            badge_icon: badge.badge_icon,
            badge_color: badge.badge_color,
            awarded_at: new Date()
          });
        }
      }

      // 更新用户徽章
      if (userBadges.length !== reputation.badges.length) {
        await UserReputation.findOneAndUpdate(
          { user_id: userId },
          { badges: userBadges, updated_at: new Date() }
        );
      }

    } catch (error) {
      console.error('检查徽章错误:', error);
    }
  }

  // 检查是否可以评价
  async canReview(req, res) {
    try {
      const userId = req.user.userId;
      const { task_id, review_type } = req.body;

      // 检查是否已经评价过
      const existingReview = await TaskReview.findOne({
        task_id,
        reviewer_id: userId,
        review_type
      });

      res.json({
        success: true,
        can_review: !existingReview,
        existing_review: existingReview
      });

    } catch (error) {
      console.error('检查评价权限错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 获取信誉徽章列表
  async getReputationBadges(req, res) {
    try {
      const badges = await ReputationBadge.find({ is_active: true })
        .sort({ sort_order: 1 });

      res.json({
        success: true,
        badges
      });

    } catch (error) {
      console.error('获取徽章列表错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }
}

module.exports = new ReviewController();
