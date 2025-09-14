#!/bin/bash

# 赏金猎人任务平台快速启动脚本
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
    apt install -y curl wget git vim htop unzip
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
    
    PROJECT_DIR="/opt/bounty-hunter"
    mkdir -p $PROJECT_DIR
    cd $PROJECT_DIR
    
    log_success "项目目录创建完成: $PROJECT_DIR"
}

# 下载项目文件
download_project() {
    log_info "下载项目文件..."
    
    # 这里需要您提供项目的下载链接
    # 或者手动上传项目文件到服务器
    
    log_warning "请手动上传项目文件到 $PROJECT_DIR"
    log_info "您可以使用以下命令上传文件:"
    log_info "scp -r bounty-hunter-platform/ root@your-server-ip:/opt/bounty-hunter/"
    
    # 等待用户确认
    read -p "文件上传完成后，按Enter继续..."
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
JWT_SECRET=bounty-hunter-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# 前端配置
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_WS_URL=ws://localhost:3001/ws
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

# 构建和启动服务
build_and_start() {
    log_info "构建和启动服务..."
    
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

# 配置Nginx
configure_nginx() {
    log_info "配置Nginx..."
    
    cat > /etc/nginx/sites-available/bounty-hunter << EOF
server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
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
}
EOF

    # 启用站点
    ln -sf /etc/nginx/sites-available/bounty-hunter /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    nginx -t
    systemctl reload nginx
    
    log_success "Nginx配置完成"
}

# 显示完成信息
show_completion() {
    log_success "部署完成！"
    echo ""
    echo "=========================================="
    echo "🎉 赏金猎人任务平台部署成功！"
    echo "=========================================="
    echo ""
    echo "访问地址: http://$(curl -s ifconfig.me)"
    echo "管理后台: http://$(curl -s ifconfig.me)/admin"
    echo ""
    echo "默认管理员账户:"
    echo "邮箱: admin@bounty-hunter.com"
    echo "密码: admin123"
    echo ""
    echo "⚠️  请立即修改默认密码！"
    echo ""
    echo "下一步操作:"
    echo "1. 配置域名和SSL证书"
    echo "2. 修改默认密码"
    echo "3. 配置支付服务"
    echo "4. 开始运营推广"
    echo ""
    echo "技术支持: 查看 DEPLOYMENT_GUIDE.md"
    echo "运营指南: 查看 OPERATION_GUIDE.md"
    echo ""
}

# 主函数
main() {
    echo "=========================================="
    echo "🚀 赏金猎人任务平台快速启动脚本"
    echo "=========================================="
    echo ""
    
    check_root
    check_system
    update_system
    install_dependencies
    install_docker
    install_docker_compose
    install_nginx
    configure_firewall
    create_project_directory
    download_project
    configure_environment
    build_and_start
    configure_nginx
    show_completion
}

# 执行主函数
main "$@"
