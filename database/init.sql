-- 赏金猎人任务平台数据库初始化脚本
-- PostgreSQL 版本

-- 创建数据库（如果不存在）
-- CREATE DATABASE bounty_hunter;

-- 连接到数据库
-- \c bounty_hunter;

-- 创建扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 用户系统表
-- ============================================

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500),
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    
    -- 认证状态
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified_at TIMESTAMP,
    phone_verified_at TIMESTAMP,
    
    -- 安全设置
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    last_login_at TIMESTAMP,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户认证表
CREATE TABLE IF NOT EXISTS user_verifications (
    verification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    verification_type VARCHAR(20) NOT NULL CHECK (verification_type IN ('email', 'phone', 'id')),
    verification_code VARCHAR(10),
    verification_token VARCHAR(255),
    expires_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 任务系统表
-- ============================================

-- 任务表
CREATE TABLE IF NOT EXISTS tasks (
    task_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    subcategory VARCHAR(50),
    skills TEXT[], -- 技能标签数组
    reward DECIMAL(10,2) NOT NULL CHECK (reward > 0),
    currency VARCHAR(3) DEFAULT 'CNY',
    deadline TIMESTAMP NOT NULL,
    location VARCHAR(100),
    is_remote BOOLEAN DEFAULT FALSE,
    
    -- 任务状态
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'assigned', 'in_progress', 'completed', 'cancelled', 'expired')),
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- 关联信息
    publisher_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    hunter_id UUID REFERENCES users(user_id),
    
    -- 审核信息
    is_approved BOOLEAN DEFAULT FALSE,
    approved_by UUID REFERENCES users(user_id),
    approved_at TIMESTAMP,
    rejection_reason TEXT,
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP,
    completed_at TIMESTAMP
);

-- 任务申请表
CREATE TABLE IF NOT EXISTS task_applications (
    application_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(task_id) ON DELETE CASCADE,
    hunter_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    application_message TEXT,
    proposed_reward DECIMAL(10,2),
    estimated_duration INTEGER, -- 预计完成天数
    
    -- 申请状态
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP,
    
    -- 确保一个用户只能申请一次
    UNIQUE(task_id, hunter_id)
);

-- 任务附件表
CREATE TABLE IF NOT EXISTS task_attachments (
    attachment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(task_id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size INTEGER,
    file_type VARCHAR(50),
    uploaded_by UUID REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 钱包与支付系统表
-- ============================================

-- 用户钱包表
CREATE TABLE IF NOT EXISTS user_wallets (
    wallet_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    balance DECIMAL(15,2) DEFAULT 0.00 CHECK (balance >= 0),
    frozen_balance DECIMAL(15,2) DEFAULT 0.00 CHECK (frozen_balance >= 0),
    currency VARCHAR(3) DEFAULT 'CNY',
    
    -- 支付设置
    payment_password_hash VARCHAR(255),
    payment_password_enabled BOOLEAN DEFAULT FALSE,
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, currency)
);

-- 交易记录表
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    wallet_id UUID REFERENCES user_wallets(wallet_id) ON DELETE CASCADE,
    
    -- 交易信息
    transaction_type VARCHAR(30) NOT NULL CHECK (transaction_type IN (
        'deposit', 'withdrawal', 'task_payment', 'task_reward', 
        'commission', 'refund', 'penalty', 'bonus'
    )),
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'CNY',
    balance_before DECIMAL(15,2) NOT NULL,
    balance_after DECIMAL(15,2) NOT NULL,
    
    -- 关联信息
    related_task_id UUID REFERENCES tasks(task_id),
    related_user_id UUID REFERENCES users(user_id),
    
    -- 交易状态
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    
    -- 支付信息
    payment_method VARCHAR(30),
    payment_reference VARCHAR(255),
    payment_fee DECIMAL(10,2) DEFAULT 0.00,
    
    -- 备注
    description TEXT,
    notes TEXT,
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    completed_at TIMESTAMP
);

-- ============================================
-- 评价与信誉系统表
-- ============================================

-- 任务评价表
CREATE TABLE IF NOT EXISTS task_reviews (
    review_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(task_id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    target_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- 评价内容
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    
    -- 详细评分
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    timeliness_rating INTEGER CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
    professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
    
    -- 评价类型
    review_type VARCHAR(20) NOT NULL CHECK (review_type IN ('publisher_to_hunter', 'hunter_to_publisher')),
    
    -- 状态
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'reported', 'deleted')),
    is_anonymous BOOLEAN DEFAULT FALSE,
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- 确保一个用户只能对同一个任务评价一次
    UNIQUE(task_id, reviewer_id, review_type)
);

