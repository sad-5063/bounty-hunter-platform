# bounty-hunter-platform — 快速启动指南（示例）

以下说明假设项目使用 Next.js + Prisma + NextAuth，并以 Postgres 为数据库。请根据你的项目做出相应调整。

## 本地开发
1. 准备环境
   - 复制 `.env.example` 到 `.env` 并填好变量。
2. 启动数据库
   - 使用 docker-compose：`docker-compose up -d`
   - 或自行启动 PostgreSQL 并设置 `DATABASE_URL`
3. 安装依赖
   - `npm install` 或 `yarn`
4. Prisma 初始化
   - 生成客户端：`npx prisma generate`
   - 运行迁移：`npx prisma migrate dev --name init`
5. 启动项目
   - `npm run dev`
6. 测试注册与登录
   - 注册：POST `/api/auth/register` -> { name, email, password }
   - 登录：通过 NextAuth 的 `/api/auth/signin` 使用 Credentials 或 OAuth 登录

## 部署建议
- Vercel：把环境变量复制到 Vercel 的项目设置里（NEXTAUTH_URL、NEXTAUTH_SECRET、DATABASE_URL、OAuth secrets 等）。Vercel 推荐使用外部托管数据库（例如 Railway、Heroku）。
- Docker：构建镜像并部署到你选择的主机，注意不要在生产环境使用示例密码，且要启用 TLS/HTTPS.