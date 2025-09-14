-- 消息与通知系统数据库结构
-- 支持 PostgreSQL 和 MongoDB

-- ============================================
-- 私信表 (Private Messages)
-- ============================================
CREATE TABLE private_messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL, -- 会话ID
    sender_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- 消息内容
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    content TEXT NOT NULL,
    attachment_url VARCHAR(500), -- 附件URL
    attachment_name VARCHAR(255), -- 附件名称
    attachment_size INTEGER, -- 附件大小（字节）
    
    -- 消息状态
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    deleted_by UUID REFERENCES users(user_id),
    
    -- 消息属性
    is_encrypted BOOLEAN DEFAULT FALSE,
    reply_to_message_id UUID REFERENCES private_messages(message_id),
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- 索引
    INDEX idx_conversation (conversation_id),
    INDEX idx_sender (sender_id),
    INDEX idx_receiver (receiver_id),
    INDEX idx_created (created_at)
);

-- 会话表 (Conversations)
CREATE TABLE conversations (
    conversation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    UNIQUE(participant1_id, participant2_id),
    INDEX idx_participant1 (participant1_id),
    INDEX idx_participant2 (participant2_id),
    INDEX idx_last_message (last_message_at)
);

-- 系统通知表 (System Notifications)
CREATE TABLE system_notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    data JSONB DEFAULT '{}', -- 存储相关数据，如任务ID、金额等
    
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
    sms_sent BOOLEAN DEFAULT FALSE,
    sms_sent_at TIMESTAMP,
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP, -- 通知过期时间
    
    INDEX idx_user (user_id),
    INDEX idx_type (notification_type),
    INDEX idx_read (is_read),
    INDEX idx_created (created_at),
    INDEX idx_expires (expires_at)
);

-- 通知模板表 (Notification Templates)
CREATE TABLE notification_templates (
    template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name VARCHAR(100) UNIQUE NOT NULL,
    notification_type VARCHAR(30) NOT NULL,
    
    -- 模板内容
    title_template TEXT NOT NULL,
    content_template TEXT NOT NULL,
    
    -- 模板设置
    is_active BOOLEAN DEFAULT TRUE,
    language VARCHAR(10) DEFAULT 'zh-CN',
    
    -- 推送设置
    enable_push BOOLEAN DEFAULT TRUE,
    enable_email BOOLEAN DEFAULT FALSE,
    enable_sms BOOLEAN DEFAULT FALSE,
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_type (notification_type),
    INDEX idx_active (is_active)
);

-- 用户通知设置表 (User Notification Settings)
CREATE TABLE user_notification_settings (
    setting_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- 通知类型设置
    task_notifications BOOLEAN DEFAULT TRUE,
    payment_notifications BOOLEAN DEFAULT TRUE,
    review_notifications BOOLEAN DEFAULT TRUE,
    account_notifications BOOLEAN DEFAULT TRUE,
    system_notifications BOOLEAN DEFAULT TRUE,
    promotion_notifications BOOLEAN DEFAULT FALSE,
    
    -- 推送方式设置
    push_enabled BOOLEAN DEFAULT TRUE,
    email_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT FALSE,
    
    -- 推送时间设置
    quiet_hours_start TIME DEFAULT '22:00:00',
    quiet_hours_end TIME DEFAULT '08:00:00',
    timezone VARCHAR(50) DEFAULT 'Asia/Shanghai',
    
    -- 频率设置
    digest_frequency VARCHAR(20) DEFAULT 'daily' CHECK (digest_frequency IN ('never', 'daily', 'weekly')),
    digest_time TIME DEFAULT '09:00:00',
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id)
);

-- 消息草稿表 (Message Drafts)
CREATE TABLE message_drafts (
    draft_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    
    -- 草稿内容
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text',
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, conversation_id),
    INDEX idx_user (user_id),
    INDEX idx_conversation (conversation_id)
);

