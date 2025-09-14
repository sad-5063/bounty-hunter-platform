// 认证控制器 - Node.js/Express 后端伪代码
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

// 数据库连接
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 用户注册
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 验证输入
    if (!name || !email || !password) {
      return res.status(400).json({ message: '请填写所有必填字段' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: '密码至少需要6位' });
    }

    // 检查邮箱是否已存在
    const existingUser = await pool.query(
      'SELECT user_id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: '该邮箱已被注册' });
    }

    // 加密密码
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 创建用户
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING user_id, name, email, role, wallet_balance, reputation_score, created_at',
      [name, email, passwordHash]
    );

    const user = result.rows[0];

    // 生成JWT token
    const token = jwt.sign(
      { userId: user.user_id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: '注册成功',
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        wallet_balance: user.wallet_balance,
        reputation_score: user.reputation_score,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 用户登录
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 验证输入
    if (!email || !password) {
      return res.status(400).json({ message: '请填写邮箱和密码' });
    }

    // 查找用户
    const result = await pool.query(
      'SELECT user_id, name, email, password_hash, role, wallet_balance, reputation_score, created_at FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: '邮箱或密码错误' });
    }

    const user = result.rows[0];

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: '邮箱或密码错误' });
    }

    // 生成JWT token
    const token = jwt.sign(
      { userId: user.user_id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: '登录成功',
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        wallet_balance: user.wallet_balance,
        reputation_score: user.reputation_score,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 获取当前用户信息
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      'SELECT user_id, name, email, avatar_url, role, wallet_balance, reputation_score, phone, is_verified, created_at FROM users WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }

    const user = result.rows[0];
    res.json({ user });

  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 更新用户资料
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, phone, avatar_url } = req.body;

    const result = await pool.query(
      'UPDATE users SET name = COALESCE($1, name), phone = COALESCE($2, phone), avatar_url = COALESCE($3, avatar_url), updated_at = CURRENT_TIMESTAMP WHERE user_id = $4 RETURNING user_id, name, email, avatar_url, phone, is_verified',
      [name, phone, avatar_url, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }

    const user = result.rows[0];
    res.json({ message: '资料更新成功', user });

  } catch (error) {
    console.error('更新资料错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 修改密码
const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: '请填写当前密码和新密码' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: '新密码至少需要6位' });
    }

    // 获取当前密码哈希
    const result = await pool.query(
      'SELECT password_hash FROM users WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }

    const user = result.rows[0];

    // 验证当前密码
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: '当前密码错误' });
    }

    // 加密新密码
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // 更新密码
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
      [newPasswordHash, userId]
    );

    res.json({ message: '密码修改成功' });

  } catch (error) {
    console.error('修改密码错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// JWT中间件
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: '访问令牌缺失' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: '无效的访问令牌' });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  updateProfile,
  changePassword,
  authenticateToken
};
