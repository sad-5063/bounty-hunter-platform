import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <span className="logo-icon">🎯</span>
              <span className="logo-text">赏金猎人平台</span>
            </div>
            <p className="footer-description">
              连接任务发布者与专业猎人的桥梁，让每个任务都能找到最合适的执行者。
            </p>
            <div className="social-links">
              <a href="#" className="social-link" aria-label="微信">
                💬
              </a>
              <a href="#" className="social-link" aria-label="微博">
                📱
              </a>
              <a href="#" className="social-link" aria-label="QQ">
                💬
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">平台功能</h4>
            <ul className="footer-links">
              <li><Link to="/tasks">任务大厅</Link></li>
              <li><Link to="/post-task">发布任务</Link></li>
              <li><Link to="/wallet">钱包管理</Link></li>
              <li><Link to="/messages">消息中心</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">帮助支持</h4>
            <ul className="footer-links">
              <li><Link to="/help">使用帮助</Link></li>
              <li><Link to="/faq">常见问题</Link></li>
              <li><Link to="/contact">联系我们</Link></li>
              <li><Link to="/feedback">意见反馈</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">关于我们</h4>
            <ul className="footer-links">
              <li><Link to="/about">平台介绍</Link></li>
              <li><Link to="/team">团队介绍</Link></li>
              <li><Link to="/careers">招聘信息</Link></li>
              <li><Link to="/privacy">隐私政策</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">联系方式</h4>
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-icon">📧</span>
                <span>support@bountyhunter.com</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <span>400-123-4567</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📍</span>
                <span>北京市朝阳区xxx大厦</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">
              © 2024 赏金猎人平台. 保留所有权利.
            </p>
            <div className="footer-bottom-links">
              <Link to="/terms">服务条款</Link>
              <Link to="/privacy">隐私政策</Link>
              <Link to="/cookies">Cookie政策</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
