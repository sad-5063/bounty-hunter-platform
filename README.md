# 赏金猎人平台

一个完整的任务发布和接单平台，支持用户注册、任务管理、钱包支付、评价系统等功能。

## 🚀 功能特性

### 核心功能
- **用户系统**: 注册、登录、个人资料管理
- **任务系统**: 发布、接受、完成任务
- **钱包系统**: 充值、提现、交易记录
- **评价系统**: 互评、信誉评分
- **消息系统**: 站内信、通知
- **管理后台**: 用户管理、任务审核、数据统计

### 技术特性
- **前端**: React 18 + Vite + Tailwind CSS
- **后端**: Node.js + Express + PostgreSQL
- **部署**: Vercel + Supabase
- **安全**: JWT认证 + bcrypt加密
- **响应式**: 支持PC和移动端

## 📦 安装和运行

### 环境要求
- Node.js 16+
- PostgreSQL 12+
- npm 或 yarn

### 本地开发

1. **克隆项目**
```bash
git clone <repository-url>
cd bounty-hunter-platform
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
```bash
cp env.example .env
# 编辑 .env 文件，填入数据库连接信息
```

4. **初始化数据库**
```bash
# 创建数据库
createdb bounty_hunter_platform

# 执行数据库脚本
psql bounty_hunter_platform < database/schema.sql
psql bounty_hunter_platform < database/task_schema.sql
psql bounty_hunter_platform < database/wallet_schema.sql
psql bounty_hunter_platform < database/review_schema.sql
psql bounty_hunter_platform < database/message_schema.sql
psql bounty_hunter_platform < database/admin_schema.sql
```

5. **启动开发服务器**
```bash
npm run dev
```

访问 http://localhost:3000

## 🚀 部署

### Vercel 部署

1. **连接GitHub仓库**
   - 在Vercel中导入GitHub仓库
   - 选择项目根目录

2. **配置环境变量**
   - 在Vercel项目设置中添加环境变量
   - 设置 `NODE_ENV=production`
   - 配置数据库连接

3. **自动部署**
   - 推送代码到GitHub
   - Vercel会自动构建和部署

### Supabase 数据库

1. **创建Supabase项目**
   - 访问 https://supabase.com
   - 创建新项目

2. **配置数据库**
   - 在SQL编辑器中执行数据库脚本
   - 配置Row Level Security (RLS)

3. **获取连接信息**
   - 在项目设置中获取数据库URL
   - 配置API密钥

## 📁 项目结构

```
bounty-hunter-platform/
├── src/
│   ├── components/          # React组件
│   │   ├── auth/           # 认证组件
│   │   ├── tasks/          # 任务组件
│   │   ├── wallet/         # 钱包组件
│   │   └── reviews/        # 评价组件
│   ├── pages/              # 页面组件
│   ├── services/           # API服务
│   ├── contexts/           # React上下文
│   └── lib/                # 工具库
├── backend/                # 后端控制器
├── database/               # 数据库脚本
├── public/                 # 静态资源
└── docs/                   # 文档
```

## 🔧 开发指南

### 添加新功能

1. **创建数据库表**
   - 在 `database/` 目录添加SQL脚本
   - 更新 `init.sql`

2. **创建后端API**
   - 在 `backend/` 目录添加控制器
   - 在 `src/services/` 添加API服务

3. **创建前端组件**
   - 在 `src/components/` 添加组件
   - 在 `src/pages/` 添加页面

### 代码规范

- 使用ESLint和Prettier
- 遵循React最佳实践
- 使用TypeScript（可选）
- 编写单元测试

## 📝 API文档

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户

### 任务接口
- `GET /api/tasks` - 获取任务列表
- `POST /api/tasks` - 创建任务
- `GET /api/tasks/:id` - 获取任务详情
- `POST /api/tasks/:id/accept` - 接受任务

### 钱包接口
- `GET /api/wallet/:userId` - 获取钱包信息
- `POST /api/wallet/:userId/topup` - 充值
- `POST /api/wallet/:userId/withdraw` - 提现

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 📄 许可证

MIT License

## 📞 联系方式

- 邮箱: support@bountyhunter.com
- 电话: 400-123-4567
- 网站: https://bountyhunter.com

---

**赏金猎人平台** - 让任务发布和接单变得简单高效！