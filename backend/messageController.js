// 消息控制器 - 后端API实现示例
const { v4: uuidv4 } = require('uuid');
const PrivateMessage = require('../models/PrivateMessage');
const Conversation = require('../models/Conversation');
const SystemNotification = require('../models/SystemNotification');
const NotificationTemplate = require('../models/NotificationTemplate');
const UserNotificationSettings = require('../models/UserNotificationSettings');
const MessageDraft = require('../models/MessageDraft');

class MessageController {
  // ==================== 对话管理 ====================

  // 获取对话列表
  async getConversations(req, res) {
    try {
      const userId = req.user.userId;
      const { page = 1, limit = 20, filter = 'all' } = req.query;

      // 构建查询条件
      let query = {
        $or: [
          { participant1_id: userId },
          { participant2_id: userId }
        ]
      };

      if (filter === 'unread') {
        query.$or = [
          { participant1_id: userId, unread_count_participant1: { $gt: 0 } },
          { participant2_id: userId, unread_count_participant2: { $gt: 0 } }
        ];
      } else if (filter === 'archived') {
        query.is_archived = true;
      } else if (filter === 'active') {
        query.is_archived = false;
        query.is_active = true;
      }

      // 分页
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [conversations, total] = await Promise.all([
        Conversation.find(query)
          .populate('participant1_id', 'name avatar_url')
          .populate('participant2_id', 'name avatar_url')
          .populate('last_message_id')
          .sort({ last_message_at: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Conversation.countDocuments(query)
      ]);

      res.json({
        success: true,
        conversations,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      });

    } catch (error) {
      console.error('获取对话列表错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 创建新对话
  async createConversation(req, res) {
    try {
      const userId = req.user.userId;
      const { participant_id } = req.body;

      if (!participant_id) {
        return res.status(400).json({
          success: false,
          message: '参与者ID是必填项'
        });
      }

      if (participant_id === userId) {
        return res.status(400).json({
          success: false,
          message: '不能与自己创建对话'
        });
      }

      // 检查是否已存在对话
      let conversation = await Conversation.findOne({
        $or: [
          { participant1_id: userId, participant2_id: participant_id },
          { participant1_id: participant_id, participant2_id: userId }
        ]
      });

      if (conversation) {
        return res.json({
          success: true,
          conversation,
          message: '对话已存在'
        });
      }

      // 创建新对话
      conversation = new Conversation({
        conversation_id: uuidv4(),
        participant1_id: userId,
        participant2_id: participant_id,
        unread_count_participant1: 0,
        unread_count_participant2: 0,
        is_active: true,
        is_archived: false,
        created_at: new Date(),
        updated_at: new Date()
      });

      await conversation.save();

      // 填充用户信息
      await conversation.populate([
        { path: 'participant1_id', select: 'name avatar_url' },
        { path: 'participant2_id', select: 'name avatar_url' }
      ]);

      res.status(201).json({
        success: true,
        conversation,
        message: '对话创建成功'
      });

    } catch (error) {
      console.error('创建对话错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // ==================== 消息管理 ====================

  // 获取对话消息
  async getConversationMessages(req, res) {
    try {
      const userId = req.user.userId;
      const { conversationId } = req.params;
      const { page = 1, limit = 50, before_message_id } = req.query;

      // 验证用户是否有权限访问此对话
      const conversation = await Conversation.findOne({
        conversation_id: conversationId,
        $or: [
          { participant1_id: userId },
          { participant2_id: userId }
        ]
      });

      if (!conversation) {
        return res.status(403).json({
          success: false,
          message: '无权访问此对话'
        });
      }

      // 构建查询条件
      const query = {
        conversation_id: conversationId,
        is_deleted: false
      };

      if (before_message_id) {
        const beforeMessage = await PrivateMessage.findOne({ message_id: before_message_id });
        if (beforeMessage) {
          query.created_at = { $lt: beforeMessage.created_at };
        }
      }

      // 分页
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [messages, total] = await Promise.all([
        PrivateMessage.find(query)
          .populate('sender_id', 'name avatar_url')
          .populate('receiver_id', 'name avatar_url')
          .sort({ created_at: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        PrivateMessage.countDocuments(query)
      ]);

      // 标记消息为已读
      await this.markMessagesAsRead(conversationId, userId);

      res.json({
        success: true,
        messages: messages.reverse(), // 按时间正序返回
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      });

    } catch (error) {
      console.error('获取消息错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 发送消息
  async sendMessage(req, res) {
    try {
      const userId = req.user.userId;
      const {
        conversation_id,
        content,
        message_type = 'text',
        attachment_url,
        attachment_name,
        attachment_size,
        reply_to_message_id
      } = req.body;

      if (!conversation_id || !content) {
        return res.status(400).json({
          success: false,
          message: '对话ID和消息内容是必填项'
        });
      }

      // 验证对话权限
      const conversation = await Conversation.findOne({
        conversation_id,
        $or: [
          { participant1_id: userId },
          { participant2_id: userId }
        ]
      });

      if (!conversation) {
        return res.status(403).json({
          success: false,
          message: '无权在此对话中发送消息'
        });
      }

      // 确定接收者
      const receiverId = conversation.participant1_id === userId 
        ? conversation.participant2_id 
        : conversation.participant1_id;

      // 创建消息
      const message = new PrivateMessage({
        message_id: uuidv4(),
        conversation_id,
        sender_id: userId,
        receiver_id: receiverId,
        message_type,
        content,
        attachment_url,
        attachment_name,
        attachment_size,
        reply_to_message_id,
        is_read: false,
        is_deleted: false,
        created_at: new Date(),
        updated_at: new Date()
      });

      await message.save();

      // 更新对话的最后消息
      await Conversation.findOneAndUpdate(
        { conversation_id },
        {
          last_message_id: message.message_id,
          last_message_at: message.created_at,
          updated_at: new Date()
        }
      );

      // 更新未读消息数
      await this.updateUnreadCount(conversation_id, receiverId);

      // 填充发送者信息
      await message.populate('sender_id', 'name avatar_url');

      res.status(201).json({
        success: true,
        message,
        message: '消息发送成功'
      });

    } catch (error) {
      console.error('发送消息错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 标记消息为已读
  async markMessagesAsRead(conversationId, userId) {
    try {
      await PrivateMessage.updateMany(
        {
          conversation_id: conversationId,
          receiver_id: userId,
          is_read: false
        },
        {
          is_read: true,
          read_at: new Date(),
          updated_at: new Date()
        }
      );

      // 重置未读消息数
      await Conversation.findOneAndUpdate(
        { conversation_id: conversationId },
        {
          $set: {
            [`unread_count_${conversationId.participant1_id === userId ? 'participant1' : 'participant2'}`]: 0,
            updated_at: new Date()
          }
        }
      );

    } catch (error) {
      console.error('标记消息已读错误:', error);
    }
  }

  // 更新未读消息数
  async updateUnreadCount(conversationId, receiverId) {
    try {
      const conversation = await Conversation.findOne({ conversation_id: conversationId });
      if (!conversation) return;

      const isParticipant1 = conversation.participant1_id === receiverId;
      const unreadField = isParticipant1 ? 'unread_count_participant1' : 'unread_count_participant2';

      await Conversation.findOneAndUpdate(
        { conversation_id: conversationId },
        {
          $inc: { [unreadField]: 1 },
          updated_at: new Date()
        }
      );

    } catch (error) {
      console.error('更新未读消息数错误:', error);
    }
  }

  // ==================== 通知管理 ====================

  // 获取通知列表
  async getNotifications(req, res) {
    try {
      const userId = req.user.userId;
      const { page = 1, limit = 20, filter = 'all', category } = req.query;

      // 构建查询条件
      const query = {
        user_id: userId,
        is_deleted: false
      };

      if (filter === 'unread') {
        query.is_read = false;
      } else if (filter === 'read') {
        query.is_read = true;
      }

      if (category) {
        query.category = category;
      }

      // 分页
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [notifications, total] = await Promise.all([
        SystemNotification.find(query)
          .sort({ created_at: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        SystemNotification.countDocuments(query)
      ]);

      res.json({
        success: true,
        notifications,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      });

    } catch (error) {
      console.error('获取通知错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 创建系统通知
  async createNotification(notificationData) {
    try {
      const notification = new SystemNotification({
        notification_id: uuidv4(),
        ...notificationData,
        created_at: new Date()
      });

      await notification.save();
      return notification;

    } catch (error) {
      console.error('创建通知错误:', error);
      throw error;
    }
  }

  // 标记通知为已读
  async markNotificationAsRead(req, res) {
    try {
      const userId = req.user.userId;
      const { notificationId } = req.params;

      const notification = await SystemNotification.findOneAndUpdate(
        {
          notification_id: notificationId,
          user_id: userId,
          is_read: false
        },
        {
          is_read: true,
          read_at: new Date(),
          updated_at: new Date()
        },
        { new: true }
      );

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: '通知不存在或已读'
        });
      }

      res.json({
        success: true,
        notification,
        message: '通知已标记为已读'
      });

    } catch (error) {
      console.error('标记通知已读错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 标记所有通知为已读
  async markAllNotificationsAsRead(req, res) {
    try {
      const userId = req.user.userId;

      const result = await SystemNotification.updateMany(
        {
          user_id: userId,
          is_read: false
        },
        {
          is_read: true,
          read_at: new Date(),
          updated_at: new Date()
        }
      );

      res.json({
        success: true,
        updatedCount: result.modifiedCount,
        message: '所有通知已标记为已读'
      });

    } catch (error) {
      console.error('标记全部通知已读错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 删除通知
  async deleteNotification(req, res) {
    try {
      const userId = req.user.userId;
      const { notificationId } = req.params;

      const notification = await SystemNotification.findOneAndUpdate(
        {
          notification_id: notificationId,
          user_id: userId
        },
        {
          is_deleted: true,
          deleted_at: new Date(),
          updated_at: new Date()
        },
        { new: true }
      );

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: '通知不存在'
        });
      }

      res.json({
        success: true,
        message: '通知已删除'
      });

    } catch (error) {
      console.error('删除通知错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // ==================== 通知设置 ====================

  // 获取通知设置
  async getNotificationSettings(req, res) {
    try {
      const userId = req.user.userId;

      let settings = await UserNotificationSettings.findOne({ user_id: userId });
      
      if (!settings) {
        // 创建默认设置
        settings = new UserNotificationSettings({
          setting_id: uuidv4(),
          user_id: userId,
          created_at: new Date(),
          updated_at: new Date()
        });
        await settings.save();
      }

      res.json({
        success: true,
        settings
      });

    } catch (error) {
      console.error('获取通知设置错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 更新通知设置
  async updateNotificationSettings(req, res) {
    try {
      const userId = req.user.userId;
      const settingsData = req.body;

      const settings = await UserNotificationSettings.findOneAndUpdate(
        { user_id: userId },
        {
          ...settingsData,
          updated_at: new Date()
        },
        { upsert: true, new: true }
      );

      res.json({
        success: true,
        settings,
        message: '通知设置已更新'
      });

    } catch (error) {
      console.error('更新通知设置错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // ==================== 消息草稿 ====================

  // 保存消息草稿
  async saveMessageDraft(req, res) {
    try {
      const userId = req.user.userId;
      const { conversation_id, content } = req.body;

      if (!conversation_id || !content) {
        return res.status(400).json({
          success: false,
          message: '对话ID和内容是必填项'
        });
      }

      const draft = await MessageDraft.findOneAndUpdate(
        { user_id: userId, conversation_id },
        {
          content,
          message_type: 'text',
          updated_at: new Date()
        },
        { upsert: true, new: true }
      );

      res.json({
        success: true,
        draft,
        message: '草稿已保存'
      });

    } catch (error) {
      console.error('保存草稿错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 获取消息草稿
  async getMessageDraft(req, res) {
    try {
      const userId = req.user.userId;
      const { conversationId } = req.params;

      const draft = await MessageDraft.findOne({
        user_id: userId,
        conversation_id: conversationId
      });

      res.json({
        success: true,
        draft: draft || null
      });

    } catch (error) {
      console.error('获取草稿错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }
}

module.exports = new MessageController();
