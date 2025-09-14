import React from 'react';
import { Link } from 'react-router-dom';
import './WalletCard.css';

const WalletCard = ({ wallet, showActions = true }) => {
  const formatBalance = (amount, currency = 'CNY') => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const statusColors = {
      active: '#10b981',
      frozen: '#f59e0b',
      closed: '#ef4444'
    };
    return statusColors[status] || '#6b7280';
  };

  const getStatusText = (status) => {
    const statusTexts = {
      active: '正常',
      frozen: '冻结',
      closed: '已关闭'
    };
    return statusTexts[status] || status;
  };

  const availableBalance = wallet.balance - wallet.frozen_balance;

  return (
    <div className="wallet-card">
      <div className="wallet-header">
        <div className="wallet-info">
          <h3 className="wallet-title">我的钱包</h3>
          <div className="wallet-status">
            <span 
              className="status-badge"
              style={{ backgroundColor: getStatusColor(wallet.status) }}
            >
              {getStatusText(wallet.status)}
            </span>
          </div>
        </div>
        <div className="wallet-currency">
          {wallet.currency}
        </div>
      </div>

      <div className="wallet-balance">
        <div className="balance-section">
          <div className="balance-label">可用余额</div>
          <div className="balance-amount available">
            {formatBalance(availableBalance, wallet.currency)}
          </div>
        </div>
        
        <div className="balance-section">
          <div className="balance-label">冻结资金</div>
          <div className="balance-amount frozen">
            {formatBalance(wallet.frozen_balance, wallet.currency)}
          </div>
        </div>
        
        <div className="balance-section total">
          <div className="balance-label">总余额</div>
          <div className="balance-amount total">
            {formatBalance(wallet.balance, wallet.currency)}
          </div>
        </div>
      </div>

      {showActions && (
        <div className="wallet-actions">
          <Link to="/wallet/deposit" className="action-btn deposit-btn">
            <span className="action-icon">💰</span>
            <span>充值</span>
          </Link>
          <Link to="/wallet/withdraw" className="action-btn withdraw-btn">
            <span className="action-icon">💸</span>
            <span>提现</span>
          </Link>
          <Link to="/wallet/history" className="action-btn history-btn">
            <span className="action-icon">📊</span>
            <span>交易记录</span>
          </Link>
        </div>
      )}

      <div className="wallet-footer">
        <div className="wallet-stats">
          <div className="stat-item">
            <span className="stat-label">本月收入</span>
            <span className="stat-value">+¥0.00</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">本月支出</span>
            <span className="stat-value">-¥0.00</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletCard;
