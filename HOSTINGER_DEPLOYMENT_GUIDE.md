# 🚀 Hostinger + bountyhunterguild.com 部署指南

## 🎯 部署概览

- **云服务器**: Hostinger VPS
- **域名**: bountyhunterguild.com
- **平台**: 赏金猎人任务平台
- **部署方式**: Docker + Nginx

## 📋 部署前准备

### 1. Hostinger VPS 配置要求
- **操作系统**: Ubuntu 20.04 LTS
- **内存**: 最少 2GB RAM
- **存储**: 最少 20GB SSD
- **CPU**: 最少 1核心
- **带宽**: 最少 1TB/月

### 2. 域名配置
- **主域名**: bountyhunterguild.com
- **子域名**: www.bountyhunterguild.com
- **管理后台**: admin.bountyhunterguild.com

## 🛠️ 第一步：配置Hostinger VPS

### 1. 登录Hostinger控制面板
1. 访问 https://hpanel.hostinger.com
2. 登录您的账户
3. 进入VPS管理面板

### 2. 创建VPS实例
```bash
# 推荐配置
- 操作系统: Ubuntu 20.04 LTS
- 内存: 4GB RAM
- 存储: 40GB SSD
- CPU: 2核心
- 带宽: 2TB/月
```

### 3. 获取服务器信息
- **IP地址**: 记录您的VPS IP地址
- **SSH端口**: 通常是22
- **用户名**: root
- **密码**: 从Hostinger面板获取

## 🌐 第二步：配置域名DNS

### 1. 登录域名管理面板
1. 访问 https://hpanel.hostinger.com
2. 进入域名管理
3. 选择 bountyhunterguild.com

### 2. 配置DNS记录
```bash
# A记录配置
类型: A
名称: @
值: YOUR_VPS_IP_ADDRESS
TTL: 3600

# www子域名
类型: A
名称: www
值: YOUR_VPS_IP_ADDRESS
TTL: 3600

# admin子域名
类型: A
名称: admin
值: YOUR_VPS_IP_ADDRESS
TTL: 3600

# CNAME记录（可选）
类型: CNAME
名称: api
值: bountyhunterguild.com
TTL: 3600
```

### 3. 等待DNS传播
- DNS传播时间: 通常5-30分钟
- 检查工具: https://www.whatsmydns.net
- 验证命令: `nslookup bountyhunterguild.com`

## 🚀 第三步：部署应用到Hostinger

### 1. 连接VPS
```bash
# 使用SSH连接
ssh root@YOUR_VPS_IP_ADDRESS

# 或使用密码连接
ssh root@YOUR_VPS_IP_ADDRESS
# 输入从Hostinger获取的密码
```

### 2. 更新系统
```bash
# 更新包列表
apt update && apt upgrade -y

# 安装基础工具
apt install -y curl wget git vim htop unzip
```

### 3. 安装Docker
```bash
# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# 启动Docker服务
systemctl start docker
systemctl enable docker

# 验证安装
docker --version
```

### 4. 安装Docker Compose
```bash
# 安装Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 验证安装
docker-compose --version
```

### 5. 安装Nginx
```bash
# 安装Nginx
apt install -y nginx

# 启动Nginx服务
systemctl start nginx
systemctl enable nginx

# 检查状态
systemctl status nginx
```

## 📦 第四步：上传项目文件

### 方法1：使用SCP上传
```bash
# 在本地执行（Windows PowerShell）
scp -r bounty-hunter-platform-complete.zip root@YOUR_VPS_IP_ADDRESS:/root/

# 在VPS上解压
cd /root
unzip bounty-hunter-platform-complete.zip
cd bounty-hunter-platform
```

### 方法2：使用Git克隆
```bash
# 在VPS上克隆项目
cd /root
git clone https://github.com/your-username/bounty-hunter-platform.git
cd bounty-hunter-platform
```

### 方法3：使用wget下载
```bash
# 将项目文件上传到云存储（如GitHub Releases）
# 然后使用wget下载
cd /root
wget https://github.com/your-username/bounty-hunter-platform/releases/download/v1.0.0/bounty-hunter-platform-complete.zip
unzip bounty-hunter-platform-complete.zip
cd bounty-hunter-platform
```

## ⚙️ 第五步：配置环境变量

