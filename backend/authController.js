// 认证控制器 - 后端API实现示例
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const Session = require('../models/Session');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';

class AuthController {
  // 用户注册
  async register(req, res) {
    try {
      const { name, email, password, phone } = req.body;

      // 验证输入
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: '姓名、邮箱和密码是必填项'
        });
      }

      // 检查邮箱是否已存在
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: '该邮箱已被注册'
        });
      }

      // 密码加密
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // 创建用户
      const user = new User({
        user_id: uuidv4(),
        email,
        password_hash: passwordHash,
        name,
        phone: phone || null,
        role: 'user',
        wallet_balance: 0.00,
        reputation_score: 5.00,
        is_verified: false,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      });

      await user.save();

      // 生成JWT token
      const token = jwt.sign(
        { 
          userId: user.user_id, 
          email: user.email,
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // 保存会话
      const session = new Session({
        session_id: uuidv4(),
        user_id: user.user_id,
        token_hash: await bcrypt.hash(token, 10),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后过期
        created_at: new Date()
      });

      await session.save();

      // 返回用户信息（不包含密码）
      const userResponse = {
        user_id: user.user_id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        phone: user.phone,
        role: user.role,
        wallet_balance: user.wallet_balance,
        reputation_score: user.reputation_score,
        is_verified: user.is_verified,
        created_at: user.created_at
      };

      res.status(201).json({
        success: true,
        message: '注册成功',
        user: userResponse,
        token
      });

    } catch (error) {
      console.error('注册错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 用户登录
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // 验证输入
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: '邮箱和密码是必填项'
        });
      }

      // 查找用户
      const user = await User.findOne({ email, is_active: true });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: '邮箱或密码错误'
        });
      }

      // 验证密码
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: '邮箱或密码错误'
        });
      }

      // 更新最后登录时间
      user.last_login = new Date();
      await user.save();

      // 生成JWT token
      const token = jwt.sign(
        { 
          userId: user.user_id, 
          email: user.email,
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // 保存会话
      const session = new Session({
        session_id: uuidv4(),
        user_id: user.user_id,
        token_hash: await bcrypt.hash(token, 10),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        created_at: new Date()
      });

      await session.save();

      // 返回用户信息
      const userResponse = {
        user_id: user.user_id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        phone: user.phone,
        role: user.role,
        wallet_balance: user.wallet_balance,
        reputation_score: user.reputation_score,
        is_verified: user.is_verified,
        last_login: user.last_login
      };

      res.json({
        success: true,
        message: '登录成功',
        user: userResponse,
        token
      });

    } catch (error) {
      console.error('登录错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 用户登出
  async logout(req, res) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (token) {
        // 删除会话记录
        await Session.deleteMany({ 
          token_hash: await bcrypt.hash(token, 10) 
        });
      }

      res.json({
        success: true,
        message: '登出成功'
      });

    } catch (error) {
      console.error('登出错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 获取当前用户信息
  async getCurrentUser(req, res) {
    try {
      const userId = req.user.userId;
      
      const user = await User.findOne({ user_id: userId, is_active: true });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      const userResponse = {
        user_id: user.user_id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        phone: user.phone,
        role: user.role,
        wallet_balance: user.wallet_balance,
        reputation_score: user.reputation_score,
        is_verified: user.is_verified,
        last_login: user.last_login,
        created_at: user.created_at
      };

      res.json({
        success: true,
        user: userResponse
      });

    } catch (error) {
      console.error('获取用户信息错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 更新用户资料
  async updateProfile(req, res) {
    try {
      const userId = req.user.userId;
      const { name, phone, avatar_url } = req.body;

      const user = await User.findOne({ user_id: userId });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      // 更新用户信息
      if (name) user.name = name;
      if (phone !== undefined) user.phone = phone;
      if (avatar_url) user.avatar_url = avatar_url;
      
      user.updated_at = new Date();
      await user.save();

      const userResponse = {
        user_id: user.user_id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        phone: user.phone,
        role: user.role,
        wallet_balance: user.wallet_balance,
        reputation_score: user.reputation_score,
        is_verified: user.is_verified,
        updated_at: user.updated_at
      };

      res.json({
        success: true,
        message: '资料更新成功',
        user: userResponse
      });

    } catch (error) {
      console.error('更新资料错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 修改密码
  async changePassword(req, res) {
    try {
      const userId = req.user.userId;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: '当前密码和新密码是必填项'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: '新密码长度至少6位'
        });
      }

      const user = await User.findOne({ user_id: userId });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      // 验证当前密码
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: '当前密码错误'
        });
      }

      // 更新密码
      const saltRounds = 12;
      user.password_hash = await bcrypt.hash(newPassword, saltRounds);
      user.updated_at = new Date();
      await user.save();

      res.json({
        success: true,
        message: '密码修改成功'
      });

    } catch (error) {
      console.error('修改密码错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }
}

module.exports = new AuthController();
