import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      {/* 英雄区域 */}
      <section className="hero">
        <div className="hero-content">
          <h1>赏金猎人任务平台</h1>
          <p>连接任务发布者与执行者，让每一份努力都有价值</p>
          <div className="hero-buttons">
            <Link to="/tasks" className="btn btn-primary">浏览任务</Link>
            <Link to="/register" className="btn btn-secondary">立即注册</Link>
          </div>
        </div>
      </section>

      {/* 功能特色 */}
      <section className="features">
        <div className="container">
          <h2>平台特色</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>精准匹配</h3>
              <p>智能算法匹配最适合的任务和猎人</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>安全支付</h3>
              <p>第三方托管，确保资金安全</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h3>信誉系统</h3>
              <p>完善的评价体系，建立信任</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>移动优先</h3>
              <p>响应式设计，随时随地使用</p>
            </div>
          </div>
        </div>
      </section>

      {/* 最新任务 */}
      <section className="latest-tasks">
        <div className="container">
          <h2>最新任务</h2>
          <div className="tasks-grid">
            <div className="task-card">
              <h3>网站设计任务</h3>
              <p>需要一个现代化的企业官网设计</p>
              <div className="task-meta">
                <span className="reward">¥2,000</span>
                <span className="deadline">3天</span>
              </div>
            </div>
            <div className="task-card">
              <h3>内容创作</h3>
              <p>撰写技术博客文章，要求原创</p>
              <div className="task-meta">
                <span className="reward">¥500</span>
                <span className="deadline">1周</span>
              </div>
            </div>
            <div className="task-card">
              <h3>数据分析</h3>
              <p>分析用户行为数据，提供报告</p>
              <div className="task-meta">
                <span className="reward">¥1,500</span>
                <span className="deadline">5天</span>
              </div>
            </div>
          </div>
          <div className="text-center">
            <Link to="/tasks" className="btn btn-primary">查看更多任务</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;