### 1. 创建生产环境配置
```bash
# 复制环境配置文件
cp env.production .env

# 编辑环境变量
vim .env
```

### 2. 配置环境变量
```bash
# 基础配置
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# 数据库配置
DATABASE_URL=postgresql://bounty_user:bounty_password@postgres:5432/bounty_hunter
DB_HOST=postgres
DB_PORT=5432
DB_NAME=bounty_hunter
DB_USER=bounty_user
DB_PASSWORD=bounty_password

# Redis配置
REDIS_URL=redis://redis:6379
REDIS_HOST=redis
REDIS_PORT=6379

# JWT配置
JWT_SECRET=bounty-hunter-guild-super-secret-jwt-key-2024
JWT_EXPIRES_IN=7d

# 前端配置
REACT_APP_API_URL=https://bountyhunterguild.com/api
REACT_APP_WS_URL=wss://bountyhunterguild.com/ws
REACT_APP_ENVIRONMENT=production

# 文件上传配置
UPLOAD_DIR=/app/uploads
MAX_FILE_SIZE=10485760

# 邮件配置
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# 支付配置
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
```

## 🐳 第六步：启动Docker服务

### 1. 构建和启动服务
```bash
# 构建前端
npm install
npm run build

# 启动Docker服务
docker-compose up -d --build

# 查看服务状态
docker-compose ps
```

### 2. 检查服务日志
```bash
# 查看所有服务日志
docker-compose logs

# 查看特定服务日志
docker-compose logs frontend
docker-compose logs backend
docker-compose logs postgres
```

## 🌐 第七步：配置Nginx

### 1. 创建Nginx配置
```bash
# 创建配置文件
cat > /etc/nginx/sites-available/bountyhunterguild.com << 'EOF'
# 上游服务器配置
upstream frontend {
    server 127.0.0.1:3000;
    keepalive 32;
}

upstream backend {
    server 127.0.0.1:3001;
    keepalive 32;
}

# HTTP重定向到HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name bountyhunterguild.com www.bountyhunterguild.com admin.bountyhunterguild.com;
    
    # Let's Encrypt验证
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # 重定向到HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS主配置
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name bountyhunterguild.com www.bountyhunterguild.com;
    
    # SSL证书配置（稍后配置）
    # ssl_certificate /etc/letsencrypt/live/bountyhunterguild.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/bountyhunterguild.com/privkey.pem;
    
    # 临时SSL配置（自签名证书）
    ssl_certificate /etc/ssl/certs/ssl-cert-snakeoil.pem;
    ssl_certificate_key /etc/ssl/private/ssl-cert-snakeoil.key;
    
    # SSL安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # 安全头
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # 客户端最大请求体大小
    client_max_body_size 10M;
    
    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    
    # 前端静态文件
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # API代理
    location /api {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # WebSocket代理
    location /ws {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://frontend;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# 管理后台子域名
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name admin.bountyhunterguild.com;
    
    # SSL证书配置（稍后配置）
    # ssl_certificate /etc/letsencrypt/live/bountyhunterguild.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/bountyhunterguild.com/privkey.pem;
    
    # 临时SSL配置
    ssl_certificate /etc/ssl/certs/ssl-cert-snakeoil.pem;
    ssl_certificate_key /etc/ssl/private/ssl-cert-snakeoil.key;
    
    # SSL安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # 安全头
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # 管理后台访问控制
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
```

### 2. 启用站点
```bash
# 启用站点
ln -sf /etc/nginx/sites-available/bountyhunterguild.com /etc/nginx/sites-enabled/

# 删除默认站点
rm -f /etc/nginx/sites-enabled/default

# 测试配置
nginx -t

# 重载配置
systemctl reload nginx
```

## 🔒 第八步：配置SSL证书

### 1. 安装Certbot
```bash
# 安装Certbot
apt install -y certbot python3-certbot-nginx

# 创建webroot目录
mkdir -p /var/www/html
```

### 2. 获取SSL证书
```bash
# 获取SSL证书
certbot --nginx -d bountyhunterguild.com -d www.bountyhunterguild.com -d admin.bountyhunterguild.com

# 按照提示操作：
# 1. 输入邮箱地址
# 2. 同意服务条款
# 3. 选择是否接收邮件通知
# 4. 等待证书申请完成
```

