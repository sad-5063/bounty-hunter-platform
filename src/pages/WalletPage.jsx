import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import WalletCard from '../components/wallet/WalletCard';
import TransactionList from '../components/wallet/TransactionList';
import { walletAPI } from '../services/walletAPI';
import './WalletPage.css';

const WalletPage = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState({
    balance: 0,
    totalIncome: 0,
    totalExpense: 0,
    transactionCount: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadWalletData();
    }
  }, [user]);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      setError('');

      const [walletResponse, transactionsResponse] = await Promise.all([
        walletAPI.getWallet(user.user_id),
        walletAPI.getTransactions(user.user_id, 1, 20)
      ]);

      setWallet(walletResponse);
      setTransactions(transactionsResponse.transactions);
    } catch (err) {
      setError(err.message || '加载钱包数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTopUp = () => {
    setShowTopUpModal(true);
  };

  const handleWithdraw = () => {
    setShowWithdrawModal(true);
  };

  const handleTopUpSubmit = async (amount, method) => {
    try {
      await walletAPI.topUp(user.user_id, amount, method);
      setShowTopUpModal(false);
      loadWalletData(); // 重新加载数据
    } catch (err) {
      alert(err.message || '充值失败');
    }
  };

  const handleWithdrawSubmit = async (amount, account) => {
    try {
      await walletAPI.withdraw(user.user_id, amount, account);
      setShowWithdrawModal(false);
      loadWalletData(); // 重新加载数据
    } catch (err) {
      alert(err.message || '提现失败');
    }
  };

  const handleLoadMoreTransactions = async () => {
    try {
      const response = await walletAPI.getTransactions(
        user.user_id, 
        Math.ceil(transactions.length / 20) + 1, 
        20
      );
      setTransactions(prev => [...prev, ...response.transactions]);
    } catch (err) {
      console.error('加载更多交易记录失败:', err);
    }
  };

  if (loading) {
    return (
      <div className="wallet-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>加载钱包数据中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-page">
      <div className="page-header">
        <h1>我的钱包</h1>
        <p>管理您的资金和交易记录</p>
      </div>

      <div className="page-content">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="wallet-section">
          <WalletCard
            wallet={wallet}
            onTopUp={handleTopUp}
            onWithdraw={handleWithdraw}
          />
        </div>

        <div className="transactions-section">
          <TransactionList
            transactions={transactions}
            onLoadMore={handleLoadMoreTransactions}
          />
        </div>
      </div>

      {/* 充值模态框 */}
      {showTopUpModal && (
        <TopUpModal
          onSubmit={handleTopUpSubmit}
          onCancel={() => setShowTopUpModal(false)}
        />
      )}

      {/* 提现模态框 */}
      {showWithdrawModal && (
        <WithdrawModal
          onSubmit={handleWithdrawSubmit}
          onCancel={() => setShowWithdrawModal(false)}
          balance={wallet.balance}
        />
      )}
    </div>
  );
};

// 充值模态框组件
const TopUpModal = ({ onSubmit, onCancel }) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('alipay');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (amount && parseFloat(amount) > 0) {
      onSubmit(parseFloat(amount), method);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>账户充值</h3>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>充值金额</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="请输入充值金额"
              min="1"
              step="0.01"
              required
            />
          </div>
          <div className="form-group">
            <label>支付方式</label>
            <select value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="alipay">支付宝</option>
              <option value="wechat">微信支付</option>
              <option value="bank">银行卡</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onCancel}>
              取消
            </button>
            <button type="submit" className="btn-submit">
              确认充值
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 提现模态框组件
const WithdrawModal = ({ onSubmit, onCancel, balance }) => {
  const [amount, setAmount] = useState('');
  const [account, setAccount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (amount && parseFloat(amount) > 0 && account) {
      onSubmit(parseFloat(amount), account);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>账户提现</h3>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>可提现余额</label>
            <div className="balance-display">¥{balance.toFixed(2)}</div>
          </div>
          <div className="form-group">
            <label>提现金额</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="请输入提现金额"
              min="1"
              max={balance}
              step="0.01"
              required
            />
          </div>
          <div className="form-group">
            <label>提现账户</label>
            <input
              type="text"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              placeholder="请输入提现账户信息"
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onCancel}>
              取消
            </button>
            <button type="submit" className="btn-submit">
              确认提现
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WalletPage;