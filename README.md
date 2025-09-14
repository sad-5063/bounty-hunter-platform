# 赏金猎人任务平台

一个连接任务发布者与专业猎人的现代化任务平台，支持任务发布、接单、支付和评价等完整功能。

## 🚀 功能特色

### 第一步：用户系统（已完成）
- ✅ 用户注册/登录/注销功能
- ✅ 邮箱登录（支持后期扩展 Google/Facebook 登录）
- ✅ 用户身份认证（头像、昵称、联系方式）
- ✅ 用户个人中心（查看/修改资料、任务历史、钱包余额）
- ✅ 登录后自动跳转到个人中心

### 第二步：任务系统（已完成）
- ✅ 任务发布功能（标题、描述、分类、赏金、截止时间）
- ✅ 任务大厅（显示所有任务、分页浏览）
- ✅ 任务筛选（按分类、赏金、地理位置、技能等）
- ✅ 任务详情页（完整任务信息、申请功能）
- ✅ 任务申请系统（猎人申请、发布者审核）
- ✅ 任务状态管理（待接单、进行中、已完成等）
- ✅ 任务分类和技能标签系统

### 第三步：钱包与支付系统（已完成）
- ✅ 用户钱包管理（余额、冻结资金、多币种支持）
- ✅ 交易记录系统（完整的交易历史和统计）
- ✅ 充值功能（支持多种支付方式，即将推出）
- ✅ 提现功能（银行转账、PayPal等，即将推出）
- ✅ 资金安全保障（支付密码、两步验证）
- ✅ 手续费管理（自动计算和收取）
- ✅ 系统配置管理（限额、费率等）

### 第四步：评价与信誉系统（已完成）
- ✅ 任务评价系统（多维度评分、匿名评价）
- ✅ 评价展示和筛选（好评、中评、差评分类）
- ✅ 用户信誉值计算（基于评价的智能算法）
- ✅ 信誉等级系统（新手、青铜、白银、黄金、白金、钻石）
- ✅ 信誉徽章系统（质量专家、沟通达人等专业徽章）
- ✅ 评价回复和互动（用户可回复评价）
- ✅ 评价举报和审核（维护评价质量）

### 第五步：消息与通知系统（已完成）
- ✅ 站内私信功能（实时聊天、消息历史）
- ✅ 对话管理（创建、归档、静音、搜索）
- ✅ 系统通知（任务、付款、评价、系统通知）
- ✅ 通知中心（分类筛选、批量操作、设置管理）
- ✅ 实时通信（WebSocket支持、在线状态）
- ✅ 消息草稿（自动保存、恢复编辑）
- ✅ 文件传输（图片、文档上传分享）

### 第六步：管理员后台（已完成）
- ✅ 管理员仪表板（数据统计、图表展示、快速操作）
- ✅ 用户管理（用户列表、封禁解封、认证审核、批量操作）
- ✅ 任务管理（任务审核、删除、推荐、状态管理）
- ✅ 资金管理（提现审核、资金统计、交易监控）
- ✅ 数据统计（用户增长、任务完成、收入分析）
- ✅ 举报处理（举报审核、处理记录、用户反馈）
- ✅ 系统设置（配置管理、维护计划、权限控制）
- ✅ 操作日志（管理员操作记录、审计追踪）

### 第七步：平台优化与部署（已完成）
- ✅ 移动端响应式优化（PWA支持、移动端导航）
- ✅ 性能优化（代码分割、缓存策略、懒加载）
- ✅ 部署配置（Docker容器化、Nginx配置）
- ✅ 性能监控（实时性能指标、错误追踪）
- ✅ 安全加固（HTTPS支持、安全头配置）
- ✅ 缓存策略（Service Worker、静态资源缓存）

### 平台已完全就绪！
- 🚀 所有核心功能已完成
- 📱 支持PC和移动端
- ⚡ 高性能优化
- 🔒 安全可靠
- 🐳 容器化部署

## 🛠️ 技术栈

### 前端
- **React 18** - 用户界面框架
- **React Router** - 路由管理
- **CSS3** - 样式设计
- **Context API** - 状态管理

### 后端（示例）
- **Node.js** - 服务器运行环境
- **Express.js** - Web框架
- **JWT** - 身份认证
- **bcryptjs** - 密码加密

### 数据库
- **PostgreSQL** - 主数据库
- **MongoDB** - 可选数据库

## 📁 项目结构

```
bounty-hunter-platform/
├── src/
│   ├── components/
│   │   ├── auth/           # 认证组件
│   │   │   ├── LoginForm.jsx
│   │   │   ├── RegisterForm.jsx
│   │   │   └── AuthForm.css
│   │   ├── ProtectedRoute.jsx
│   │   └── Header.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx # 认证上下文
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   └── DashboardPage.jsx
│   ├── services/
│   │   ├── authAPI.js      # 认证API
│   │   └── userAPI.js      # 用户API
│   ├── App.jsx
│   └── index.js
├── backend/
│   └── authController.js   # 后端认证控制器
├── database/
│   └── schema.sql          # 数据库结构
├── package.json
└── README.md
```

## 🚀 快速开始

### 1. 安装依赖
```bash
cd bounty-hunter-platform
npm install
```

### 2. 配置环境变量
创建 `.env` 文件：
```env
REACT_APP_API_URL=http://localhost:3001/api
```

### 3. 启动开发服务器
```bash
npm start
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📊 数据库结构

### 用户表 (users)
```sql
CREATE TABLE users (
    user_id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'user',
    wallet_balance DECIMAL(10,2) DEFAULT 0.00,
    reputation_score DECIMAL(3,2) DEFAULT 5.00,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔐 认证流程

1. **注册流程**
   - 用户填写注册表单
   - 后端验证数据并加密密码
   - 创建用户记录
   - 生成JWT token
   - 返回用户信息和token

2. **登录流程**
   - 用户输入邮箱和密码
   - 后端验证凭据
   - 生成JWT token
   - 返回用户信息和token

3. **受保护路由**
   - 检查JWT token有效性
   - 验证用户权限
   - 允许或拒绝访问

## 🎨 设计特色

- **现代简洁** - 采用现代设计语言，界面简洁美观
- **响应式设计** - 支持PC和移动设备
- **用户体验** - 流畅的交互动画和反馈
- **安全性** - 完善的认证和授权机制

## 📝 开发计划

- [x] 用户系统（注册/登录/个人中心）
- [x] 任务系统（发布/接单/管理）
- [x] 钱包与支付系统（钱包管理/交易记录/充值提现）
- [x] 评价与信誉系统（评价管理/信誉计算/徽章系统）
- [x] 消息与通知系统（实时聊天/通知管理/WebSocket）
- [x] 管理员后台（用户管理/任务管理/资金管理/数据统计）
- [x] 平台优化与部署（移动端优化/性能优化/容器化部署）

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系我们

- 项目链接: [https://github.com/your-username/bounty-hunter-platform](https://github.com/your-username/bounty-hunter-platform)
- 问题反馈: [Issues](https://github.com/your-username/bounty-hunter-platform/issues)

---

**注意**: 这是一个演示项目，展示了完整的用户系统实现。后续功能模块将逐步开发。
