import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>赏金猎人平台</h3>
            <p>专业的任务发布与执行平台</p>
          </div>
          
          <div className="footer-section">
            <h4>快速链接</h4>
            <ul>
              <li><a href="/">首页</a></li>
              <li><a href="/tasks">任务大厅</a></li>
              <li><a href="/help">帮助中心</a></li>
              <li><a href="/about">关于我们</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>联系我们</h4>
            <p>邮箱: support@bountyhunterguild.com</p>
            <p>电话: 400-123-4567</p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2025 赏金猎人平台. 保留所有权利.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;