# 🚀 赏金猎人任务平台部署指南

## 📋 部署前准备

### 1. 服务器要求
- **操作系统**: Ubuntu 20.04+ 或 CentOS 8+
- **CPU**: 2核心以上
- **内存**: 4GB以上
- **存储**: 50GB以上SSD
- **网络**: 公网IP，开放80/443端口

### 2. 域名准备
- 购买域名（如：bounty-hunter.com）
- 配置DNS解析到服务器IP
- 准备SSL证书（推荐使用Let's Encrypt免费证书）

### 3. 第三方服务配置
- **支付服务**: PayPal、Stripe账户
- **邮件服务**: SMTP服务器配置
- **短信服务**: 短信验证码服务（可选）

## 🛠️ 快速部署

### 方法一：一键部署脚本
```bash
# 下载部署脚本
wget https://raw.githubusercontent.com/your-repo/bounty-hunter-platform/main/deploy.sh

# 给脚本执行权限
chmod +x deploy.sh

# 运行部署脚本
./deploy.sh
```

### 方法二：手动部署
```bash
# 1. 更新系统
sudo apt update && sudo apt upgrade -y

# 2. 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 3. 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 4. 安装Nginx
sudo apt install nginx -y

# 5. 克隆项目
git clone https://github.com/your-repo/bounty-hunter-platform.git
cd bounty-hunter-platform

# 6. 配置环境变量
cp env.production .env
# 编辑.env文件，填入实际配置

# 7. 启动服务
docker-compose up -d --build

# 8. 配置Nginx
sudo cp nginx/bounty-hunter.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/bounty-hunter.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 9. 配置SSL证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## ⚙️ 详细配置

### 1. 环境变量配置
编辑 `.env` 文件，配置以下关键参数：

```bash
# 数据库配置
DATABASE_URL=postgresql://bounty_user:your_secure_password@localhost:5432/bounty_hunter
DB_PASSWORD=your_secure_password

# JWT密钥（必须修改）
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# 域名配置
REACT_APP_API_URL=https://your-domain.com/api
REACT_APP_WS_URL=wss://your-domain.com/ws

# 支付配置
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret

# 邮件配置
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 2. 数据库初始化
```bash
# 连接数据库
docker-compose exec postgres psql -U bounty_user -d bounty_hunter

# 执行初始化脚本
\i /app/database/init.sql
```

### 3. Nginx配置
修改 `nginx/bounty-hunter.conf` 文件：
- 将 `your-domain.com` 替换为实际域名
- 配置SSL证书路径
- 调整缓存策略

### 4. SSL证书配置
```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取SSL证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 设置自动续期
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

## 🔧 服务管理

### 启动服务
```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs -f
```

### 停止服务
```bash
# 停止所有服务
docker-compose down

# 停止并删除数据卷
docker-compose down -v
```

### 重启服务
```bash
# 重启特定服务
docker-compose restart frontend
docker-compose restart backend

# 重启所有服务
docker-compose restart
```

### 更新服务
```bash
# 拉取最新代码
git pull origin main

# 重新构建并启动
docker-compose up -d --build
```

## 📊 监控与维护

### 1. 系统监控
```bash
# 查看系统资源使用
htop
df -h
free -h

# 查看Docker容器状态
docker stats

# 查看服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 2. 数据库维护
```bash
# 连接数据库
docker-compose exec postgres psql -U bounty_user -d bounty_hunter

# 查看数据库大小
SELECT pg_size_pretty(pg_database_size('bounty_hunter'));

# 查看表大小
SELECT schemaname,tablename,pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size 
FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

# 清理过期数据
DELETE FROM system_notifications WHERE created_at < NOW() - INTERVAL '30 days';
```

### 3. 日志管理
```bash
# 查看Nginx日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# 查看应用日志
docker-compose logs -f backend | grep ERROR
docker-compose logs -f frontend | grep ERROR

# 清理日志文件
sudo find /var/log -name "*.log" -mtime +7 -delete
```

## 🔒 安全配置

### 1. 防火墙配置
```bash
# Ubuntu UFW
sudo ufw enable
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443

# CentOS Firewall
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 2. 数据库安全
```bash
# 修改默认密码
docker-compose exec postgres psql -U bounty_user -d bounty_hunter -c "ALTER USER bounty_user PASSWORD 'new_secure_password';"

# 限制数据库访问
# 编辑 docker-compose.yml，添加网络限制
```

### 3. 应用安全
- 定期更新依赖包
- 使用强密码
- 启用2FA认证
- 配置访问日志
- 设置IP白名单（可选）

## 📈 性能优化

### 1. 数据库优化
```sql
-- 创建索引
CREATE INDEX CONCURRENTLY idx_tasks_status ON tasks(status);
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);

-- 分析查询性能
EXPLAIN ANALYZE SELECT * FROM tasks WHERE status = 'published';
```

### 2. 缓存配置
```bash
# Redis配置
# 编辑 docker-compose.yml 中的Redis配置
redis:
  image: redis:7-alpine
  command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
```

### 3. Nginx优化
```nginx
# 启用Gzip压缩
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

# 启用缓存
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 🚨 故障排除

### 常见问题

#### 1. 服务启动失败
```bash
# 检查端口占用
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :3001

# 检查Docker状态
sudo systemctl status docker
docker-compose ps
```

#### 2. 数据库连接失败
```bash
# 检查数据库状态
docker-compose exec postgres pg_isready -U bounty_user

# 检查数据库日志
docker-compose logs postgres
```

#### 3. SSL证书问题
```bash
# 检查证书状态
sudo certbot certificates

# 手动续期
sudo certbot renew --dry-run
```

#### 4. 内存不足
```bash
# 检查内存使用
free -h
docker stats

# 清理Docker缓存
docker system prune -a
```

### 日志分析
```bash
# 查看错误日志
grep -i error /var/log/nginx/error.log
docker-compose logs backend | grep -i error

# 查看访问统计
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -10
```

## 📞 技术支持

### 联系方式
- **技术支持**: support@bounty-hunter.com
- **紧急联系**: +86-xxx-xxxx-xxxx
- **在线文档**: https://docs.bounty-hunter.com

### 社区支持
- **GitHub Issues**: https://github.com/your-repo/bounty-hunter-platform/issues
- **Discord社区**: https://discord.gg/bounty-hunter
- **QQ群**: 123456789

### 商业支持
- **企业版**: enterprise@bounty-hunter.com
- **定制开发**: custom@bounty-hunter.com
- **培训服务**: training@bounty-hunter.com

---

## 🎉 部署完成

恭喜！您的赏金猎人任务平台已经成功部署！

### 访问地址
- **主站**: https://your-domain.com
- **管理后台**: https://your-domain.com/admin
- **API文档**: https://your-domain.com/api/docs

### 默认账户
- **管理员邮箱**: admin@bounty-hunter.com
- **默认密码**: admin123
- **⚠️ 请立即修改默认密码！**

### 下一步
1. 修改默认密码
2. 配置支付服务
3. 设置邮件服务
4. 测试所有功能
5. 开始运营推广

祝您运营顺利！🚀
