import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import './TransactionList.css';

const TransactionList = ({ transactions, loading = false }) => {
  const [filter, setFilter] = useState('all');

  const formatAmount = (amount, type, currency = 'CNY') => {
    const formatted = new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Math.abs(amount));

    const prefix = ['deposit', 'task_reward', 'refund', 'bonus'].includes(type) ? '+' : '-';
    return `${prefix}${formatted}`;
  };

  const getTransactionIcon = (type) => {
    const icons = {
      deposit: '💰',
      withdrawal: '💸',
      task_payment: '📤',
      task_reward: '📥',
      refund: '🔄',
      fee: '💳',
      bonus: '🎁'
    };
    return icons[type] || '💼';
  };

  const getTransactionTypeText = (type) => {
    const texts = {
      deposit: '充值',
      withdrawal: '提现',
      task_payment: '任务支付',
      task_reward: '任务奖励',
      refund: '退款',
      fee: '手续费',
      bonus: '奖励'
    };
    return texts[type] || type;
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: '#10b981',
      pending: '#f59e0b',
      processing: '#3b82f6',
      failed: '#ef4444',
      cancelled: '#6b7280',
      refunded: '#8b5cf6'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusText = (status) => {
    const texts = {
      completed: '已完成',
      pending: '处理中',
      processing: '处理中',
      failed: '失败',
      cancelled: '已取消',
      refunded: '已退款'
    };
    return texts[status] || status;
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    if (filter === 'income') return ['deposit', 'task_reward', 'refund', 'bonus'].includes(transaction.type);
    if (filter === 'expense') return ['withdrawal', 'task_payment', 'fee'].includes(transaction.type);
    return transaction.type === filter;
  });

  if (loading) {
    return (
      <div className="transaction-list-loading">
        <div className="loading-spinner"></div>
        <p>加载交易记录中...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="transaction-list-empty">
        <div className="empty-icon">📊</div>
        <h3>暂无交易记录</h3>
        <p>您还没有任何交易记录</p>
      </div>
    );
  }

  return (
    <div className="transaction-list">
      <div className="transaction-header">
        <h3>交易记录</h3>
        <div className="transaction-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            全部
          </button>
          <button 
            className={`filter-btn ${filter === 'income' ? 'active' : ''}`}
            onClick={() => setFilter('income')}
          >
            收入
          </button>
          <button 
            className={`filter-btn ${filter === 'expense' ? 'active' : ''}`}
            onClick={() => setFilter('expense')}
          >
            支出
          </button>
        </div>
      </div>

      <div className="transaction-items">
        {filteredTransactions.map(transaction => (
          <div key={transaction.transaction_id} className="transaction-item">
            <div className="transaction-icon">
              {getTransactionIcon(transaction.type)}
            </div>
            
            <div className="transaction-details">
              <div className="transaction-info">
                <div className="transaction-type">
                  {getTransactionTypeText(transaction.type)}
                </div>
                <div className="transaction-description">
                  {transaction.description || '无描述'}
                </div>
                <div className="transaction-time">
                  {formatDistanceToNow(new Date(transaction.created_at), { 
                    addSuffix: true, 
                    locale: zhCN 
                  })}
                </div>
              </div>
              
              <div className="transaction-amount">
                <div className={`amount ${['deposit', 'task_reward', 'refund', 'bonus'].includes(transaction.type) ? 'positive' : 'negative'}`}>
                  {formatAmount(transaction.amount, transaction.type, transaction.currency)}
                </div>
                <div className="transaction-status">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(transaction.status) }}
                  >
                    {getStatusText(transaction.status)}
                  </span>
                </div>
              </div>
            </div>

            {transaction.fee_amount > 0 && (
              <div className="transaction-fee">
                手续费: {new Intl.NumberFormat('zh-CN', {
                  style: 'currency',
                  currency: transaction.currency,
                  minimumFractionDigits: 2
                }).format(transaction.fee_amount)}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredTransactions.length === 0 && filter !== 'all' && (
        <div className="no-transactions">
          <p>没有找到符合条件的交易记录</p>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
