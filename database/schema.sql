-- 赏金猎人任务平台 - 数据库结构
-- 支持 PostgreSQL 和 MongoDB

-- ============================================
-- 用户表 (Users Table)
-- ============================================
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    wallet_balance DECIMAL(10,2) DEFAULT 0.00,
    reputation_score DECIMAL(3,2) DEFAULT 5.00,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户认证表 (用于扩展登录方式)
CREATE TABLE user_auth_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'email', 'google', 'facebook'
    provider_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户会话表 (用于JWT token管理)
CREATE TABLE user_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_user_sessions_token ON user_sessions(token_hash);
CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);

-- ============================================
-- MongoDB 等效结构 (JSON Schema)
-- ============================================
/*
{
  "users": {
    "_id": "ObjectId",
    "email": "String (unique)",
    "password_hash": "String",
    "name": "String",
    "avatar_url": "String",
    "phone": "String",
    "role": "String (enum: ['user', 'admin', 'moderator'])",
    "wallet_balance": "Decimal",
    "reputation_score": "Decimal",
    "is_verified": "Boolean",
    "is_active": "Boolean",
    "last_login": "Date",
    "created_at": "Date",
    "updated_at": "Date",
    "auth_providers": [
      {
        "provider": "String",
        "provider_id": "String"
      }
    ],
    "sessions": [
      {
        "token_hash": "String",
        "expires_at": "Date"
      }
    ]
  }
}
*/