### 3. 设置自动续期
```bash
# 设置定时任务
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -

# 测试续期
certbot renew --dry-run
```

## 🔥 第九步：配置防火墙

### 1. 配置UFW防火墙
```bash
# 启用防火墙
ufw --force enable

# 允许SSH
ufw allow 22

# 允许HTTP
ufw allow 80

# 允许HTTPS
ufw allow 443

# 查看状态
ufw status
```

## 🧪 第十步：测试部署

### 1. 检查服务状态
```bash
# 检查Docker服务
docker-compose ps

# 检查Nginx服务
systemctl status nginx

# 检查SSL证书
certbot certificates
```

### 2. 测试网站访问
```bash
# 测试HTTP重定向
curl -I http://bountyhunterguild.com

# 测试HTTPS访问
curl -I https://bountyhunterguild.com

# 测试API接口
curl -I https://bountyhunterguild.com/api/health
```

### 3. 浏览器测试
- 访问 https://bountyhunterguild.com
- 访问 https://www.bountyhunterguild.com
- 访问 https://admin.bountyhunterguild.com
- 测试所有功能

## 📊 第十一步：配置监控

### 1. 创建监控脚本
```bash
cat > /root/monitor.sh << 'EOF'
#!/bin/bash

# 系统监控脚本
LOG_FILE="/var/log/bounty-hunter-monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$DATE] 开始系统监控..." >> $LOG_FILE

# 检查Docker服务
if ! docker-compose ps | grep -q "Up"; then
    echo "[$DATE] ERROR: Docker服务异常" >> $LOG_FILE
    cd /root/bounty-hunter-platform
    docker-compose restart
fi

# 检查Nginx服务
if ! systemctl is-active --quiet nginx; then
    echo "[$DATE] ERROR: Nginx服务异常" >> $LOG_FILE
    systemctl restart nginx
fi

# 检查磁盘空间
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "[$DATE] WARNING: 磁盘使用率过高: $DISK_USAGE%" >> $LOG_FILE
fi

# 检查内存使用
MEM_USAGE=$(free | awk 'NR==2{printf "%.2f", $3*100/$2}')
if (( $(echo "$MEM_USAGE > 80" | bc -l) )); then
    echo "[$DATE] WARNING: 内存使用率过高: $MEM_USAGE%" >> $LOG_FILE
fi

echo "[$DATE] 系统监控完成" >> $LOG_FILE
EOF

chmod +x /root/monitor.sh
```

### 2. 设置定时任务
```bash
# 每5分钟执行一次监控
echo "*/5 * * * * /root/monitor.sh" | crontab -

# 查看定时任务
crontab -l
```

## 🎉 部署完成！

### 访问地址
- **主站**: https://bountyhunterguild.com
- **www**: https://www.bountyhunterguild.com
- **管理后台**: https://admin.bountyhunterguild.com
- **API**: https://bountyhunterguild.com/api

### 默认账户
- **管理员邮箱**: admin@bounty-hunter.com
- **默认密码**: admin123
- **⚠️ 请立即修改默认密码！**

### 下一步操作
1. **修改默认密码**
2. **配置支付服务**
3. **设置邮件服务**
4. **开始运营推广**

## 🛠️ 故障排除

### 常见问题

#### 1. 服务启动失败
```bash
# 检查Docker服务
systemctl status docker

# 查看容器日志
docker-compose logs

# 重启服务
docker-compose restart
```

#### 2. 域名无法访问
```bash
# 检查DNS解析
nslookup bountyhunterguild.com

# 检查Nginx状态
systemctl status nginx

# 检查防火墙
ufw status
```

#### 3. SSL证书问题
```bash
# 检查证书状态
certbot certificates

# 手动续期
certbot renew --dry-run
```

## 📞 技术支持

### Hostinger支持
- **技术支持**: https://www.hostinger.com/help
- **在线聊天**: 24/7在线支持
- **知识库**: https://support.hostinger.com

### 项目支持
- **GitHub Issues**: 技术问题
- **Discord**: 实时交流
- **QQ群**: 中文支持

---

## 🚀 开始运营！

恭喜！您的赏金猎人任务平台已经成功部署到Hostinger！

现在可以开始：
1. 修改默认密码
2. 配置支付服务
3. 设置邮件服务
4. 开始运营推广

祝您运营顺利！🎉
