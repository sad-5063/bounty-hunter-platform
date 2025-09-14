# 🚀 bountyhunterguild.com 实际部署步骤

## 📋 部署前准备

### 需要的信息
- **Hostinger VPS IP地址**: 从Hostinger控制面板获取
- **Hostinger账户**: 登录凭据
- **域名**: bountyhunterguild.com
- **项目文件**: bounty-hunter-platform-complete.zip

## 🌐 第一步：配置DNS记录

### 1. 登录Hostinger控制面板
1. 访问 https://hpanel.hostinger.com
2. 使用您的账户登录
3. 进入域名管理页面

### 2. 获取VPS IP地址
1. 在Hostinger控制面板中找到您的VPS
2. 记录VPS的IP地址（例如：192.168.1.100）
3. 这个IP地址将用于DNS配置

### 3. 配置DNS记录
在域名管理页面中，添加以下DNS记录：

```bash
# A记录配置
类型: A
名称: @
值: YOUR_VPS_IP_ADDRESS
TTL: 3600

类型: A
名称: www
值: YOUR_VPS_IP_ADDRESS
TTL: 3600

类型: A
名称: admin
值: YOUR_VPS_IP_ADDRESS
TTL: 3600
```

### 4. 验证DNS配置
等待5-15分钟后，使用以下命令验证：
```bash
nslookup bountyhunterguild.com
nslookup www.bountyhunterguild.com
nslookup admin.bountyhunterguild.com
```

## 🖥️ 第二步：连接VPS

### 1. 获取SSH连接信息
从Hostinger控制面板获取：
- **IP地址**: VPS的IP地址
- **用户名**: 通常是root
- **密码**: VPS的root密码

### 2. 连接VPS
```bash
# 使用SSH连接
ssh root@YOUR_VPS_IP_ADDRESS

# 输入密码（从Hostinger控制面板获取）
```

### 3. 验证连接
```bash
# 检查系统信息
uname -a
cat /etc/os-release

# 检查网络连接
ping google.com
```

## 📦 第三步：上传项目文件

### 方法1：使用SCP上传（推荐）
在本地计算机上执行：
```bash
# Windows PowerShell
scp bounty-hunter-platform-complete.zip root@YOUR_VPS_IP_ADDRESS:/root/

# 输入VPS密码
```

### 方法2：使用wget下载
如果项目文件在GitHub上：
```bash
# 在VPS上执行
cd /root
wget https://github.com/your-username/bounty-hunter-platform/releases/download/v1.0.0/bounty-hunter-platform-complete.zip
```

### 方法3：使用Git克隆
```bash
# 在VPS上执行
cd /root
git clone https://github.com/your-username/bounty-hunter-platform.git
```

## 🚀 第四步：运行部署脚本

### 1. 解压项目文件
```bash
# 在VPS上执行
cd /root
unzip bounty-hunter-platform-complete.zip
cd bounty-hunter-platform
```

### 2. 运行部署脚本
```bash
# 给脚本执行权限
chmod +x hostinger-deploy.sh

# 运行部署脚本
sudo ./hostinger-deploy.sh
```

### 3. 监控部署过程
脚本将自动执行以下操作：
- 更新系统包
- 安装Docker和Docker Compose
- 安装Nginx
- 安装Certbot
- 配置防火墙
- 配置环境变量
- 配置Nginx
- 构建和启动服务
- 配置SSL证书
- 创建监控脚本

## 🔒 第五步：配置SSL证书

### 1. 自动配置
部署脚本会自动配置SSL证书，但您需要：
- 输入邮箱地址
- 同意服务条款
- 选择是否接收邮件通知

### 2. 手动配置（如果需要）
```bash
# 获取SSL证书
certbot --nginx -d bountyhunterguild.com -d www.bountyhunterguild.com -d admin.bountyhunterguild.com

# 设置自动续期
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
```

## 🧪 第六步：测试部署

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
- 测试用户注册、登录功能
- 测试任务发布、接单功能

## 🔧 第七步：配置管理

### 1. 修改默认密码
```bash
# 登录管理后台
# 访问 https://admin.bountyhunterguild.com
# 使用默认账户登录：
# 邮箱: admin@bounty-hunter.com
# 密码: admin123
# 立即修改密码
```

### 2. 配置支付服务
```bash
# 编辑环境变量
vim /root/bounty-hunter-platform/.env

# 配置PayPal
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret

# 重启服务
cd /root/bounty-hunter-platform
docker-compose restart
```

### 3. 配置邮件服务
```bash
# 编辑环境变量
vim /root/bounty-hunter-platform/.env

# 配置SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# 重启服务
docker-compose restart
```

## 📊 第八步：监控和维护

### 1. 查看服务日志
```bash
# 查看所有服务日志
docker-compose logs

# 查看特定服务日志
docker-compose logs frontend
docker-compose logs backend
docker-compose logs postgres
```

### 2. 监控系统资源
```bash
# 查看系统资源使用
htop
df -h
free -h

# 查看Docker容器状态
docker stats
```

### 3. 设置监控告警
```bash
# 查看监控日志
tail -f /var/log/bounty-hunter-monitor.log

# 设置邮件告警（可选）
# 配置邮件服务后，监控脚本会自动发送告警邮件
```

## 🚨 故障排除

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

## 🎉 部署完成

### 访问地址
- **主站**: https://bountyhunterguild.com
- **www**: https://www.bountyhunterguild.com
- **管理后台**: https://admin.bountyhunterguild.com

### 默认账户
- **管理员邮箱**: admin@bounty-hunter.com
- **默认密码**: admin123
- **⚠️ 请立即修改默认密码！**

### 下一步操作
1. **修改默认密码**
2. **配置支付服务**
3. **设置邮件服务**
4. **开始运营推广**

---

## 🚀 立即开始部署！

现在就开始您的部署之旅：

1. **配置DNS记录** - 在Hostinger控制面板操作
2. **连接VPS** - 使用SSH连接服务器
3. **上传项目文件** - 使用SCP或wget
4. **运行部署脚本** - 执行hostinger-deploy.sh
5. **测试功能** - 确保所有功能正常

祝您部署顺利！🎉