-- 用户信誉表
CREATE TABLE IF NOT EXISTS user_reputation (
    reputation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- 信誉值
    reputation_score DECIMAL(4,2) DEFAULT 5.00 CHECK (reputation_score >= 0.00 AND reputation_score <= 10.00),
    reputation_level VARCHAR(20) DEFAULT 'newbie' CHECK (reputation_level IN ('newbie', 'bronze', 'silver', 'gold', 'platinum', 'diamond')),
    
    -- 评价统计
    total_reviews INTEGER DEFAULT 0,
    positive_reviews INTEGER DEFAULT 0,
    negative_reviews INTEGER DEFAULT 0,
    neutral_reviews INTEGER DEFAULT 0,
    
    -- 各维度评分
    avg_quality_rating DECIMAL(3,2) DEFAULT 0.00,
    avg_communication_rating DECIMAL(3,2) DEFAULT 0.00,
    avg_timeliness_rating DECIMAL(3,2) DEFAULT 0.00,
    avg_professionalism_rating DECIMAL(3,2) DEFAULT 0.00,
    
    -- 信誉徽章
    badges JSONB DEFAULT '[]',
    
    -- 状态
    is_verified BOOLEAN DEFAULT FALSE,
    last_calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id)
);

-- ============================================
-- 消息与通知系统表
-- ============================================

