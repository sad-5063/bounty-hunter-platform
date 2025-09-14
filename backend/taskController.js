// 任务控制器 - Node.js/Express 后端伪代码
const { Pool } = require('pg');

// 数据库连接
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 获取任务列表
const getTasks = async (req, res) => {
  try {
    const {
      category,
      location,
      minReward,
      maxReward,
      status,
      sortBy = 'created_at',
      page = 1,
      limit = 10
    } = req.query;

    let query = `
      SELECT t.*, u.name as publisher_name, u.avatar_url as publisher_avatar
      FROM tasks t
      LEFT JOIN users u ON t.publisher_id = u.user_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    // 添加筛选条件
    if (category) {
      paramCount++;
      query += ` AND t.category = $${paramCount}`;
      params.push(category);
    }

    if (location) {
      paramCount++;
      query += ` AND t.location ILIKE $${paramCount}`;
      params.push(`%${location}%`);
    }

    if (minReward) {
      paramCount++;
      query += ` AND t.reward >= $${paramCount}`;
      params.push(parseFloat(minReward));
    }

    if (maxReward) {
      paramCount++;
      query += ` AND t.reward <= $${paramCount}`;
      params.push(parseFloat(maxReward));
    }

    if (status) {
      paramCount++;
      query += ` AND t.status = $${paramCount}`;
      params.push(status);
    }

    // 添加排序
    const validSortFields = ['created_at', 'reward', 'deadline', 'title'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    query += ` ORDER BY t.${sortField} DESC`;

    // 添加分页
    const offset = (page - 1) * limit;
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(parseInt(limit));

    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await pool.query(query, params);

    // 获取总数
    let countQuery = 'SELECT COUNT(*) FROM tasks t WHERE 1=1';
    const countParams = [];
    let countParamCount = 0;

    if (category) {
      countParamCount++;
      countQuery += ` AND t.category = $${countParamCount}`;
      countParams.push(category);
    }

    if (location) {
      countParamCount++;
      countQuery += ` AND t.location ILIKE $${countParamCount}`;
      countParams.push(`%${location}%`);
    }

    if (minReward) {
      countParamCount++;
      countQuery += ` AND t.reward >= $${countParamCount}`;
      countParams.push(parseFloat(minReward));
    }

    if (maxReward) {
      countParamCount++;
      countQuery += ` AND t.reward <= $${countParamCount}`;
      countParams.push(parseFloat(maxReward));
    }

    if (status) {
      countParamCount++;
      countQuery += ` AND t.status = $${countParamCount}`;
      countParams.push(status);
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);
    const hasMore = offset + result.rows.length < totalCount;

    res.json({
      tasks: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        hasMore
      }
    });

  } catch (error) {
    console.error('获取任务列表错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 获取任务详情
const getTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const result = await pool.query(`
      SELECT t.*, 
             u1.name as publisher_name, 
             u1.avatar_url as publisher_avatar,
             u2.name as hunter_name,
             u2.avatar_url as hunter_avatar
      FROM tasks t
      LEFT JOIN users u1 ON t.publisher_id = u1.user_id
      LEFT JOIN users u2 ON t.hunter_id = u2.user_id
      WHERE t.task_id = $1
    `, [taskId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: '任务不存在' });
    }

    const task = result.rows[0];

    // 获取任务附件
    const attachmentsResult = await pool.query(`
      SELECT * FROM task_attachments WHERE task_id = $1
    `, [taskId]);

    task.attachments = attachmentsResult.rows;

    res.json({ task });

  } catch (error) {
    console.error('获取任务详情错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 创建任务
const createTask = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      title,
      description,
      category,
      reward,
      deadline,
      location,
      attachments
    } = req.body;

    // 验证输入
    if (!title || !description || !category || !reward || !deadline) {
      return res.status(400).json({ message: '请填写所有必填字段' });
    }

    if (parseFloat(reward) <= 0) {
      return res.status(400).json({ message: '赏金必须大于0' });
    }

    const deadlineDate = new Date(deadline);
    if (deadlineDate <= new Date()) {
      return res.status(400).json({ message: '截止时间必须是未来时间' });
    }

    // 创建任务
    const result = await pool.query(`
      INSERT INTO tasks (title, description, category, reward, deadline, location, publisher_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [title, description, category, parseFloat(reward), deadlineDate, location, userId]);

    const task = result.rows[0];

    // 处理附件
    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        await pool.query(`
          INSERT INTO task_attachments (task_id, filename, file_url, file_size)
          VALUES ($1, $2, $3, $4)
        `, [task.task_id, attachment.filename, attachment.file_url, attachment.file_size]);
      }
    }

    res.status(201).json({
      message: '任务创建成功',
      task
    });

  } catch (error) {
    console.error('创建任务错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 更新任务
const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.userId;
    const updateData = req.body;

    // 检查任务是否存在且用户有权限修改
    const taskResult = await pool.query(`
      SELECT * FROM tasks WHERE task_id = $1 AND publisher_id = $2
    `, [taskId, userId]);

    if (taskResult.rows.length === 0) {
      return res.status(404).json({ message: '任务不存在或无权限修改' });
    }

    const task = taskResult.rows[0];

    // 检查任务状态
    if (task.status !== 'pending') {
      return res.status(400).json({ message: '只能修改待接单状态的任务' });
    }

    // 构建更新查询
    const updateFields = [];
    const params = [];
    let paramCount = 0;

    if (updateData.title) {
      paramCount++;
      updateFields.push(`title = $${paramCount}`);
      params.push(updateData.title);
    }

    if (updateData.description) {
      paramCount++;
      updateFields.push(`description = $${paramCount}`);
      params.push(updateData.description);
    }

    if (updateData.category) {
      paramCount++;
      updateFields.push(`category = $${paramCount}`);
      params.push(updateData.category);
    }

    if (updateData.reward) {
      paramCount++;
      updateFields.push(`reward = $${paramCount}`);
      params.push(parseFloat(updateData.reward));
    }

    if (updateData.deadline) {
      paramCount++;
      updateFields.push(`deadline = $${paramCount}`);
      params.push(new Date(updateData.deadline));
    }

    if (updateData.location) {
      paramCount++;
      updateFields.push(`location = $${paramCount}`);
      params.push(updateData.location);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: '没有要更新的字段' });
    }

    paramCount++;
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    paramCount++;
    params.push(taskId);

    const query = `
      UPDATE tasks 
      SET ${updateFields.join(', ')}
      WHERE task_id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, params);

    res.json({
      message: '任务更新成功',
      task: result.rows[0]
    });

  } catch (error) {
    console.error('更新任务错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 删除任务
const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.userId;

    // 检查任务是否存在且用户有权限删除
    const taskResult = await pool.query(`
      SELECT * FROM tasks WHERE task_id = $1 AND publisher_id = $2
    `, [taskId, userId]);

    if (taskResult.rows.length === 0) {
      return res.status(404).json({ message: '任务不存在或无权限删除' });
    }

    const task = taskResult.rows[0];

    // 检查任务状态
    if (task.status === 'in_progress') {
      return res.status(400).json({ message: '进行中的任务不能删除' });
    }

    // 删除任务
    await pool.query('DELETE FROM tasks WHERE task_id = $1', [taskId]);

    res.json({ message: '任务删除成功' });

  } catch (error) {
    console.error('删除任务错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 接受任务
const acceptTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.userId;

    // 检查任务是否存在
    const taskResult = await pool.query(`
      SELECT * FROM tasks WHERE task_id = $1
    `, [taskId]);

    if (taskResult.rows.length === 0) {
      return res.status(404).json({ message: '任务不存在' });
    }

    const task = taskResult.rows[0];

    // 检查任务状态
    if (task.status !== 'pending') {
      return res.status(400).json({ message: '任务已被接受或已完成' });
    }

    // 检查是否是任务发布者
    if (task.publisher_id === userId) {
      return res.status(400).json({ message: '不能接受自己发布的任务' });
    }

    // 更新任务状态
    const result = await pool.query(`
      UPDATE tasks 
      SET status = 'in_progress', hunter_id = $1, updated_at = CURRENT_TIMESTAMP
      WHERE task_id = $2
      RETURNING *
    `, [userId, taskId]);

    res.json({
      message: '任务接受成功',
      task: result.rows[0]
    });

  } catch (error) {
    console.error('接受任务错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 完成任务
const completeTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.userId;
    const { completion_note, attachments } = req.body;

    // 检查任务是否存在
    const taskResult = await pool.query(`
      SELECT * FROM tasks WHERE task_id = $1
    `, [taskId]);

    if (taskResult.rows.length === 0) {
      return res.status(404).json({ message: '任务不存在' });
    }

    const task = taskResult.rows[0];

    // 检查任务状态和权限
    if (task.status !== 'in_progress') {
      return res.status(400).json({ message: '任务状态不正确' });
    }

    if (task.hunter_id !== userId) {
      return res.status(403).json({ message: '无权限完成此任务' });
    }

    // 更新任务状态
    const result = await pool.query(`
      UPDATE tasks 
      SET status = 'completed', completion_note = $1, completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE task_id = $2
      RETURNING *
    `, [completion_note, taskId]);

    // 处理完成附件
    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        await pool.query(`
          INSERT INTO task_completion_attachments (task_id, filename, file_url, file_size)
          VALUES ($1, $2, $3, $4)
        `, [taskId, attachment.filename, attachment.file_url, attachment.file_size]);
      }
    }

    res.json({
      message: '任务完成成功',
      task: result.rows[0]
    });

  } catch (error) {
    console.error('完成任务错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  acceptTask,
  completeTask
};
