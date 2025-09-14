-- 管理员相关表结构
-- PostgreSQL 数据库

-- 管理员操作日志表
CREATE TABLE admin_logs (
    log_id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES users(user_id),
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id INTEGER,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 系统配置表
CREATE TABLE system_configs (
    config_id SERIAL PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT,
    config_type VARCHAR(20) DEFAULT 'string' CHECK (config_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户封禁记录表
CREATE TABLE user_bans (
    ban_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    admin_id INTEGER REFERENCES users(user_id),
    reason VARCHAR(200) NOT NULL,
    ban_type VARCHAR(20) DEFAULT 'temporary' CHECK (ban_type IN ('temporary', 'permanent')),
    duration INTEGER,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    revoked_at TIMESTAMP,
    revoked_by INTEGER REFERENCES users(user_id)
);

-- 任务审核记录表
CREATE TABLE task_reviews (
    review_id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES tasks(task_id),
    admin_id INTEGER REFERENCES users(user_id),
    action VARCHAR(20) NOT NULL CHECK (action IN ('approve', 'reject', 'modify')),
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 资金审核记录表
CREATE TABLE transaction_reviews (
    review_id SERIAL PRIMARY KEY,
    transaction_id INTEGER REFERENCES transactions(transaction_id),
    admin_id INTEGER REFERENCES users(user_id),
    action VARCHAR(20) NOT NULL CHECK (action IN ('approve', 'reject', 'hold')),
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 客服工单表
CREATE TABLE support_tickets (
    ticket_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    admin_id INTEGER REFERENCES users(user_id),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    closed_at TIMESTAMP
);

-- 工单回复表
CREATE TABLE ticket_replies (
    reply_id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES support_tickets(ticket_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(user_id),
    content TEXT NOT NULL,
    is_admin_reply BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 系统公告表
CREATE TABLE system_announcements (
    announcement_id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES users(user_id),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    is_active BOOLEAN DEFAULT TRUE,
    is_pinned BOOLEAN DEFAULT FALSE,
    target_audience VARCHAR(20) DEFAULT 'all' CHECK (target_audience IN ('all', 'users', 'admins')),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 数据统计表
CREATE TABLE platform_statistics (
    stat_id SERIAL PRIMARY KEY,
    stat_date DATE NOT NULL,
    stat_type VARCHAR(50) NOT NULL,
    stat_value DECIMAL(15,2) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(stat_date, stat_type)
);

-- 创建索引
CREATE INDEX idx_admin_logs_admin ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_action ON admin_logs(action);
CREATE INDEX idx_admin_logs_created_at ON admin_logs(created_at);
CREATE INDEX idx_system_configs_key ON system_configs(config_key);
CREATE INDEX idx_system_configs_public ON system_configs(is_public);
CREATE INDEX idx_user_bans_user ON user_bans(user_id);
CREATE INDEX idx_user_bans_status ON user_bans(status);
CREATE INDEX idx_user_bans_expires_at ON user_bans(expires_at);
CREATE INDEX idx_task_reviews_task ON task_reviews(task_id);
CREATE INDEX idx_task_reviews_admin ON task_reviews(admin_id);
CREATE INDEX idx_transaction_reviews_transaction ON transaction_reviews(transaction_id);
CREATE INDEX idx_transaction_reviews_admin ON transaction_reviews(admin_id);
CREATE INDEX idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_admin ON support_tickets(admin_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX idx_ticket_replies_ticket ON ticket_replies(ticket_id);
CREATE INDEX idx_ticket_replies_user ON ticket_replies(user_id);
CREATE INDEX idx_system_announcements_active ON system_announcements(is_active);
CREATE INDEX idx_system_announcements_type ON system_announcements(type);
CREATE INDEX idx_system_announcements_audience ON system_announcements(target_audience);
CREATE INDEX idx_platform_statistics_date ON platform_statistics(stat_date);
CREATE INDEX idx_platform_statistics_type ON platform_statistics(stat_type);

-- 插入默认系统配置
INSERT INTO system_configs (config_key, config_value, config_type, description, is_public) VALUES 
('platform_name', '赏金猎人平台', 'string', '平台名称', TRUE),
('platform_version', '1.0.0', 'string', '平台版本', TRUE),
('max_task_reward', '100000', 'number', '最大任务赏金', FALSE),
('min_task_reward', '1', 'number', '最小任务赏金', FALSE),
('task_commission_rate', '0.05', 'number', '任务佣金比例', FALSE),
('withdrawal_min_amount', '10', 'number', '最小提现金额', TRUE),
('withdrawal_max_amount', '50000', 'number', '最大提现金额', TRUE),
('user_registration_enabled', 'true', 'boolean', '是否允许用户注册', TRUE),
('task_auto_approve', 'false', 'boolean', '任务是否自动审核', FALSE),
('maintenance_mode', 'false', 'boolean', '维护模式', TRUE),
('contact_email', 'support@bountyhunter.com', 'string', '联系邮箱', TRUE),
('contact_phone', '400-123-4567', 'string', '联系电话', TRUE);

-- 插入默认系统公告
INSERT INTO system_announcements (admin_id, title, content, type, priority, target_audience) VALUES 
(1, '欢迎使用赏金猎人平台', '欢迎来到赏金猎人平台！我们致力于为任务发布者和执行者提供安全、高效的交易环境。', 'info', 'normal', 'all'),
(1, '平台使用指南', '请仔细阅读平台使用指南，了解如何发布任务、接受任务和完成交易。', 'info', 'normal', 'users'),
(1, '安全提醒', '请保护您的账户安全，不要向他人透露密码，如发现异常请及时联系客服。', 'warning', 'high', 'all');