-- 管理员后台系统数据库结构
-- 支持 PostgreSQL 和 MongoDB

-- ============================================
-- 管理员表 (Admins)
-- ============================================
CREATE TABLE admins (
    admin_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- 管理员信息
    admin_name VARCHAR(100) NOT NULL,
    admin_email VARCHAR(255) UNIQUE NOT NULL,
    admin_phone VARCHAR(20),
    
    -- 权限等级
    admin_level VARCHAR(20) DEFAULT 'moderator' CHECK (admin_level IN ('super_admin', 'admin', 'moderator', 'support')),
    permissions JSONB DEFAULT '{}', -- 存储具体权限
    
    -- 状态信息
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP,
    login_count INTEGER DEFAULT 0,
    
    -- 安全信息
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user (user_id),
    INDEX idx_email (admin_email),
    INDEX idx_level (admin_level),
    INDEX idx_active (is_active)
);

-- 管理员操作日志表 (Admin Action Logs)
CREATE TABLE admin_action_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES admins(admin_id) ON DELETE CASCADE,
    
    -- 操作信息
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN (
        'user_ban', 'user_unban', 'user_verify', 'user_suspend',
        'task_approve', 'task_reject', 'task_delete', 'task_feature',
        'payment_approve', 'payment_reject', 'payment_refund',
        'review_delete', 'review_hide', 'review_restore',
        'system_config', 'system_maintenance', 'data_export'
    )),
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('user', 'task', 'payment', 'review', 'system')),
    target_id UUID, -- 目标对象ID
    
    -- 操作详情
    action_description TEXT NOT NULL,
    action_data JSONB DEFAULT '{}', -- 操作相关数据
    ip_address INET,
    user_agent TEXT,
    
    -- 操作结果
    status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'failed', 'pending')),
    error_message TEXT,
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_admin (admin_id),
    INDEX idx_action_type (action_type),
    INDEX idx_target (target_type, target_id),
    INDEX idx_created (created_at)
);

-- 系统配置表 (System Configurations)
CREATE TABLE system_configs (
    config_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT,
    config_type VARCHAR(20) DEFAULT 'string' CHECK (config_type IN ('string', 'number', 'boolean', 'json', 'array')),
    config_category VARCHAR(50) DEFAULT 'general' CHECK (config_category IN (
        'general', 'payment', 'task', 'user', 'notification', 'security', 'system'
    )),
    config_description TEXT,
    is_editable BOOLEAN DEFAULT TRUE,
    is_public BOOLEAN DEFAULT FALSE, -- 是否对前端公开
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES admins(admin_id),
    
    INDEX idx_key (config_key),
    INDEX idx_category (config_category),
    INDEX idx_editable (is_editable)
);

-- 审核队列表 (Review Queue)
CREATE TABLE review_queue (
    queue_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- 审核对象
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('user', 'task', 'payment', 'review', 'report')),
    target_id UUID NOT NULL,
    target_data JSONB DEFAULT '{}', -- 审核对象的数据快照
    
    -- 审核信息
    review_type VARCHAR(30) NOT NULL CHECK (review_type IN (
        'user_registration', 'user_verification', 'task_publication', 'task_completion',
        'payment_withdrawal', 'payment_refund', 'review_content', 'report_handling'
    )),
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- 审核状态
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected', 'cancelled')),
    assigned_to UUID REFERENCES admins(admin_id),
    reviewed_by UUID REFERENCES admins(admin_id),
    reviewed_at TIMESTAMP,
    
    -- 审核结果
    review_notes TEXT,
    review_decision VARCHAR(20) CHECK (review_decision IN ('approve', 'reject', 'request_changes')),
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_target (target_type, target_id),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_assigned (assigned_to),
    INDEX idx_created (created_at)
);

-- 数据统计表 (Data Statistics)
CREATE TABLE data_statistics (
    stat_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- 统计信息
    stat_type VARCHAR(50) NOT NULL CHECK (stat_type IN (
        'daily_users', 'daily_tasks', 'daily_payments', 'daily_reviews',
        'monthly_revenue', 'monthly_users', 'monthly_tasks',
        'user_growth', 'task_completion_rate', 'payment_success_rate'
    )),
    stat_date DATE NOT NULL,
    stat_value DECIMAL(15,2) NOT NULL,
    stat_metadata JSONB DEFAULT '{}', -- 额外统计信息
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(stat_type, stat_date),
    INDEX idx_type_date (stat_type, stat_date),
    INDEX idx_date (stat_date)
);

-- 系统维护表 (System Maintenance)
CREATE TABLE system_maintenance (
    maintenance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- 维护信息
    maintenance_type VARCHAR(30) NOT NULL CHECK (maintenance_type IN (
        'scheduled', 'emergency', 'update', 'backup', 'migration'
    )),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- 时间安排
    scheduled_start TIMESTAMP NOT NULL,
    scheduled_end TIMESTAMP NOT NULL,
    actual_start TIMESTAMP,
    actual_end TIMESTAMP,
    
    -- 维护状态
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    
    -- 影响范围
    affected_services JSONB DEFAULT '[]', -- 受影响的服务列表
    maintenance_level VARCHAR(20) DEFAULT 'normal' CHECK (maintenance_level IN ('normal', 'major', 'critical')),
    
    -- 维护人员
    created_by UUID REFERENCES admins(admin_id),
    assigned_to UUID REFERENCES admins(admin_id),
    
    -- 通知设置
    notify_users BOOLEAN DEFAULT TRUE,
    notify_admins BOOLEAN DEFAULT TRUE,
    notification_sent BOOLEAN DEFAULT FALSE,
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_status (status),
    INDEX idx_scheduled (scheduled_start),
    INDEX idx_type (maintenance_type)
);

