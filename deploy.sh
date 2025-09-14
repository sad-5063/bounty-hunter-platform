#!/bin/bash

# 赏金猎人任务平台部署脚本
# 支持 Ubuntu/CentOS 系统

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# 检查系统
check_system() {
    log_info "检查系统环境..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command -v apt-get &> /dev/null; then
            OS="ubuntu"
        elif command -v yum &> /dev/null; then
            OS="centos"
        else
            log_error "不支持的操作系统"
            exit 1
        fi
    else
        log_error "仅支持 Linux 系统"
        exit 1
    fi
    
    log_success "系统检查完成: $OS"
}

# 安装依赖
install_dependencies() {
    log_info "安装系统依赖..."
    
    if [[ "$OS" == "ubuntu" ]]; then
        sudo apt-get update
        sudo apt-get install -y curl wget git nginx docker.io docker-compose certbot python3-certbot-nginx
    elif [[ "$OS" == "centos" ]]; then
        sudo yum update -y
        sudo yum install -y curl wget git nginx docker docker-compose certbot python3-certbot-nginx
    fi
    
    # 启动 Docker
    sudo systemctl start docker
    sudo systemctl enable docker
    
    # 启动 Nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
    
    log_success "依赖安装完成"
}

# 配置防火墙
configure_firewall() {
    log_info "配置防火墙..."
    
    if command -v ufw &> /dev/null; then
        sudo ufw allow 22
        sudo ufw allow 80
        sudo ufw allow 443
        sudo ufw --force enable
    elif command -v firewall-cmd &> /dev/null; then
        sudo firewall-cmd --permanent --add-service=ssh
        sudo firewall-cmd --permanent --add-service=http
        sudo firewall-cmd --permanent --add-service=https
        sudo firewall-cmd --reload
    fi
    
    log_success "防火墙配置完成"
}

# 创建项目目录
create_project_directory() {
    log_info "创建项目目录..."
    
    PROJECT_DIR="/opt/bounty-hunter"
    sudo mkdir -p $PROJECT_DIR
    sudo chown $USER:$USER $PROJECT_DIR
    
    log_success "项目目录创建完成: $PROJECT_DIR"
}

# 克隆项目代码
clone_project() {
    log_info "克隆项目代码..."
    
    if [ -d "$PROJECT_DIR/.git" ]; then
        cd $PROJECT_DIR
        git pull origin main
    else
        git clone https://github.com/your-username/bounty-hunter-platform.git $PROJECT_DIR
    fi
    
    cd $PROJECT_DIR
    log_success "项目代码更新完成"
}

# 配置环境变量
configure_environment() {
    log_info "配置环境变量..."
    
    cat > $PROJECT_DIR/.env << EOF
# 生产环境配置
NODE_ENV=production
PORT=3001

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
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

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

# 前端配置
REACT_APP_API_URL=https://your-domain.com/api
REACT_APP_WS_URL=wss://your-domain.com/ws
EOF

    log_success "环境变量配置完成"
}

# 构建和启动服务
build_and_start() {
    log_info "构建和启动服务..."
    
    cd $PROJECT_DIR
    
    # 构建前端
    log_info "构建前端应用..."
    npm install
    npm run build
    
    # 启动 Docker 服务
    log_info "启动 Docker 服务..."
    docker-compose down
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

# 配置 Nginx
configure_nginx() {
    log_info "配置 Nginx..."
    
    cat > /etc/nginx/sites-available/bounty-hunter << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # 重定向到 HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL 证书配置
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # 安全头
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # 前端静态文件
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # API 代理
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # WebSocket 代理
    location /ws {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
EOF

    # 启用站点
    sudo ln -sf /etc/nginx/sites-available/bounty-hunter /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl reload nginx
    
    log_success "Nginx 配置完成"
}

# 配置 SSL 证书
configure_ssl() {
    log_info "配置 SSL 证书..."
    
    read -p "请输入您的域名: " DOMAIN
    
    if [ -z "$DOMAIN" ]; then
        log_warning "跳过 SSL 证书配置"
        return
    fi
    
    # 获取 SSL 证书
    sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
    
    # 设置自动续期
    echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
    
    log_success "SSL 证书配置完成"
}

# 配置监控
configure_monitoring() {
    log_info "配置系统监控..."
    
    # 安装 htop
    if [[ "$OS" == "ubuntu" ]]; then
        sudo apt-get install -y htop iotop
    elif [[ "$OS" == "centos" ]]; then
        sudo yum install -y htop iotop
    fi
    
    # 创建监控脚本
    cat > $PROJECT_DIR/monitor.sh << 'EOF'
#!/bin/bash

# 系统监控脚本
LOG_FILE="/var/log/bounty-hunter-monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# 检查服务状态
check_services() {
    echo "[$DATE] 检查服务状态..." >> $LOG_FILE
    
    # 检查 Docker 服务
    if ! docker-compose ps | grep -q "Up"; then
        echo "[$DATE] ERROR: Docker 服务异常" >> $LOG_FILE
        # 重启服务
        cd /opt/bounty-hunter
        docker-compose restart
    fi
    
    # 检查 Nginx
    if ! systemctl is-active --quiet nginx; then
        echo "[$DATE] ERROR: Nginx 服务异常" >> $LOG_FILE
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
}

check_services
EOF

    chmod +x $PROJECT_DIR/monitor.sh
    
    # 设置定时任务
    echo "*/5 * * * * $PROJECT_DIR/monitor.sh" | sudo crontab -
    
    log_success "监控配置完成"
}

# 配置备份
configure_backup() {
    log_info "配置数据备份..."
    
    cat > $PROJECT_DIR/backup.sh << 'EOF'
#!/bin/bash

# 数据备份脚本
BACKUP_DIR="/opt/backups"
DATE=$(date '+%Y%m%d_%H%M%S')

mkdir -p $BACKUP_DIR

# 备份数据库
docker-compose exec -T postgres pg_dump -U bounty_user bounty_hunter > $BACKUP_DIR/database_$DATE.sql

# 备份上传文件
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /opt/bounty-hunter/uploads

# 备份配置文件
tar -czf $BACKUP_DIR/config_$DATE.tar.gz /opt/bounty-hunter/.env /etc/nginx/sites-available/bounty-hunter

# 删除7天前的备份
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "备份完成: $DATE"
EOF

    chmod +x $PROJECT_DIR/backup.sh
    
    # 设置每日备份
    echo "0 2 * * * $PROJECT_DIR/backup.sh" | sudo crontab -
    
    log_success "备份配置完成"
}

# 主函数
main() {
    log_info "开始部署赏金猎人任务平台..."
    
    check_system
    install_dependencies
    configure_firewall
    create_project_directory
    clone_project
    configure_environment
    build_and_start
    configure_nginx
    configure_ssl
    configure_monitoring
    configure_backup
    
    log_success "部署完成！"
    log_info "访问地址: https://your-domain.com"
    log_info "管理后台: https://your-domain.com/admin"
    log_info "监控日志: /var/log/bounty-hunter-monitor.log"
    log_info "备份目录: /opt/backups"
}

# 执行主函数
main "$@"
