// 免费部署配置脚本
// 用于Vercel + Supabase部署

const fs = require('fs');
const path = require('path');

// 配置信息
const config = {
  // Supabase配置
  supabase: {
    url: 'https://your-project.supabase.co',
    anonKey: 'your-anon-key',
    serviceKey: 'your-service-key'
  },
  
  // Vercel配置
  vercel: {
    projectName: 'bounty-hunter-platform',
    domain: 'bountyhunterguild.com'
  },
  
  // 应用配置
  app: {
    name: '赏金猎人任务平台',
    description: '专业的任务发布和接单平台',
    version: '1.0.0'
  }
};

// 创建Vercel配置文件
function createVercelConfig() {
  const vercelConfig = {
    version: 2,
    builds: [
      {
        src: 'package.json',
        use: '@vercel/static-build',
        config: {
          distDir: 'dist'
        }
      }
    ],
    routes: [
      {
        src: '/api/(.*)',
        dest: '/api/$1'
      },
      {
        src: '/(.*)',
        dest: '/$1'
      }
    ],
    env: {
      SUPABASE_URL: config.supabase.url,
      SUPABASE_ANON_KEY: config.supabase.anonKey,
      SUPABASE_SERVICE_KEY: config.supabase.serviceKey,
      NODE_ENV: 'production'
    }
  };
  
  fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
  console.log('✅ Vercel配置文件已创建');
}

// 创建Supabase配置文件
function createSupabaseConfig() {
  const supabaseConfig = {
    supabase: {
      url: config.supabase.url,
      anonKey: config.supabase.anonKey,
      serviceKey: config.supabase.serviceKey
    }
  };
  
  fs.writeFileSync('supabase.json', JSON.stringify(supabaseConfig, null, 2));
  console.log('✅ Supabase配置文件已创建');
}

// 创建环境变量文件
function createEnvFile() {
  const envContent = `# 生产环境配置
NODE_ENV=production

# Supabase配置
SUPABASE_URL=${config.supabase.url}
SUPABASE_ANON_KEY=${config.supabase.anonKey}
SUPABASE_SERVICE_KEY=${config.supabase.serviceKey}

# 应用配置
APP_NAME=${config.app.name}
APP_DESCRIPTION=${config.app.description}
APP_VERSION=${config.app.version}

# 域名配置
DOMAIN=${config.vercel.domain}
API_URL=https://${config.vercel.domain}/api

# 安全配置
JWT_SECRET=bounty-hunter-guild-super-secret-jwt-key-2024
SESSION_SECRET=bounty-hunter-guild-session-secret-key

# 文件上传配置
MAX_FILE_SIZE=10485760
UPLOAD_DIR=/tmp/uploads

# 邮件配置（可选）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# 支付配置（可选）
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
`;
  
  fs.writeFileSync('.env.production', envContent);
  console.log('✅ 环境变量文件已创建');
}

// 创建部署脚本
function createDeployScript() {
  const deployScript = `#!/bin/bash

# 免费部署脚本
echo "🚀 开始免费部署..."

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 请先安装Node.js"
    exit 1
fi

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "❌ 请先安装npm"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖..."
npm install

# 构建项目
echo "🔨 构建项目..."
npm run build

# 检查构建结果
if [ ! -d "dist" ]; then
    echo "❌ 构建失败"
    exit 1
fi

echo "✅ 构建完成"
echo "📋 下一步操作："
echo "1. 将项目推送到GitHub"
echo "2. 在Vercel中导入项目"
echo "3. 配置环境变量"
echo "4. 部署项目"
echo ""
echo "🎉 免费部署准备完成！"
`;
  
  fs.writeFileSync('deploy.sh', deployScript);
  fs.chmodSync('deploy.sh', '755');
  console.log('✅ 部署脚本已创建');
}

// 创建README文件
function createReadme() {
  const readmeContent = `# 🆓 赏金猎人任务平台 - 免费部署版

## 🎯 部署方案
- **前端**: Vercel (免费)
- **后端**: Vercel Functions (免费)
- **数据库**: Supabase (免费)
- **域名**: 可以绑定自定义域名
- **总成本**: 0元

## 🚀 快速部署

### 1. 准备环境
\`\`\`bash
# 安装Node.js (如果未安装)
# 访问 https://nodejs.org 下载安装

# 检查安装
node --version
npm --version
\`\`\`

### 2. 配置项目
\`\`\`bash
# 运行配置脚本
node free-deploy-setup.js

# 安装依赖
npm install

# 构建项目
npm run build
\`\`\`

### 3. 部署到Vercel
1. 将项目推送到GitHub
2. 访问 https://vercel.com
3. 导入GitHub项目
4. 配置环境变量
5. 部署项目

### 4. 配置Supabase
1. 访问 https://supabase.com
2. 创建新项目
3. 获取API密钥
4. 更新环境变量

## 📋 环境变量配置

在Vercel项目设置中添加以下环境变量：

\`\`\`
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret
\`\`\`

## 🌍 自定义域名

### 1. 在Vercel中添加域名
1. 进入项目设置
2. 点击 "Domains"
3. 添加 bountyhunterguild.com

### 2. 配置DNS记录
\`\`\`
类型: CNAME
名称: @
值: cname.vercel-dns.com
\`\`\`

## 📊 免费额度

### Vercel免费额度
- 带宽: 100GB/月
- 构建时间: 6000分钟/月
- 函数执行: 100GB-小时/月

### Supabase免费额度
- 数据库: 500MB存储
- API请求: 50,000次/月
- 认证用户: 50,000个

## 🎉 部署完成

部署完成后，您的网站将可以通过以下地址访问：
- 主站: https://bountyhunterguild.com
- 管理后台: https://bountyhunterguild.com/admin

## 📞 技术支持

- **Vercel文档**: https://vercel.com/docs
- **Supabase文档**: https://supabase.com/docs
- **项目文档**: 查看项目中的.md文件

---

**完全免费，开始您的创业之旅！** 🚀
`;
  
  fs.writeFileSync('README-FREE-DEPLOY.md', readmeContent);
  console.log('✅ README文件已创建');
}

// 主函数
function main() {
  console.log('🚀 开始创建免费部署配置...');
  
  try {
    createVercelConfig();
    createSupabaseConfig();
    createEnvFile();
    createDeployScript();
    createReadme();
    
    console.log('');
    console.log('🎉 免费部署配置创建完成！');
    console.log('');
    console.log('📋 下一步操作：');
    console.log('1. 修改配置文件中的Supabase信息');
    console.log('2. 运行: npm install');
    console.log('3. 运行: npm run build');
    console.log('4. 将项目推送到GitHub');
    console.log('5. 在Vercel中导入项目');
    console.log('6. 配置环境变量');
    console.log('7. 部署项目');
    console.log('');
    console.log('🎯 完全免费，开始您的创业之旅！');
    
  } catch (error) {
    console.error('❌ 配置创建失败:', error.message);
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = { config, createVercelConfig, createSupabaseConfig, createEnvFile };
