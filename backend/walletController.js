// 钱包控制器 - Node.js/Express 后端伪代码
const { Pool } = require('pg');

// 数据库连接
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 获取钱包信息
const getWallet = async (req, res) => {
  try {
    const { userId } = req.params;

    // 获取用户钱包信息
    const walletResult = await pool.query(`
      SELECT user_id, wallet_balance, reputation_score, created_at
      FROM users WHERE user_id = $1
    `, [userId]);

    if (walletResult.rows.length === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }

    const user = walletResult.rows[0];

    // 获取交易统计
    const statsResult = await pool.query(`
      SELECT 
        COUNT(*) as transaction_count,
        COALESCE(SUM(CASE WHEN type IN ('deposit', 'task_reward') THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type IN ('withdrawal', 'task_payment') THEN amount ELSE 0 END), 0) as total_expense
      FROM transactions 
      WHERE user_id = $1 AND status = 'completed'
    `, [userId]);

    const stats = statsResult.rows[0];

    const wallet = {
      balance: parseFloat(user.wallet_balance),
      totalIncome: parseFloat(stats.total_income),
      totalExpense: parseFloat(stats.total_expense),
      transactionCount: parseInt(stats.transaction_count)
    };

    res.json(wallet);

  } catch (error) {
    console.error('获取钱包信息错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 获取交易记录
const getTransactions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, type } = req.query;

    let query = `
      SELECT * FROM transactions 
      WHERE user_id = $1
    `;
    const params = [userId];
    let paramCount = 1;

    if (type) {
      paramCount++;
      query += ` AND type = $${paramCount}`;
      params.push(type);
    }

    query += ` ORDER BY created_at DESC`;

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
    let countQuery = 'SELECT COUNT(*) FROM transactions WHERE user_id = $1';
    const countParams = [userId];

    if (type) {
      countQuery += ' AND type = $2';
      countParams.push(type);
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);
    const hasMore = offset + result.rows.length < totalCount;

    res.json({
      transactions: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        hasMore
      }
    });

  } catch (error) {
    console.error('获取交易记录错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 充值
const topUp = async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, method } = req.body;

    // 验证输入
    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ message: '充值金额必须大于0' });
    }

    if (!method) {
      return res.status(400).json({ message: '请选择支付方式' });
    }

    const amountValue = parseFloat(amount);

    // 开始事务
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 创建交易记录
      const transactionResult = await client.query(`
        INSERT INTO transactions (user_id, amount, type, status, description)
        VALUES ($1, $2, 'deposit', 'pending', $3)
        RETURNING *
      `, [userId, amountValue, `通过${method}充值`]);

      const transaction = transactionResult.rows[0];

      // 这里应该调用第三方支付接口
      // 模拟支付成功
      const paymentSuccess = true; // 实际应该调用支付接口

      if (paymentSuccess) {
        // 更新交易状态
        await client.query(`
          UPDATE transactions 
          SET status = 'completed', completed_at = CURRENT_TIMESTAMP
          WHERE transaction_id = $1
        `, [transaction.transaction_id]);

        // 更新用户余额
        await client.query(`
          UPDATE users 
          SET wallet_balance = wallet_balance + $1
          WHERE user_id = $2
        `, [amountValue, userId]);

        await client.query('COMMIT');

        res.json({
          message: '充值成功',
          transaction: {
            ...transaction,
            status: 'completed'
          }
        });
      } else {
        await client.query('ROLLBACK');
        res.status(400).json({ message: '支付失败' });
      }

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('充值错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 提现
const withdraw = async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, account } = req.body;

    // 验证输入
    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ message: '提现金额必须大于0' });
    }

    if (!account) {
      return res.status(400).json({ message: '请提供提现账户信息' });
    }

    const amountValue = parseFloat(amount);

    // 开始事务
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 检查用户余额
      const userResult = await client.query(`
        SELECT wallet_balance FROM users WHERE user_id = $1
      `, [userId]);

      if (userResult.rows.length === 0) {
        return res.status(404).json({ message: '用户不存在' });
      }

      const currentBalance = parseFloat(userResult.rows[0].wallet_balance);

      if (currentBalance < amountValue) {
        return res.status(400).json({ message: '余额不足' });
      }

      // 创建交易记录
      const transactionResult = await client.query(`
        INSERT INTO transactions (user_id, amount, type, status, description)
        VALUES ($1, $2, 'withdrawal', 'pending', $3)
        RETURNING *
      `, [userId, amountValue, `提现到${account}`]);

      const transaction = transactionResult.rows[0];

      // 冻结用户资金
      await client.query(`
        UPDATE users 
        SET wallet_balance = wallet_balance - $1
        WHERE user_id = $2
      `, [amountValue, userId]);

      // 这里应该调用银行接口进行提现
      // 模拟提现处理
      const withdrawSuccess = true; // 实际应该调用银行接口

      if (withdrawSuccess) {
        // 更新交易状态
        await client.query(`
          UPDATE transactions 
          SET status = 'completed', completed_at = CURRENT_TIMESTAMP
          WHERE transaction_id = $1
        `, [transaction.transaction_id]);

        await client.query('COMMIT');

        res.json({
          message: '提现申请已提交，请等待处理',
          transaction: {
            ...transaction,
            status: 'completed'
          }
        });
      } else {
        // 提现失败，退还资金
        await client.query(`
          UPDATE users 
          SET wallet_balance = wallet_balance + $1
          WHERE user_id = $2
        `, [amountValue, userId]);

        await client.query(`
          UPDATE transactions 
          SET status = 'failed', completed_at = CURRENT_TIMESTAMP
          WHERE transaction_id = $1
        `, [transaction.transaction_id]);

        await client.query('COMMIT');

        res.status(400).json({ message: '提现失败' });
      }

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('提现错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 转账
const transfer = async (req, res) => {
  try {
    const { userId } = req.params;
    const { targetUserId, amount, description } = req.body;

    // 验证输入
    if (!targetUserId || !amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ message: '请提供有效的转账信息' });
    }

    if (targetUserId === userId) {
      return res.status(400).json({ message: '不能给自己转账' });
    }

    const amountValue = parseFloat(amount);

    // 开始事务
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 检查目标用户是否存在
      const targetUserResult = await client.query(`
        SELECT user_id FROM users WHERE user_id = $1
      `, [targetUserId]);

      if (targetUserResult.rows.length === 0) {
        return res.status(404).json({ message: '目标用户不存在' });
      }

      // 检查发送方余额
      const senderResult = await client.query(`
        SELECT wallet_balance FROM users WHERE user_id = $1
      `, [userId]);

      const senderBalance = parseFloat(senderResult.rows[0].wallet_balance);

      if (senderBalance < amountValue) {
        return res.status(400).json({ message: '余额不足' });
      }

      // 创建转账交易记录
      const transactionResult = await client.query(`
        INSERT INTO transactions (user_id, amount, type, status, description, target_user_id)
        VALUES ($1, $2, 'transfer', 'completed', $3, $4)
        RETURNING *
      `, [userId, amountValue, description || '转账', targetUserId]);

      // 更新发送方余额
      await client.query(`
        UPDATE users 
        SET wallet_balance = wallet_balance - $1
        WHERE user_id = $2
      `, [amountValue, userId]);

      // 更新接收方余额
      await client.query(`
        UPDATE users 
        SET wallet_balance = wallet_balance + $1
        WHERE user_id = $2
      `, [amountValue, targetUserId]);

      await client.query('COMMIT');

      res.json({
        message: '转账成功',
        transaction: transactionResult.rows[0]
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('转账错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 获取余额
const getBalance = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(`
      SELECT wallet_balance FROM users WHERE user_id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }

    res.json({
      balance: parseFloat(result.rows[0].wallet_balance)
    });

  } catch (error) {
    console.error('获取余额错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// 获取钱包统计
const getWalletStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_transactions,
        COALESCE(SUM(CASE WHEN type = 'deposit' THEN amount ELSE 0 END), 0) as total_deposits,
        COALESCE(SUM(CASE WHEN type = 'withdrawal' THEN amount ELSE 0 END), 0) as total_withdrawals,
        COALESCE(SUM(CASE WHEN type = 'task_reward' THEN amount ELSE 0 END), 0) as total_rewards,
        COALESCE(SUM(CASE WHEN type = 'task_payment' THEN amount ELSE 0 END), 0) as total_payments,
        COALESCE(SUM(CASE WHEN type = 'transfer' AND user_id = $1 THEN amount ELSE 0 END), 0) as total_sent,
        COALESCE(SUM(CASE WHEN type = 'transfer' AND target_user_id = $1 THEN amount ELSE 0 END), 0) as total_received
      FROM transactions 
      WHERE user_id = $1 AND status = 'completed'
    `, [userId]);

    const stats = result.rows[0];

    res.json({
      totalTransactions: parseInt(stats.total_transactions),
      totalDeposits: parseFloat(stats.total_deposits),
      totalWithdrawals: parseFloat(stats.total_withdrawals),
      totalRewards: parseFloat(stats.total_rewards),
      totalPayments: parseFloat(stats.total_payments),
      totalSent: parseFloat(stats.total_sent),
      totalReceived: parseFloat(stats.total_received)
    });

  } catch (error) {
    console.error('获取钱包统计错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

module.exports = {
  getWallet,
  getTransactions,
  topUp,
  withdraw,
  transfer,
  getBalance,
  getWalletStats
};
