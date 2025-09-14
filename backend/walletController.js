// 钱包控制器 - 后端API实现示例
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Deposit = require('../models/Deposit');
const Withdrawal = require('../models/Withdrawal');
const PaymentMethod = require('../models/PaymentMethod');
const SystemSetting = require('../models/SystemSetting');

class WalletController {
  // 获取用户钱包信息
  async getWallet(req, res) {
    try {
      const userId = req.user.userId;

      let wallet = await Wallet.findOne({ user_id: userId });
      
      if (!wallet) {
        // 如果钱包不存在，创建一个新的
        wallet = new Wallet({
          wallet_id: uuidv4(),
          user_id: userId,
          balance: 0.00,
          frozen_balance: 0.00,
          currency: 'CNY',
          status: 'active',
          created_at: new Date(),
          updated_at: new Date()
        });
        await wallet.save();
      }

      res.json({
        success: true,
        wallet
      });

    } catch (error) {
      console.error('获取钱包信息错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 获取交易记录
  async getTransactions(req, res) {
    try {
      const userId = req.user.userId;
      const {
        page = 1,
        limit = 20,
        type,
        status,
        startDate,
        endDate
      } = req.query;

      // 构建查询条件
      const query = { user_id: userId };
      
      if (type) query.type = type;
      if (status) query.status = status;
      if (startDate || endDate) {
        query.created_at = {};
        if (startDate) query.created_at.$gte = new Date(startDate);
        if (endDate) query.created_at.$lte = new Date(endDate);
      }

      // 分页
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [transactions, total] = await Promise.all([
        Transaction.find(query)
          .sort({ created_at: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Transaction.countDocuments(query)
      ]);

      res.json({
        success: true,
        transactions,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      });

    } catch (error) {
      console.error('获取交易记录错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 创建充值订单
  async createDeposit(req, res) {
    try {
      const userId = req.user.userId;
      const { amount, paymentMethod, paymentAccount } = req.body;

      // 验证输入
      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: '充值金额必须大于0'
        });
      }

      // 获取系统配置
      const minDeposit = await SystemSetting.findOne({ setting_key: 'min_deposit_amount' });
      const maxDeposit = await SystemSetting.findOne({ setting_key: 'max_deposit_amount' });

      if (amount < parseFloat(minDeposit?.setting_value || 10)) {
        return res.status(400).json({
          success: false,
          message: `最小充值金额为¥${minDeposit?.setting_value || 10}`
        });
      }

      if (amount > parseFloat(maxDeposit?.setting_value || 50000)) {
        return res.status(400).json({
          success: false,
          message: `最大充值金额为¥${maxDeposit?.setting_value || 50000}`
        });
      }

      // 获取用户钱包
      const wallet = await Wallet.findOne({ user_id: userId });
      if (!wallet) {
        return res.status(404).json({
          success: false,
          message: '钱包不存在'
        });
      }

      // 创建交易记录
      const transaction = new Transaction({
        transaction_id: uuidv4(),
        user_id: userId,
        wallet_id: wallet.wallet_id,
        type: 'deposit',
        amount: parseFloat(amount),
        currency: 'CNY',
        status: 'pending',
        description: `账户充值 - ${paymentMethod}`,
        metadata: {
          payment_method: paymentMethod,
          payment_account: paymentAccount
        },
        created_at: new Date()
      });

      await transaction.save();

      // 创建充值记录
      const deposit = new Deposit({
        deposit_id: uuidv4(),
        user_id: userId,
        wallet_id: wallet.wallet_id,
        transaction_id: transaction.transaction_id,
        amount: parseFloat(amount),
        currency: 'CNY',
        payment_method: paymentMethod,
        payment_account: paymentAccount,
        status: 'pending',
        created_at: new Date()
      });

      await deposit.save();

      res.status(201).json({
        success: true,
        message: '充值订单创建成功',
        deposit: {
          deposit_id: deposit.deposit_id,
          amount: deposit.amount,
          payment_method: deposit.payment_method,
          status: deposit.status,
          created_at: deposit.created_at
        },
        transaction: {
          transaction_id: transaction.transaction_id,
          amount: transaction.amount,
          status: transaction.status
        }
      });

    } catch (error) {
      console.error('创建充值订单错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 创建提现申请
  async createWithdrawal(req, res) {
    try {
      const userId = req.user.userId;
      const { 
        amount, 
        withdrawalMethod, 
        accountHolderName, 
        accountNumber, 
        bankName, 
        bankCode 
      } = req.body;

      // 验证输入
      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: '提现金额必须大于0'
        });
      }

      // 获取系统配置
      const minWithdrawal = await SystemSetting.findOne({ setting_key: 'min_withdrawal_amount' });
      const maxWithdrawal = await SystemSetting.findOne({ setting_key: 'max_withdrawal_amount' });
      const withdrawalFeeRate = await SystemSetting.findOne({ setting_key: 'withdrawal_fee_rate' });
      const withdrawalFeeMin = await SystemSetting.findOne({ setting_key: 'withdrawal_fee_min' });

      if (amount < parseFloat(minWithdrawal?.setting_value || 50)) {
        return res.status(400).json({
          success: false,
          message: `最小提现金额为¥${minWithdrawal?.setting_value || 50}`
        });
      }

      if (amount > parseFloat(maxWithdrawal?.setting_value || 20000)) {
        return res.status(400).json({
          success: false,
          message: `最大提现金额为¥${maxWithdrawal?.setting_value || 20000}`
        });
      }

      // 获取用户钱包
      const wallet = await Wallet.findOne({ user_id: userId });
      if (!wallet) {
        return res.status(404).json({
          success: false,
          message: '钱包不存在'
        });
      }

      // 计算手续费
      const feeRate = parseFloat(withdrawalFeeRate?.setting_value || 0.01);
      const feeMin = parseFloat(withdrawalFeeMin?.setting_value || 2);
      const feeAmount = Math.max(amount * feeRate, feeMin);
      const totalAmount = amount + feeAmount;

      // 检查余额是否足够
      if (wallet.balance < totalAmount) {
        return res.status(400).json({
          success: false,
          message: `余额不足，需要¥${totalAmount.toFixed(2)}（含手续费¥${feeAmount.toFixed(2)}）`
        });
      }

      // 创建交易记录
      const transaction = new Transaction({
        transaction_id: uuidv4(),
        user_id: userId,
        wallet_id: wallet.wallet_id,
        type: 'withdrawal',
        amount: -parseFloat(amount), // 负数表示支出
        currency: 'CNY',
        status: 'pending',
        description: `账户提现 - ${withdrawalMethod}`,
        fee_amount: feeAmount,
        fee_type: 'percentage',
        metadata: {
          withdrawal_method: withdrawalMethod,
          account_holder_name: accountHolderName,
          bank_name: bankName,
          bank_code: bankCode
        },
        created_at: new Date()
      });

      await transaction.save();

      // 创建提现记录
      const withdrawal = new Withdrawal({
        withdrawal_id: uuidv4(),
        user_id: userId,
        wallet_id: wallet.wallet_id,
        transaction_id: transaction.transaction_id,
        amount: parseFloat(amount),
        currency: 'CNY',
        withdrawal_method: withdrawalMethod,
        account_holder_name: accountHolderName,
        account_number: accountNumber,
        bank_name: bankName,
        bank_code: bankCode,
        status: 'pending',
        requires_review: true,
        created_at: new Date()
      });

      await withdrawal.save();

      res.status(201).json({
        success: true,
        message: '提现申请提交成功，等待审核',
        withdrawal: {
          withdrawal_id: withdrawal.withdrawal_id,
          amount: withdrawal.amount,
          fee_amount: feeAmount,
          withdrawal_method: withdrawal.withdrawal_method,
          status: withdrawal.status,
          created_at: withdrawal.created_at
        },
        transaction: {
          transaction_id: transaction.transaction_id,
          amount: transaction.amount,
          status: transaction.status
        }
      });

    } catch (error) {
      console.error('创建提现申请错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 获取钱包统计信息
  async getWalletStats(req, res) {
    try {
      const userId = req.user.userId;
      const { period = 'month' } = req.query;

      // 计算时间范围
      const now = new Date();
      let startDate;
      
      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      // 获取统计数据
      const [
        totalIncome,
        totalExpense,
        transactionCount,
        completedTasks
      ] = await Promise.all([
        Transaction.aggregate([
          { $match: { user_id: userId, type: { $in: ['deposit', 'task_reward', 'refund', 'bonus'] }, status: 'completed', created_at: { $gte: startDate } } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        Transaction.aggregate([
          { $match: { user_id: userId, type: { $in: ['withdrawal', 'task_payment', 'fee'] }, status: 'completed', created_at: { $gte: startDate } } },
          { $group: { _id: null, total: { $sum: { $abs: '$amount' } } } }
        ]),
        Transaction.countDocuments({ user_id: userId, created_at: { $gte: startDate } }),
        Transaction.countDocuments({ user_id: userId, type: 'task_reward', status: 'completed', created_at: { $gte: startDate } })
      ]);

      const stats = {
        totalIncome: totalIncome[0]?.total || 0,
        totalExpense: totalExpense[0]?.total || 0,
        transactionCount: transactionCount || 0,
        completedTasks: completedTasks || 0,
        period: period,
        startDate: startDate,
        endDate: now
      };

      res.json({
        success: true,
        stats
      });

    } catch (error) {
      console.error('获取钱包统计错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 获取系统配置
  async getSystemSettings(req, res) {
    try {
      const settings = await SystemSetting.find({ is_public: true });
      
      const settingsObj = {};
      settings.forEach(setting => {
        let value = setting.setting_value;
        
        // 根据类型转换值
        switch (setting.setting_type) {
          case 'number':
            value = parseFloat(value);
            break;
          case 'boolean':
            value = value === 'true';
            break;
          case 'json':
            value = JSON.parse(value);
            break;
        }
        
        settingsObj[setting.setting_key] = value;
      });

      res.json({
        success: true,
        settings: settingsObj
      });

    } catch (error) {
      console.error('获取系统配置错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  // 验证支付密码
  async verifyPaymentPassword(req, res) {
    try {
      const userId = req.user.userId;
      const { password } = req.body;

      // 这里应该从用户表中获取支付密码哈希
      // 为了演示，我们假设用户有一个支付密码字段
      const user = await User.findOne({ user_id: userId });
      
      if (!user || !user.payment_password_hash) {
        return res.status(400).json({
          success: false,
          message: '请先设置支付密码'
        });
      }

      const isValid = await bcrypt.compare(password, user.payment_password_hash);
      
      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: '支付密码错误'
        });
      }

      res.json({
        success: true,
        message: '支付密码验证成功'
      });

    } catch (error) {
      console.error('验证支付密码错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }
}

module.exports = new WalletController();
