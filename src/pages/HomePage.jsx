import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './HomePage.css';

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="home-page">
      {/* 英雄区域 */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>赏金猎人任务平台</h1>
          <p>连接任务发布者与专业猎人的桥梁，让每个任务都能找到最合适的执行者</p>
          
          {isAuthenticated ? (
            <div className="hero-actions">
              <Link to="/dashboard" className="btn btn-primary">
                进入个人中心
              </Link>
              <Link to="/tasks" className="btn btn-secondary">
                浏览任务
              </Link>
            </div>
          ) : (
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary">
                立即注册
              </Link>
              <Link to="/login" className="btn btn-secondary">
                登录账户
              </Link>
            </div>
          )}
        </div>
        
        <div className="hero-image">
          <div className="hero-illustration">
            <div className="task-card">
              <h3>💰 高额赏金</h3>
              <p>完成任务获得丰厚报酬</p>
            </div>
            <div className="task-card">
              <h3>🎯 精准匹配</h3>
              <p>智能推荐最适合的任务</p>
            </div>
            <div className="task-card">
              <h3>🛡️ 安全保障</h3>
              <p>完善的交易保护机制</p>
            </div>
          </div>
        </div>
      </section>

      {/* 功能特色 */}
      <section className="features-section">
        <div className="container">
          <h2>平台特色</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h3>任务发布</h3>
              <p>轻松发布任务，设置赏金金额，吸引专业猎人接单</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>智能匹配</h3>
              <p>基于技能和信誉度，智能推荐最合适的任务执行者</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>安全支付</h3>
              <p>第三方托管资金，确保交易安全，支持多种支付方式</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h3>信誉评价</h3>
              <p>完善的评价体系，建立可信赖的社区环境</p>
            </div>
          </div>
        </div>
      </section>

      {/* 统计数据 */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">1,000+</div>
              <div className="stat-label">注册用户</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <div className="stat-label">完成任务</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">¥50,000+</div>
              <div className="stat-label">累计赏金</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">98%</div>
              <div className="stat-label">满意度</div>
            </div>
          </div>
        </div>
      </section>

      {/* 行动号召 */}
      <section className="cta-section">
        <div className="container">
          <h2>准备开始您的赏金猎人之路？</h2>
          <p>立即注册，加入我们的专业任务平台</p>
          {!isAuthenticated && (
            <Link to="/register" className="btn btn-primary btn-large">
              免费注册
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
