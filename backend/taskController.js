// 任务控制器 - 后端API实现示例
const { v4: uuidv4 } = require('uuid');
const Task = require('../models/Task');
const TaskApplication = require('../models/TaskApplication');
const TaskCategory = require('../models/TaskCategory');
const TaskSkill = require('../models/TaskSkill');

class TaskController {
  // 获取任务列表
  async getTasks(req, res) {
    try {
      const {
        page = 1,
        limit = 12,
        category,
        minReward,
        maxReward,
        location,
        experienceLevel,
        skills,
        status,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = req.query;

      // 构建查询条件
      const query = { is_public: true };
      
      if (category) query.category = category;
      if (minReward) query.reward = { ...query.reward, $gte: parseFloat(minReward) };
      if (maxReward) query.reward = { ...query.reward, $lte: parseFloat(maxReward) };
      if (location) {
        query.$or = [
          { city: { $regex: location, $options: 'i' } },
          { country: { $regex: location, $options: 'i' } },
          { region: { $regex: location, $options: 'i' } }
        ];
      }
      if (experienceLevel) query.experience_level = experienceLevel;
      if (skills) {
        const skillsArray = Array.isArray(skills) ? skills : [skills];
        query.skills_required = { $in: skillsArray };
      }
      if (status) query.status = status;

      // 排序
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // 分页
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [tasks, total] = await Promise.all([
        Task.find(query)
          .populate('publisher_id', 'name avatar_url reputation_score')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit)),
        Task.countDocuments(query)
      ]);

      res.json({
        success: true,
        tasks,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      });

    } catch (error) {
      console.error('获取任务列表错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 获取任务详情
  async getTaskById(req, res) {
    try {
      const { taskId } = req.params;

      const task = await Task.findOne({ task_id: taskId })
        .populate('publisher_id', 'name avatar_url reputation_score email')
        .populate('hunter_id', 'name avatar_url reputation_score');

      if (!task) {
        return res.status(404).json({
          success: false,
          message: '任务不存在'
        });
      }

      // 增加浏览次数
      task.view_count = (task.view_count || 0) + 1;
      await task.save();

      res.json({
        success: true,
        task
      });

    } catch (error) {
      console.error('获取任务详情错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 创建任务
  async createTask(req, res) {
    try {
      const userId = req.user.userId;
      const taskData = req.body;

      // 验证必填字段
      if (!taskData.title || !taskData.description || !taskData.category || !taskData.reward) {
        return res.status(400).json({
          success: false,
          message: '标题、描述、分类和赏金是必填项'
        });
      }

      // 创建任务
      const task = new Task({
        task_id: uuidv4(),
        title: taskData.title,
        description: taskData.description,
        category: taskData.category,
        subcategory: taskData.subcategory,
        reward: parseFloat(taskData.reward),
        currency: taskData.currency || 'CNY',
        deadline: taskData.deadline ? new Date(taskData.deadline) : null,
        priority: taskData.priority || 'normal',
        country: taskData.country,
        city: taskData.city,
        region: taskData.region,
        skills_required: taskData.skills_required || [],
        experience_level: taskData.experience_level || 'any',
        estimated_hours: taskData.estimated_hours,
        attachments: taskData.attachments || {},
        images: taskData.images || [],
        publisher_id: userId,
        max_applicants: taskData.max_applicants || 10,
        auto_assign: taskData.auto_assign || false,
        tags: taskData.tags || [],
        created_at: new Date(),
        updated_at: new Date()
      });

      await task.save();

      // 返回任务信息
      const populatedTask = await Task.findOne({ task_id: task.task_id })
        .populate('publisher_id', 'name avatar_url reputation_score');

      res.status(201).json({
        success: true,
        message: '任务创建成功',
        task: populatedTask
      });

    } catch (error) {
      console.error('创建任务错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 申请任务
  async applyTask(req, res) {
    try {
      const { taskId } = req.params;
      const hunterId = req.user.userId;
      const { message, proposedReward, estimatedCompletionDate } = req.body;

      // 检查任务是否存在
      const task = await Task.findOne({ task_id: taskId });
      if (!task) {
        return res.status(404).json({
          success: false,
          message: '任务不存在'
        });
      }

      // 检查任务状态
      if (task.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: '任务当前状态不允许申请'
        });
      }

      // 检查是否已经申请过
      const existingApplication = await TaskApplication.findOne({
        task_id: taskId,
        hunter_id: hunterId
      });

      if (existingApplication) {
        return res.status(400).json({
          success: false,
          message: '您已经申请过此任务'
        });
      }

      // 检查申请人数限制
      if (task.max_applicants && task.application_count >= task.max_applicants) {
        return res.status(400).json({
          success: false,
          message: '任务申请人数已满'
        });
      }

      // 创建申请
      const application = new TaskApplication({
        application_id: uuidv4(),
        task_id: taskId,
        hunter_id: hunterId,
        application_message: message,
        proposed_reward: proposedReward ? parseFloat(proposedReward) : null,
        estimated_completion_date: estimatedCompletionDate ? new Date(estimatedCompletionDate) : null,
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date()
      });

      await application.save();

      // 更新任务申请计数
      task.application_count = (task.application_count || 0) + 1;
      await task.save();

      res.status(201).json({
        success: true,
        message: '申请提交成功',
        application
      });

    } catch (error) {
      console.error('申请任务错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 获取任务申请列表
  async getTaskApplications(req, res) {
    try {
      const { taskId } = req.params;
      const userId = req.user.userId;

      // 检查任务是否存在且用户有权限查看
      const task = await Task.findOne({ task_id: taskId });
      if (!task) {
        return res.status(404).json({
          success: false,
          message: '任务不存在'
        });
      }

      // 只有任务发布者可以查看申请
      if (task.publisher_id !== userId) {
        return res.status(403).json({
          success: false,
          message: '无权限查看申请列表'
        });
      }

      const applications = await TaskApplication.find({ task_id: taskId })
        .populate('hunter_id', 'name avatar_url reputation_score')
        .sort({ created_at: -1 });

      res.json({
        success: true,
        applications
      });

    } catch (error) {
      console.error('获取申请列表错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 接受申请
  async acceptApplication(req, res) {
    try {
      const { taskId, applicationId } = req.params;
      const userId = req.user.userId;

      // 检查任务是否存在且用户是发布者
      const task = await Task.findOne({ task_id: taskId });
      if (!task || task.publisher_id !== userId) {
        return res.status(403).json({
          success: false,
          message: '无权限操作此任务'
        });
      }

      // 检查申请是否存在
      const application = await TaskApplication.findOne({
        application_id: applicationId,
        task_id: taskId
      });

      if (!application) {
        return res.status(404).json({
          success: false,
          message: '申请不存在'
        });
      }

      // 更新申请状态
      application.status = 'accepted';
      application.updated_at = new Date();
      await application.save();

      // 更新任务状态和猎人
      task.status = 'active';
      task.hunter_id = application.hunter_id;
      task.started_at = new Date();
      task.updated_at = new Date();
      await task.save();

      // 拒绝其他申请
      await TaskApplication.updateMany(
        { 
          task_id: taskId, 
          application_id: { $ne: applicationId },
          status: 'pending'
        },
        { 
          status: 'rejected',
          updated_at: new Date()
        }
      );

      res.json({
        success: true,
        message: '申请已接受，任务开始执行'
      });

    } catch (error) {
      console.error('接受申请错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 获取任务分类
  async getCategories(req, res) {
    try {
      const categories = await TaskCategory.find({ is_active: true })
        .sort({ sort_order: 1 });

      res.json({
        success: true,
        categories
      });

    } catch (error) {
      console.error('获取分类错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 获取技能标签
  async getSkills(req, res) {
    try {
      const skills = await TaskSkill.find()
        .sort({ usage_count: -1 })
        .limit(50);

      res.json({
        success: true,
        skills
      });

    } catch (error) {
      console.error('获取技能标签错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }
}

module.exports = new TaskController();
