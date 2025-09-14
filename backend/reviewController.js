// 评价控制器 - Node.js/Express 后端伪代码
const { Pool } = require('pg');

// 数据库连接
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 创建评价
const createReview = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { taskId, targetUserId, rating, comment } = req.body;

    // 验证输入
    if (!taskId || !targetUserId || !rating) {
      return res.status(400).json({ message: '请填写所有必填字段' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: '评分必须在1-5之间' });
    }

    if (targetUserId === userId) {
      return res.status(400).json({ message: '不能给自己评价' });
    }

    // 开始事务
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 检查任务是否存在且已完成
      const taskResult = await client.query(`
        SELECT * FROM tasks WHERE task_id = $1 AND status = 'completed'
      `, [taskId]);

      if (taskResult.rows.length === 0) {
        return res.status(404).json({ message: '任务不存在或未完成' });
      }

      const task = taskResult.rows[0];

      // 检查用户是否有权限评价
      if (task.publisher_id !== userId && task.hunter_id !== userId) {
        return res.status(403).json({ message: '无权限评价此任务' });
      }

      // 检查目标用户是否参与此任务
      if (task.publisher_id !== targetUserId && task.hunter_id !== targetUserId) {
        return res.status(400).json({ message: '目标用户未参与此任务' });
      }

      // 检查是否已经评价过
      const existingReviewResult = await client.query(`
        SELECT * FROM reviews 
        WHERE task_id = $1 AND reviewer_id = $2 AND target_id = $3
      `, [taskId, userId, targetUserId]);

      if (existingReviewResult.rows.length > 0) {
        return res.status(400).json({ message: '您已经评价过此用户' });
      }

      // 创建评价
      const reviewResult = await client.query(`
        INSERT INTO reviews (task_id, reviewer_id, target_id, rating, comment)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [taskId, userId, targetUserId, rating, comment]);

      const review = reviewResult.rows[0];

      // 更新目标用户的信誉评分
      await updateUserReputation(client, targetUserId);

      await client.query('COMMIT');

      res.status(201).json({
        message: '评价创建成功',
        review
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('创建评价错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 获取用户评价
const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;

    const result = await pool.query(`
      SELECT r.*, 
             u.name as reviewer_name,
             u.avatar_url as reviewer_avatar,
             t.title as task_title
      FROM reviews r
      LEFT JOIN users u ON r.reviewer_id = u.user_id
      LEFT JOIN tasks t ON r.task_id = t.task_id
      WHERE r.target_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, parseInt(limit), offset]);

    // 获取总数
    const countResult = await pool.query(`
      SELECT COUNT(*) FROM reviews WHERE target_id = $1
    `, [userId]);

    const totalCount = parseInt(countResult.rows[0].count);
    const hasMore = offset + result.rows.length < totalCount;

    res.json({
      reviews: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        hasMore
      }
    });

  } catch (error) {
    console.error('获取用户评价错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 获取任务评价
const getTaskReviews = async (req, res) => {
  try {
    const { taskId } = req.params;

    const result = await pool.query(`
      SELECT r.*, 
             u1.name as reviewer_name,
             u1.avatar_url as reviewer_avatar,
             u2.name as target_name,
             u2.avatar_url as target_avatar
      FROM reviews r
      LEFT JOIN users u1 ON r.reviewer_id = u1.user_id
      LEFT JOIN users u2 ON r.target_id = u2.user_id
      WHERE r.task_id = $1
      ORDER BY r.created_at DESC
    `, [taskId]);

    res.json({ reviews: result.rows });

  } catch (error) {
    console.error('获取任务评价错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 更新评价
const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.userId;
    const { rating, comment } = req.body;

    // 检查评价是否存在且用户有权限修改
    const reviewResult = await pool.query(`
      SELECT * FROM reviews WHERE review_id = $1 AND reviewer_id = $2
    `, [reviewId, userId]);

    if (reviewResult.rows.length === 0) {
      return res.status(404).json({ message: '评价不存在或无权限修改' });
    }

    const review = reviewResult.rows[0];

    // 检查是否超过修改时间限制（例如24小时）
    const reviewTime = new Date(review.created_at);
    const now = new Date();
    const hoursDiff = (now - reviewTime) / (1000 * 60 * 60);

    if (hoursDiff > 24) {
      return res.status(400).json({ message: '超过修改时间限制' });
    }

    // 开始事务
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 更新评价
      const updateResult = await client.query(`
        UPDATE reviews 
        SET rating = $1, comment = $2, updated_at = CURRENT_TIMESTAMP
        WHERE review_id = $3
        RETURNING *
      `, [rating, comment, reviewId]);

      // 重新计算目标用户的信誉评分
      await updateUserReputation(client, review.target_id);

      await client.query('COMMIT');

      res.json({
        message: '评价更新成功',
        review: updateResult.rows[0]
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('更新评价错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 删除评价
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.userId;

    // 检查评价是否存在且用户有权限删除
    const reviewResult = await pool.query(`
      SELECT * FROM reviews WHERE review_id = $1 AND reviewer_id = $2
    `, [reviewId, userId]);

    if (reviewResult.rows.length === 0) {
      return res.status(404).json({ message: '评价不存在或无权限删除' });
    }

    const review = reviewResult.rows[0];

    // 开始事务
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 删除评价
      await client.query('DELETE FROM reviews WHERE review_id = $1', [reviewId]);

      // 重新计算目标用户的信誉评分
      await updateUserReputation(client, review.target_id);

      await client.query('COMMIT');

      res.json({ message: '评价删除成功' });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('删除评价错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 获取用户信誉评分
const getUserReputation = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(`
      SELECT 
        u.reputation_score,
        u.created_at,
        COUNT(r.review_id) as review_count,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(t.task_id) as completed_tasks
      FROM users u
      LEFT JOIN reviews r ON u.user_id = r.target_id
      LEFT JOIN tasks t ON u.user_id = t.hunter_id AND t.status = 'completed'
      WHERE u.user_id = $1
      GROUP BY u.user_id, u.reputation_score, u.created_at
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }

    const user = result.rows[0];

    res.json({
      reputation_score: user.reputation_score,
      review_count: parseInt(user.review_count),
      average_rating: parseFloat(user.average_rating),
      completed_tasks: parseInt(user.completed_tasks),
      created_at: user.created_at
    });

  } catch (error) {
    console.error('获取用户信誉评分错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 更新用户信誉评分（内部函数）
const updateUserReputation = async (client, userId) => {
  try {
    // 计算新的信誉评分
    const result = await client.query(`
      SELECT 
        COUNT(*) as review_count,
        COALESCE(AVG(rating), 0) as average_rating,
        COUNT(CASE WHEN rating >= 4 THEN 1 END) as good_reviews,
        COUNT(CASE WHEN rating <= 2 THEN 1 END) as bad_reviews
      FROM reviews 
      WHERE target_id = $1
    `, [userId]);

    const stats = result.rows[0];
    const reviewCount = parseInt(stats.review_count);
    const averageRating = parseFloat(stats.average_rating);
    const goodReviews = parseInt(stats.good_reviews);
    const badReviews = parseInt(stats.bad_reviews);

    // 计算信誉评分（0-100分）
    let reputationScore = 50; // 基础分

    if (reviewCount > 0) {
      // 基于平均评分
      reputationScore = averageRating * 20; // 1-5星转换为20-100分

      // 基于好评率调整
      const goodRate = reviewCount > 0 ? goodReviews / reviewCount : 0;
      const badRate = reviewCount > 0 ? badReviews / reviewCount : 0;

      // 好评率奖励
      if (goodRate >= 0.8) reputationScore += 10;
      else if (goodRate >= 0.6) reputationScore += 5;

      // 差评率惩罚
      if (badRate >= 0.3) reputationScore -= 15;
      else if (badRate >= 0.2) reputationScore -= 10;

      // 评价数量奖励
      if (reviewCount >= 50) reputationScore += 5;
      else if (reviewCount >= 20) reputationScore += 3;
      else if (reviewCount >= 10) reputationScore += 1;
    }

    // 确保分数在0-100范围内
    reputationScore = Math.max(0, Math.min(100, Math.round(reputationScore)));

    // 更新用户信誉评分
    await client.query(`
      UPDATE users 
      SET reputation_score = $1, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $2
    `, [reputationScore, userId]);

  } catch (error) {
    console.error('更新用户信誉评分错误:', error);
    throw error;
  }
};

// 获取评价统计
const getReviewStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_reviews,
        COALESCE(AVG(rating), 0) as average_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
      FROM reviews 
      WHERE target_id = $1
    `, [userId]);

    const stats = result.rows[0];

    res.json({
      total_reviews: parseInt(stats.total_reviews),
      average_rating: parseFloat(stats.average_rating),
      rating_distribution: {
        five_star: parseInt(stats.five_star),
        four_star: parseInt(stats.four_star),
        three_star: parseInt(stats.three_star),
        two_star: parseInt(stats.two_star),
        one_star: parseInt(stats.one_star)
      }
    });

  } catch (error) {
    console.error('获取评价统计错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

module.exports = {
  createReview,
  getUserReviews,
  getTaskReviews,
  updateReview,
  deleteReview,
  getUserReputation,
  getReviewStats
};