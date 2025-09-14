#!/bin/bash

# Hostinger + bountyhunterguild.com 专用部署脚本
# 适用于Ubuntu 20.04+系统

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否为root用户
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "请使用root用户运行此脚本"
        exit 1
    fi
}

# 检查系统
check_system() {
    log_info "检查系统环境..."
    
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
    else
        log_error "无法检测操作系统"
        exit 1
    fi
    
    log_success "系统: $OS $VER"
}

# 更新系统
update_system() {
    log_info "更新系统包..."
    apt update && apt upgrade -y
    log_success "系统更新完成"
}

# 安装基础依赖
install_dependencies() {
    log_info "安装基础依赖..."
    apt install -y curl wget git vim htop unzip bc
    log_success "基础依赖安装完成"
}

# 安装Docker
install_docker() {
    log_info "安装Docker..."
    
    if command -v docker &> /dev/null; then
        log_warning "Docker已安装"
        return
    fi
    
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    
    # 启动Docker服务
    systemctl start docker
    systemctl enable docker
    
    log_success "Docker安装完成"
}

# 安装Docker Compose
install_docker_compose() {
    log_info "安装Docker Compose..."
    
    if command -v docker-compose &> /dev/null; then
        log_warning "Docker Compose已安装"
        return
    fi
    
    curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    log_success "Docker Compose安装完成"
}

# 安装Nginx
install_nginx() {
    log_info "安装Nginx..."
    
    if command -v nginx &> /dev/null; then
        log_warning "Nginx已安装"
        return
    fi
    
    apt install -y nginx
    systemctl start nginx
    systemctl enable nginx
    
    log_success "Nginx安装完成"
}

# 安装Certbot
install_certbot() {
    log_info "安装Certbot..."
    
    if command -v certbot &> /dev/null; then
        log_warning "Certbot已安装"
        return
    fi
    
    apt install -y certbot python3-certbot-nginx
    
    log_success "Certbot安装完成"
}

# 配置防火墙
configure_firewall() {
    log_info "配置防火墙..."
    
    if command -v ufw &> /dev/null; then
        ufw --force enable
        ufw allow 22
        ufw allow 80
        ufw allow 443
        log_success "防火墙配置完成"
    else
        log_warning "UFW未安装，跳过防火墙配置"
    fi
}

# 创建项目目录
create_project_directory() {
    log_info "创建项目目录..."
    
    PROJECT_DIR="/root/bounty-hunter-platform"
    mkdir -p $PROJECT_DIR
    cd $PROJECT_DIR
    
    log_success "项目目录创建完成: $PROJECT_DIR"
}

# 配置环境变量
configure_environment() {
    log_info "配置环境变量..."
    
    cat > .env << EOF
# 生产环境配置
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
JWT_SECRET=bounty-hunter-guild-super-secret-jwt-key-2024-$(date +%s)
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
EOF

    log_success "环境变量配置完成"
}

# 配置Nginx
configure_nginx() {
    log_info "配置Nginx..."
    
    # 创建webroot目录
    mkdir -p /var/www/html
    
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

    # 启用站点
    ln -sf /etc/nginx/sites-available/bountyhunterguild.com /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    nginx -t
    systemctl reload nginx
    
    log_success "Nginx配置完成"
}

# 构建和启动服务
build_and_start() {
    log_info "构建和启动服务..."
    
    # 检查项目文件是否存在
    if [ ! -f "package.json" ]; then
        log_error "项目文件不存在，请先上传项目文件到 $PROJECT_DIR"
        log_info "您可以使用以下命令上传文件:"
        log_info "scp -r bounty-hunter-platform-complete.zip root@YOUR_VPS_IP:/root/"
        log_info "然后解压: unzip bounty-hunter-platform-complete.zip"
        exit 1
    fi
    
    # 构建前端
    log_info "构建前端应用..."
    npm install
    npm run build
    
    # 启动Docker服务
    log_info "启动Docker服务..."
    docker-compose up -d --build
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 30
    
    # 检查服务状态
    if docker-compose ps | grep -q "Up"; then
        log_success "服务启动成功"
    else
        log_error "服务启动失败"
        docker-compose logs
        exit 1
    fi
}

# 配置SSL证书
configure_ssl() {
    log_info "配置SSL证书..."
    
    # 获取SSL证书
    certbot --nginx -d bountyhunterguild.com -d www.bountyhunterguild.com -d admin.bountyhunterguild.com --non-interactive --agree-tos --email admin@bountyhunterguild.com
    
    # 设置自动续期
    echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
    
    log_success "SSL证书配置完成"
}

# 创建监控脚本
create_monitoring() {
    log_info "创建监控脚本..."
    
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
    
    # 设置定时任务
    echo "*/5 * * * * /root/monitor.sh" | crontab -
    
    log_success "监控配置完成"
}

# 显示完成信息
show_completion() {
    log_success "部署完成！"
    echo ""
    echo "=========================================="
    echo "🎉 赏金猎人任务平台部署成功！"
    echo "=========================================="
    echo ""
    echo "访问地址:"
    echo "主站: https://bountyhunterguild.com"
    echo "www: https://www.bountyhunterguild.com"
    echo "管理后台: https://admin.bountyhunterguild.com"
    echo ""
    echo "默认管理员账户:"
    echo "邮箱: admin@bounty-hunter.com"
    echo "密码: admin123"
    echo ""
    echo "⚠️  请立即修改默认密码！"
    echo ""
    echo "下一步操作:"
    echo "1. 配置支付服务"
    echo "2. 设置邮件服务"
    echo "3. 开始运营推广"
    echo ""
    echo "技术支持: 查看 HOSTINGER_DEPLOYMENT_GUIDE.md"
    echo "运营指南: 查看 OPERATION_GUIDE.md"
    echo ""
}

# 主函数
main() {
    echo "=========================================="
    echo "🚀 Hostinger + bountyhunterguild.com 部署脚本"
    echo "=========================================="
    echo ""
    
    check_root
    check_system
    update_system
    install_dependencies
    install_docker
    install_docker_compose
    install_nginx
    install_certbot
    configure_firewall
    create_project_directory
    configure_environment
    configure_nginx
    build_and_start
    configure_ssl
    create_monitoring
    show_completion
}

# 执行主函数
main "$@"
