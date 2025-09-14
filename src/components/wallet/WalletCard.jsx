import React from 'react';
import './WalletCard.css';

const WalletCard = ({ wallet, onTopUp, onWithdraw }) => {
  const formatCurrency = (amount) => {
    return `¥${amount.toFixed(2)}`;
  };

  return (
    <div className="wallet-card">
      <div className="wallet-header">
        <h3>我的钱包</h3>
        <div className="wallet-balance">
          <span className="balance-label">余额</span>
          <span className="balance-amount">{formatCurrency(wallet.balance)}</span>
        </div>
      </div>

      <div className="wallet-stats">
        <div className="stat-item">
          <span className="stat-label">总收入</span>
          <span className="stat-value income">{formatCurrency(wallet.totalIncome)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">总支出</span>
          <span className="stat-value expense">{formatCurrency(wallet.totalExpense)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">交易次数</span>
          <span className="stat-value">{wallet.transactionCount}</span>
        </div>
      </div>

      <div className="wallet-actions">
        <button className="action-btn topup-btn" onClick={onTopUp}>
          <span className="btn-icon">💰</span>
          充值
        </button>
        <button className="action-btn withdraw-btn" onClick={onWithdraw}>
          <span className="btn-icon">💸</span>
          提现
        </button>
      </div>

      <div className="wallet-security">
        <div className="security-status">
          <span className="security-icon">🔒</span>
          <span className="security-text">资金安全保护已启用</span>
        </div>
      </div>
    </div>
  );
};

export default WalletCard;