-- 用户举报表 (User Reports)
CREATE TABLE user_reports (
    report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- 举报信息
    reporter_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    reported_task_id UUID REFERENCES tasks(task_id) ON DELETE CASCADE,
    reported_review_id UUID REFERENCES task_reviews(review_id) ON DELETE CASCADE,
    
    -- 举报类型
    report_type VARCHAR(30) NOT NULL CHECK (report_type IN (
        'spam', 'harassment', 'inappropriate_content', 'fake_profile',
        'fake_task', 'payment_fraud', 'fake_review', 'other'
    )),
    report_reason TEXT NOT NULL,
    report_evidence JSONB DEFAULT '{}', -- 举报证据（截图、链接等）
    
    -- 处理状态
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
    assigned_to UUID REFERENCES admins(admin_id),
    handled_by UUID REFERENCES admins(admin_id),
    handled_at TIMESTAMP,
    
    -- 处理结果
    resolution TEXT,
    action_taken VARCHAR(50), -- 采取的行动
    severity_level VARCHAR(10) DEFAULT 'medium' CHECK (severity_level IN ('low', 'medium', 'high', 'critical')),
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_reporter (reporter_id),
    INDEX idx_reported_user (reported_user_id),
    INDEX idx_status (status),
    INDEX idx_type (report_type),
    INDEX idx_created (created_at)
);

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
('email_notifications_enabled', 'true', 'boolean', 'notification', '是否启用邮件通知', TRUE, FALSE);

-- 插入默认管理员权限配置
INSERT INTO system_configs (config_key, config_value, config_type, config_category, config_description, is_editable, is_public) VALUES
('admin_permissions', '{"super_admin":["all"],"admin":["user_management","task_management","payment_management","data_analytics"],"moderator":["user_moderation","task_moderation","content_moderation"],"support":["user_support","ticket_management"]}', 'json', 'security', '管理员权限配置', TRUE, FALSE);

-- ============================================
-- MongoDB 等效结构 (JSON Schema)
-- ============================================
/*
{
  "admins": {
    "_id": "ObjectId",
    "user_id": "ObjectId",
    "admin_name": "String",
    "admin_email": "String",
    "admin_phone": "String",
    "admin_level": "String (enum)",
    "permissions": "Object",
    "is_active": "Boolean",
    "is_verified": "Boolean",
    "last_login_at": "Date",
    "login_count": "Number",
    "two_factor_enabled": "Boolean",
    "two_factor_secret": "String",
    "password_reset_token": "String",
    "password_reset_expires": "Date",
    "created_at": "Date",
    "updated_at": "Date"
  },
  "admin_action_logs": {
    "_id": "ObjectId",
    "admin_id": "ObjectId",
    "action_type": "String (enum)",
    "target_type": "String (enum)",
    "target_id": "ObjectId",
    "action_description": "String",
    "action_data": "Object",
    "ip_address": "String",
    "user_agent": "String",
    "status": "String (enum)",
    "error_message": "String",
    "created_at": "Date"
  },
  "system_configs": {
    "_id": "ObjectId",
    "config_key": "String",
    "config_value": "String",
    "config_type": "String (enum)",
    "config_category": "String (enum)",
    "config_description": "String",
    "is_editable": "Boolean",
    "is_public": "Boolean",
    "created_at": "Date",
    "updated_at": "Date",
    "updated_by": "ObjectId"
  },
  "review_queue": {
    "_id": "ObjectId",
    "target_type": "String (enum)",
    "target_id": "ObjectId",
    "target_data": "Object",
    "review_type": "String (enum)",
    "priority": "String (enum)",
    "status": "String (enum)",
    "assigned_to": "ObjectId",
    "reviewed_by": "ObjectId",
    "reviewed_at": "Date",
    "review_notes": "String",
    "review_decision": "String (enum)",
    "created_at": "Date",
    "updated_at": "Date"
  },
  "data_statistics": {
    "_id": "ObjectId",
    "stat_type": "String (enum)",
    "stat_date": "Date",
    "stat_value": "Decimal",
    "stat_metadata": "Object",
    "created_at": "Date"
  },
  "system_maintenance": {
    "_id": "ObjectId",
    "maintenance_type": "String (enum)",
    "title": "String",
    "description": "String",
    "scheduled_start": "Date",
    "scheduled_end": "Date",
    "actual_start": "Date",
    "actual_end": "Date",
    "status": "String (enum)",
    "affected_services": "Array",
    "maintenance_level": "String (enum)",
    "created_by": "ObjectId",
    "assigned_to": "ObjectId",
    "notify_users": "Boolean",
    "notify_admins": "Boolean",
    "notification_sent": "Boolean",
    "created_at": "Date",
    "updated_at": "Date"
  },
  "user_reports": {
    "_id": "ObjectId",
    "reporter_id": "ObjectId",
    "reported_user_id": "ObjectId",
    "reported_task_id": "ObjectId",
    "reported_review_id": "ObjectId",
    "report_type": "String (enum)",
    "report_reason": "String",
    "report_evidence": "Object",
    "status": "String (enum)",
    "assigned_to": "ObjectId",
    "handled_by": "ObjectId",
    "handled_at": "Date",
    "resolution": "String",
    "action_taken": "String",
    "severity_level": "String (enum)",
    "created_at": "Date",
    "updated_at": "Date"
  }
}
*/