-- 消息标签表 (Message Tags)
CREATE TABLE message_tags (
    tag_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tag_name VARCHAR(50) UNIQUE NOT NULL,
    tag_color VARCHAR(7) DEFAULT '#3b82f6',
    tag_description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 消息标签关联表 (Message Tag Relations)
CREATE TABLE message_tag_relations (
    relation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES private_messages(message_id) ON DELETE CASCADE,
    tag_id UUID REFERENCES message_tags(tag_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(message_id, tag_id, user_id),
    INDEX idx_message (message_id),
    INDEX idx_tag (tag_id),
    INDEX idx_user (user_id)
);

-- 插入默认通知模板
INSERT INTO notification_templates (template_name, notification_type, title_template, content_template, enable_push, enable_email) VALUES
('任务被接受', 'task_assigned', '任务被接受', '您的任务"{{task_title}}"已被{{hunter_name}}接受，请及时沟通任务细节。', TRUE, TRUE),
('任务完成', 'task_completed', '任务已完成', '您的任务"{{task_title}}"已完成，请及时验收并支付赏金。', TRUE, TRUE),
('任务取消', 'task_cancelled', '任务已取消', '任务"{{task_title}}"已被取消，相关资金已退回您的账户。', TRUE, TRUE),
('收到付款', 'payment_received', '收到付款', '您收到了{{amount}}元的付款，来自任务"{{task_title}}"。', TRUE, TRUE),
('收到评价', 'review_received', '收到新评价', '您收到了来自{{reviewer_name}}的评价，评分：{{rating}}星。', TRUE, FALSE),
('账户验证', 'account_verified', '账户验证成功', '恭喜！您的账户验证已通过，现在可以享受更多功能。', TRUE, TRUE),
('系统维护', 'system_maintenance', '系统维护通知', '系统将于{{maintenance_time}}进行维护，预计{{duration}}，请提前做好准备。', TRUE, TRUE);

-- 插入默认消息标签
INSERT INTO message_tags (tag_name, tag_color, tag_description) VALUES
('重要', '#ef4444', '重要消息'),
('任务相关', '#3b82f6', '与任务相关的消息'),
('付款相关', '#10b981', '与付款相关的消息'),
('评价相关', '#f59e0b', '与评价相关的消息'),
('系统通知', '#6b7280', '系统通知消息'),
('促销活动', '#8b5cf6', '促销活动消息');

-- ============================================
-- MongoDB 等效结构 (JSON Schema)
-- ============================================
/*
{
  "private_messages": {
    "_id": "ObjectId",
    "conversation_id": "ObjectId",
    "sender_id": "ObjectId",
    "receiver_id": "ObjectId",
    "message_type": "String (enum)",
    "content": "String",
    "attachment_url": "String",
    "attachment_name": "String",
    "attachment_size": "Number",
    "is_read": "Boolean",
    "read_at": "Date",
    "is_deleted": "Boolean",
    "deleted_at": "Date",
    "deleted_by": "ObjectId",
    "is_encrypted": "Boolean",
    "reply_to_message_id": "ObjectId",
    "created_at": "Date",
    "updated_at": "Date"
  },
  "conversations": {
    "_id": "ObjectId",
    "participant1_id": "ObjectId",
    "participant2_id": "ObjectId",
    "last_message_id": "ObjectId",
    "last_message_at": "Date",
    "unread_count_participant1": "Number",
    "unread_count_participant2": "Number",
    "is_active": "Boolean",
    "is_archived": "Boolean",
    "archived_at": "Date",
    "archived_by": "ObjectId",
    "is_muted_participant1": "Boolean",
    "is_muted_participant2": "Boolean",
    "created_at": "Date",
    "updated_at": "Date"
  },
  "system_notifications": {
    "_id": "ObjectId",
    "user_id": "ObjectId",
    "notification_type": "String (enum)",
    "title": "String",
    "content": "String",
    "data": "Object",
    "is_read": "Boolean",
    "read_at": "Date",
    "is_deleted": "Boolean",
    "deleted_at": "Date",
    "priority": "String (enum)",
    "category": "String (enum)",
    "push_sent": "Boolean",
    "push_sent_at": "Date",
    "email_sent": "Boolean",
    "email_sent_at": "Date",
    "sms_sent": "Boolean",
    "sms_sent_at": "Date",
    "created_at": "Date",
    "expires_at": "Date"
  },
  "notification_templates": {
    "_id": "ObjectId",
    "template_name": "String",
    "notification_type": "String (enum)",
    "title_template": "String",
    "content_template": "String",
    "is_active": "Boolean",
    "language": "String",
    "enable_push": "Boolean",
    "enable_email": "Boolean",
    "enable_sms": "Boolean",
    "created_at": "Date",
    "updated_at": "Date"
  },
  "user_notification_settings": {
    "_id": "ObjectId",
    "user_id": "ObjectId",
    "task_notifications": "Boolean",
    "payment_notifications": "Boolean",
    "review_notifications": "Boolean",
    "account_notifications": "Boolean",
    "system_notifications": "Boolean",
    "promotion_notifications": "Boolean",
    "push_enabled": "Boolean",
    "email_enabled": "Boolean",
    "sms_enabled": "Boolean",
    "quiet_hours_start": "String",
    "quiet_hours_end": "String",
    "timezone": "String",
    "digest_frequency": "String (enum)",
    "digest_time": "String",
    "created_at": "Date",
    "updated_at": "Date"
  },
  "message_drafts": {
    "_id": "ObjectId",
    "user_id": "ObjectId",
    "conversation_id": "ObjectId",
    "content": "String",
    "message_type": "String",
    "created_at": "Date",
    "updated_at": "Date"
  },
  "message_tags": {
    "_id": "ObjectId",
    "tag_name": "String",
    "tag_color": "String",
    "tag_description": "String",
    "is_active": "Boolean",
    "created_at": "Date"
  },
  "message_tag_relations": {
    "_id": "ObjectId",
    "message_id": "ObjectId",
    "tag_id": "ObjectId",
    "user_id": "ObjectId",
    "created_at": "Date"
  }
}
*/
