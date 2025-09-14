import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { walletAPI } from '../services/walletAPI';
import WalletCard from '../components/wallet/WalletCard';
import TransactionList from '../components/wallet/TransactionList';
import './WalletPage.css';

const WalletPage = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    setLoading(true);
    setError('');

    try {
      const [walletData, transactionsData] = await Promise.all([
        walletAPI.getWallet(),
        walletAPI.getTransactions({ limit: 20 })
      ]);
      
      setWallet(walletData);
      setTransactions(transactionsData.transactions);
    } catch (error) {
      setError('加载钱包数据失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadWalletData();
  };

  if (loading && !wallet) {
    return (
      <div className="wallet-page-loading">
        <div className="loading-spinner"></div>
        <p>加载钱包数据中...</p>
      </div>
    );
  }

  if (error && !wallet) {
    return (
      <div className="wallet-page-error">
        <div className="error-icon">❌</div>
        <h3>加载失败</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={handleRefresh}>
          重新加载
        </button>
      </div>
    );
  }

  return (
    <div className="wallet-page">
      <div className="wallet-header">
        <h1>我的钱包</h1>
        <p>管理您的资金和交易记录</p>
        <button 
          className="refresh-btn"
          onClick={handleRefresh}
          disabled={loading}
        >
          {loading ? '刷新中...' : '🔄 刷新'}
        </button>
      </div>

      <div className="wallet-content">
        <div className="wallet-sidebar">
          <nav className="wallet-nav">
            <button 
              className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              📊 总览
            </button>
            <button 
              className={`nav-item ${activeTab === 'transactions' ? 'active' : ''}`}
              onClick={() => setActiveTab('transactions')}
            >
              📋 交易记录
            </button>
            <button 
              className={`nav-item ${activeTab === 'deposit' ? 'active' : ''}`}
              onClick={() => setActiveTab('deposit')}
            >
              💰 充值
            </button>
            <button 
              className={`nav-item ${activeTab === 'withdraw' ? 'active' : ''}`}
              onClick={() => setActiveTab('withdraw')}
            >
              💸 提现
            </button>
            <button 
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              ⚙️ 设置
            </button>
          </nav>
        </div>

        <div className="wallet-main">
          {activeTab === 'overview' && (
            <div className="wallet-overview">
              <WalletCard wallet={wallet} showActions={true} />
              
              <div className="wallet-stats">
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">📈</div>
                    <div className="stat-content">
                      <div className="stat-label">本月收入</div>
                      <div className="stat-value positive">+¥0.00</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">📉</div>
                    <div className="stat-content">
                      <div className="stat-label">本月支出</div>
                      <div className="stat-value negative">-¥0.00</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-content">
                      <div className="stat-label">完成任务</div>
                      <div className="stat-value">0</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">💳</div>
                    <div className="stat-content">
                      <div className="stat-label">支付方式</div>
                      <div className="stat-value">0</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="recent-transactions">
                <h3>最近交易</h3>
                <TransactionList 
                  transactions={transactions.slice(0, 5)} 
                  loading={loading}
                />
                {transactions.length > 5 && (
                  <div className="view-all-transactions">
                    <button 
                      className="btn btn-secondary"
                      onClick={() => setActiveTab('transactions')}
                    >
                      查看全部交易记录
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="wallet-transactions">
              <div className="transactions-header">
                <h2>交易记录</h2>
                <div className="transactions-actions">
                  <button className="btn btn-secondary">
                    📊 导出记录
                  </button>
                </div>
              </div>
              <TransactionList 
                transactions={transactions} 
                loading={loading}
              />
            </div>
          )}

          {activeTab === 'deposit' && (
            <div className="wallet-deposit">
              <h2>账户充值</h2>
              <div className="deposit-coming-soon">
                <div className="coming-soon-icon">🚧</div>
                <h3>充值功能即将推出</h3>
                <p>我们正在开发安全的充值功能，支持多种支付方式</p>
                <div className="coming-soon-features">
                  <div className="feature-item">
                    <span className="feature-icon">💳</span>
                    <span>银行卡支付</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">🔍</span>
                    <span>PayPal支付</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">📱</span>
                    <span>支付宝/微信</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'withdraw' && (
            <div className="wallet-withdraw">
              <h2>资金提现</h2>
              <div className="withdraw-coming-soon">
                <div className="coming-soon-icon">🚧</div>
                <h3>提现功能即将推出</h3>
                <p>我们正在开发安全的提现功能，支持多种提现方式</p>
                <div className="coming-soon-features">
                  <div className="feature-item">
                    <span className="feature-icon">🏦</span>
                    <span>银行转账</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">🔍</span>
                    <span>PayPal提现</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">📱</span>
                    <span>支付宝/微信</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="wallet-settings">
              <h2>钱包设置</h2>
              <div className="settings-sections">
                <div className="settings-section">
                  <h3>安全设置</h3>
                  <div className="setting-item">
                    <div className="setting-info">
                      <div className="setting-label">支付密码</div>
                      <div className="setting-description">设置支付密码以保护您的资金安全</div>
                    </div>
                    <button className="btn btn-secondary">设置</button>
                  </div>
                  <div className="setting-item">
                    <div className="setting-info">
                      <div className="setting-label">两步验证</div>
                      <div className="setting-description">为账户添加额外的安全保护</div>
                    </div>
                    <button className="btn btn-secondary">设置</button>
                  </div>
                </div>

                <div className="settings-section">
                  <h3>通知设置</h3>
                  <div className="setting-item">
                    <div className="setting-info">
                      <div className="setting-label">交易通知</div>
                      <div className="setting-description">接收交易相关的通知</div>
                    </div>
                    <button className="btn btn-secondary">设置</button>
                  </div>
                  <div className="setting-item">
                    <div className="setting-info">
                      <div className="setting-label">余额变动</div>
                      <div className="setting-description">余额变动时发送通知</div>
                    </div>
                    <button className="btn btn-secondary">设置</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