-- 私信表
CREATE TABLE IF NOT EXISTS private_messages (
    message_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL,
    sender_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- 消息内容
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    content TEXT NOT NULL,
    attachment_url VARCHAR(500),
    attachment_name VARCHAR(255),
    attachment_size INTEGER,
    
    -- 消息状态
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    deleted_by UUID REFERENCES users(user_id),
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 会话表
CREATE TABLE IF NOT EXISTS conversations (
    conversation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant1_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    participant2_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- 会话信息
    last_message_id UUID REFERENCES private_messages(message_id),
    last_message_at TIMESTAMP,
    unread_count_participant1 INTEGER DEFAULT 0,
    unread_count_participant2 INTEGER DEFAULT 0,
    
    -- 会话状态
    is_active BOOLEAN DEFAULT TRUE,
    is_archived BOOLEAN DEFAULT FALSE,
    archived_at TIMESTAMP,
    archived_by UUID REFERENCES users(user_id),
    
    -- 会话设置
    is_muted_participant1 BOOLEAN DEFAULT FALSE,
    is_muted_participant2 BOOLEAN DEFAULT FALSE,
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- 确保两个用户之间只有一个会话
    UNIQUE(participant1_id, participant2_id)
);

-- 系统通知表
CREATE TABLE IF NOT EXISTS system_notifications (
    notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- 通知内容
    notification_type VARCHAR(30) NOT NULL CHECK (notification_type IN (
        'task_assigned', 'task_completed', 'task_cancelled',
        'payment_received', 'payment_sent', 'payment_failed',
        'review_received', 'review_posted',
        'account_verified', 'account_suspended',
        'system_maintenance', 'new_feature', 'promotion'
    )),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    
    -- 通知数据
    data JSONB DEFAULT '{}',
    
    -- 通知状态
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    
    -- 通知设置
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    category VARCHAR(20) DEFAULT 'general' CHECK (category IN ('general', 'task', 'payment', 'account', 'system')),
    
    -- 推送设置
    push_sent BOOLEAN DEFAULT FALSE,
    push_sent_at TIMESTAMP,
    email_sent BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMP,
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- ============================================
-- 管理员后台系统表
-- ============================================

-- 管理员表
CREATE TABLE IF NOT EXISTS admins (
    admin_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- 管理员信息
    admin_name VARCHAR(100) NOT NULL,
    admin_email VARCHAR(255) UNIQUE NOT NULL,
    admin_phone VARCHAR(20),
    
    -- 权限等级
    admin_level VARCHAR(20) DEFAULT 'moderator' CHECK (admin_level IN ('super_admin', 'admin', 'moderator', 'support')),
    permissions JSONB DEFAULT '{}',
    
    -- 状态信息
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP,
    login_count INTEGER DEFAULT 0,
    
    -- 安全信息
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 系统配置表
CREATE TABLE IF NOT EXISTS system_configs (
    config_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT,
    config_type VARCHAR(20) DEFAULT 'string' CHECK (config_type IN ('string', 'number', 'boolean', 'json', 'array')),
    config_category VARCHAR(50) DEFAULT 'general' CHECK (config_category IN (
        'general', 'payment', 'task', 'user', 'notification', 'security', 'system'
    )),
    config_description TEXT,
    is_editable BOOLEAN DEFAULT TRUE,
    is_public BOOLEAN DEFAULT FALSE,
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES admins(admin_id)
);

-- ============================================
-- 创建索引
-- ============================================

-- 用户表索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_created ON users(created_at);

-- 任务表索引
CREATE INDEX IF NOT EXISTS idx_tasks_publisher ON tasks(publisher_id);
CREATE INDEX IF NOT EXISTS idx_tasks_hunter ON tasks(hunter_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline);
CREATE INDEX IF NOT EXISTS idx_tasks_created ON tasks(created_at);

-- 交易表索引
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at);

-- 评价表索引
CREATE INDEX IF NOT EXISTS idx_reviews_task ON task_reviews(task_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON task_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_target ON task_reviews(target_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON task_reviews(rating);

-- 消息表索引
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON private_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON private_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON private_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON private_messages(created_at);

-- 通知表索引
CREATE INDEX IF NOT EXISTS idx_notifications_user ON system_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON system_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON system_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON system_notifications(created_at);

-- ============================================
-- 插入默认数据
-- ============================================

-- 插入默认系统配置
INSERT INTO system_configs (config_key, config_value, config_type, config_category, config_description, is_editable, is_public) VALUES
('site_name', '赏金猎人任务平台', 'string', 'general', '网站名称', TRUE, TRUE),
('site_description', '专业的任务发布和接单平台', 'string', 'general', '网站描述', TRUE, TRUE),
('max_task_reward', '100000', 'number', 'task', '任务最大赏金金额', TRUE, FALSE),
('min_task_reward', '10', 'number', 'task', '任务最小赏金金额', TRUE, FALSE),
('task_commission_rate', '0.05', 'number', 'payment', '任务佣金费率', TRUE, FALSE),
('withdrawal_min_amount', '100', 'number', 'payment', '最小提现金额', TRUE, FALSE),
('withdrawal_max_amount', '50000', 'number', 'payment', '最大提现金额', TRUE, FALSE),
('user_verification_required', 'false', 'boolean', 'user', '是否需要用户实名认证', TRUE, FALSE),
('auto_approve_tasks', 'false', 'boolean', 'task', '是否自动审核任务', TRUE, FALSE),
('maintenance_mode', 'false', 'boolean', 'system', '维护模式开关', TRUE, TRUE),
('registration_enabled', 'true', 'boolean', 'user', '是否允许用户注册', TRUE, TRUE),
('email_notifications_enabled', 'true', 'boolean', 'notification', '是否启用邮件通知', TRUE, FALSE)
ON CONFLICT (config_key) DO NOTHING;

-- 创建默认管理员用户（密码: admin123）
INSERT INTO users (email, password_hash, name, role, is_verified, is_active) VALUES
('admin@bounty-hunter.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8K8K8K8', '系统管理员', 'admin', TRUE, TRUE)
ON CONFLICT (email) DO NOTHING;

-- 为管理员创建钱包
INSERT INTO user_wallets (user_id, balance, currency) 
SELECT user_id, 0.00, 'CNY' 
FROM users 
WHERE role = 'admin' 
ON CONFLICT (user_id, currency) DO NOTHING;

-- 为管理员创建信誉记录
INSERT INTO user_reputation (user_id, reputation_score, reputation_level, is_verified) 
SELECT user_id, 10.00, 'diamond', TRUE 
FROM users 
WHERE role = 'admin' 
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- 创建触发器
-- ============================================

-- 更新时间戳触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为相关表创建更新时间戳触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON task_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON private_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON system_notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_configs_updated_at BEFORE UPDATE ON system_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 创建视图
-- ============================================

-- 用户统计视图
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.user_id,
    u.name,
    u.email,
    u.created_at,
    COUNT(DISTINCT t1.task_id) as published_tasks,
    COUNT(DISTINCT t2.task_id) as completed_tasks,
    COUNT(DISTINCT r.review_id) as total_reviews,
    COALESCE(AVG(r.rating), 0) as avg_rating,
    COALESCE(w.balance, 0) as wallet_balance
FROM users u
LEFT JOIN tasks t1 ON u.user_id = t1.publisher_id
LEFT JOIN tasks t2 ON u.user_id = t2.hunter_id AND t2.status = 'completed'
LEFT JOIN task_reviews r ON u.user_id = r.target_id
LEFT JOIN user_wallets w ON u.user_id = w.user_id AND w.currency = 'CNY'
GROUP BY u.user_id, u.name, u.email, u.created_at, w.balance;

-- 任务统计视图
CREATE OR REPLACE VIEW task_stats AS
SELECT 
    t.task_id,
    t.title,
    t.category,
    t.reward,
    t.status,
    t.created_at,
    u1.name as publisher_name,
    u2.name as hunter_name,
    COUNT(DISTINCT a.application_id) as application_count,
    COUNT(DISTINCT r.review_id) as review_count
FROM tasks t
LEFT JOIN users u1 ON t.publisher_id = u1.user_id
LEFT JOIN users u2 ON t.hunter_id = u2.user_id
LEFT JOIN task_applications a ON t.task_id = a.task_id
LEFT JOIN task_reviews r ON t.task_id = r.task_id
GROUP BY t.task_id, t.title, t.category, t.reward, t.status, t.created_at, u1.name, u2.name;

-- ============================================
-- 完成初始化
-- ============================================

-- 输出完成信息
DO $$
BEGIN
    RAISE NOTICE '赏金猎人任务平台数据库初始化完成！';
    RAISE NOTICE '默认管理员账户: admin@bounty-hunter.com';
    RAISE NOTICE '默认密码: admin123';
    RAISE NOTICE '请在生产环境中修改默认密码！';
END $$;
