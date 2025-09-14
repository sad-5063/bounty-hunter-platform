import React, { useState } from 'react';
import './TransactionList.css';

const TransactionList = ({ transactions, onLoadMore }) => {
  const [filter, setFilter] = useState('all');

  const formatCurrency = (amount) => {
    return `¥${amount.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit': return '💰';
      case 'withdrawal': return '💸';
      case 'task_reward': return '🎯';
      case 'task_payment': return '💳';
      default: return '📄';
    }
  };

  const getTransactionTypeText = (type) => {
    switch (type) {
      case 'deposit': return '充值';
      case 'withdrawal': return '提现';
      case 'task_reward': return '任务奖励';
      case 'task_payment': return '任务支付';
      default: return '其他';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'failed': return '#ef4444';
      case 'cancelled': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return '已完成';
      case 'pending': return '处理中';
      case 'failed': return '失败';
      case 'cancelled': return '已取消';
      default: return '未知';
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    return transaction.type === filter;
  });

  const transactionTypes = [
    { value: 'all', label: '全部' },
    { value: 'deposit', label: '充值' },
    { value: 'withdrawal', label: '提现' },
    { value: 'task_reward', label: '任务奖励' },
    { value: 'task_payment', label: '任务支付' }
  ];

  return (
    <div className="transaction-list">
      <div className="transaction-header">
        <h3>交易记录</h3>
        <div className="transaction-filter">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
          >
            {transactionTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="transaction-items">
        {filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <p>暂无交易记录</p>
          </div>
        ) : (
          filteredTransactions.map(transaction => (
            <div key={transaction.transaction_id} className="transaction-item">
              <div className="transaction-icon">
                {getTransactionIcon(transaction.type)}
              </div>
              
              <div className="transaction-details">
                <div className="transaction-info">
                  <span className="transaction-type">
                    {getTransactionTypeText(transaction.type)}
                  </span>
                  <span className="transaction-date">
                    {formatDate(transaction.created_at)}
                  </span>
                </div>
                
                {transaction.description && (
                  <div className="transaction-description">
                    {transaction.description}
                  </div>
                )}
              </div>
              
              <div className="transaction-amount">
                <span 
                  className={`amount ${transaction.type === 'deposit' || transaction.type === 'task_reward' ? 'positive' : 'negative'}`}
                >
                  {transaction.type === 'deposit' || transaction.type === 'task_reward' ? '+' : '-'}
                  {formatCurrency(Math.abs(transaction.amount))}
                </span>
                <span 
                  className="status"
                  style={{ color: getStatusColor(transaction.status) }}
                >
                  {getStatusText(transaction.status)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {filteredTransactions.length > 0 && onLoadMore && (
        <div className="load-more">
          <button className="load-more-btn" onClick={onLoadMore}>
            加载更多
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
