# 🌐 bountyhunterguild.com DNS配置指南

## 📋 DNS配置概览

### 域名信息
- **主域名**: bountyhunterguild.com
- **www子域名**: www.bountyhunterguild.com
- **管理后台**: admin.bountyhunterguild.com
- **API子域名**: api.bountyhunterguild.com（可选）

### 服务器信息
- **VPS IP**: YOUR_VPS_IP_ADDRESS（请替换为实际IP）
- **服务器**: Hostinger VPS
- **SSL证书**: Let's Encrypt

## 🛠️ Hostinger DNS配置步骤

### 1. 登录Hostinger控制面板
1. 访问 https://hpanel.hostinger.com
2. 使用您的账户登录
3. 进入域名管理页面

### 2. 选择域名
1. 在域名列表中找到 `bountyhunterguild.com`
2. 点击域名进入管理页面
3. 选择 "DNS Zone Editor" 或 "DNS管理"

### 3. 配置DNS记录

#### A记录配置
```bash
# 主域名A记录
类型: A
名称: @
值: YOUR_VPS_IP_ADDRESS
TTL: 3600

# www子域名A记录
类型: A
名称: www
值: YOUR_VPS_IP_ADDRESS
TTL: 3600

# admin子域名A记录
类型: A
名称: admin
值: YOUR_VPS_IP_ADDRESS
TTL: 3600
```

#### CNAME记录配置（可选）
```bash
# API子域名CNAME记录
类型: CNAME
名称: api
值: bountyhunterguild.com
TTL: 3600

# 其他子域名CNAME记录
类型: CNAME
名称: app
值: bountyhunterguild.com
TTL: 3600
```

#### MX记录配置（邮件服务）
```bash
# 邮件交换记录
类型: MX
名称: @
值: mail.bountyhunterguild.com
优先级: 10
TTL: 3600
```

#### TXT记录配置
```bash
# SPF记录（邮件认证）
类型: TXT
名称: @
值: "v=spf1 include:_spf.google.com ~all"
TTL: 3600

# DKIM记录（邮件认证）
类型: TXT
名称: default._domainkey
值: "v=DKIM1; k=rsa; p=YOUR_DKIM_PUBLIC_KEY"
TTL: 3600

# DMARC记录（邮件认证）
类型: TXT
名称: _dmarc
值: "v=DMARC1; p=quarantine; rua=mailto:dmarc@bountyhunterguild.com"
TTL: 3600
```

## 🔍 DNS配置验证

### 1. 检查DNS传播
```bash
# 使用nslookup检查
nslookup bountyhunterguild.com
nslookup www.bountyhunterguild.com
nslookup admin.bountyhunterguild.com

# 使用dig检查
dig bountyhunterguild.com
dig www.bountyhunterguild.com
dig admin.bountyhunterguild.com
```

### 2. 在线DNS检查工具
- **What's My DNS**: https://www.whatsmydns.net
- **DNS Checker**: https://dnschecker.org
- **DNSSpy**: https://dnsspy.io

### 3. 验证步骤
1. 在DNS检查工具中输入域名
2. 选择 "A" 记录类型
3. 检查全球DNS服务器是否都已更新
4. 等待所有服务器显示正确的IP地址

## ⏰ DNS传播时间

### 传播时间表
- **本地DNS**: 5-15分钟
- **全球DNS**: 15-30分钟
- **完全传播**: 最多24小时

### 影响因素
- **TTL设置**: 较低的TTL值会加快传播
- **DNS服务器**: 不同DNS服务器更新速度不同
- **地理位置**: 距离DNS服务器越远，传播时间越长

## 🚨 常见问题解决

### 1. DNS记录不生效
**问题**: 配置DNS记录后，域名无法访问
**解决方案**:
```bash
# 检查DNS记录是否正确
nslookup bountyhunterguild.com

# 清除本地DNS缓存
# Windows
ipconfig /flushdns

# macOS
sudo dscacheutil -flushcache

# Linux
sudo systemctl restart systemd-resolved
```

### 2. 子域名无法访问
**问题**: 主域名可以访问，但子域名无法访问
**解决方案**:
```bash
# 检查子域名DNS记录
nslookup www.bountyhunterguild.com
nslookup admin.bountyhunterguild.com

# 确保所有子域名都有A记录
# 或者使用CNAME记录指向主域名
```

### 3. SSL证书申请失败
**问题**: Let's Encrypt无法验证域名
**解决方案**:
```bash
# 检查DNS记录是否正确
nslookup bountyhunterguild.com

# 确保域名指向正确的IP地址
# 等待DNS完全传播后再申请SSL证书
```

## 🔧 高级DNS配置

### 1. 负载均衡配置
```bash
# 多个A记录实现负载均衡
类型: A
名称: @
值: 192.168.1.100
TTL: 300

类型: A
名称: @
值: 192.168.1.101
TTL: 300
```

### 2. 地理位置路由
```bash
# 使用Cloudflare等CDN服务
# 配置地理位置路由规则
# 将用户路由到最近的服务器
```

### 3. 故障转移配置
```bash
# 主服务器A记录
类型: A
名称: @
值: PRIMARY_SERVER_IP
TTL: 300

# 备用服务器A记录
类型: A
名称: @
值: BACKUP_SERVER_IP
TTL: 300
```

## 📊 DNS监控

### 1. 监控工具
- **Pingdom**: https://www.pingdom.com
- **UptimeRobot**: https://uptimerobot.com
- **StatusCake**: https://www.statuscake.com

### 2. 监控指标
- **DNS解析时间**: 应小于100ms
- **域名可用性**: 应大于99.9%
- **SSL证书状态**: 定期检查证书有效期

### 3. 告警设置
- **DNS解析失败**: 立即告警
- **域名无法访问**: 5分钟内告警
- **SSL证书过期**: 30天前告警

## 🎯 最佳实践

### 1. DNS记录管理
- **使用较低的TTL值**: 300-600秒
- **定期检查DNS记录**: 每月检查一次
- **备份DNS配置**: 保存DNS配置备份

### 2. 安全配置
- **启用DNSSEC**: 防止DNS劫持
- **使用HTTPS**: 确保数据传输安全
- **配置CSP**: 防止XSS攻击

### 3. 性能优化
- **使用CDN**: 加速全球访问
- **启用HTTP/2**: 提高传输效率
- **压缩静态资源**: 减少传输时间

## 📞 技术支持

### Hostinger支持
- **技术支持**: https://www.hostinger.com/help
- **在线聊天**: 24/7在线支持
- **知识库**: https://support.hostinger.com

### DNS问题排查
- **检查DNS记录**: 使用nslookup或dig
- **清除DNS缓存**: 清除本地DNS缓存
- **联系技术支持**: 如果问题持续存在

---

## 🚀 完成DNS配置

恭喜！您的DNS配置已完成！

### 下一步操作
1. **等待DNS传播**: 通常需要15-30分钟
2. **验证DNS记录**: 使用在线工具检查
3. **申请SSL证书**: 配置HTTPS访问
4. **测试网站访问**: 确保所有域名正常工作

### 访问地址
- **主站**: https://bountyhunterguild.com
- **www**: https://www.bountyhunterguild.com
- **管理后台**: https://admin.bountyhunterguild.com

祝您配置顺利！🎉

