-- 消息相关表结构
-- PostgreSQL 数据库

-- 消息表
CREATE TABLE messages (
    message_id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(user_id),
    receiver_id INTEGER REFERENCES users(user_id),
    task_id INTEGER REFERENCES tasks(task_id),
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    is_read BOOLEAN DEFAULT FALSE,
    is_deleted_by_sender BOOLEAN DEFAULT FALSE,
    is_deleted_by_receiver BOOLEAN DEFAULT FALSE,
    reply_to_message_id INTEGER REFERENCES messages(message_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

-- 通知表
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    is_sent BOOLEAN DEFAULT FALSE,
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    sent_at TIMESTAMP
);

-- 消息附件表
CREATE TABLE message_attachments (
    attachment_id SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES messages(message_id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size INTEGER,
    file_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 消息模板表
CREATE TABLE message_templates (
    template_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL,
    title_template VARCHAR(200),
    content_template TEXT NOT NULL,
    variables JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户消息设置表
CREATE TABLE user_message_settings (
    user_id INTEGER PRIMARY KEY REFERENCES users(user_id),
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    task_notifications BOOLEAN DEFAULT TRUE,
    system_notifications BOOLEAN DEFAULT TRUE,
    marketing_notifications BOOLEAN DEFAULT FALSE,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    timezone VARCHAR(50) DEFAULT 'UTC',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 消息会话表
CREATE TABLE message_conversations (
    conversation_id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES tasks(task_id),
    participant1_id INTEGER REFERENCES users(user_id),
    participant2_id INTEGER REFERENCES users(user_id),
    last_message_id INTEGER REFERENCES messages(message_id),
    last_message_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 消息草稿表
CREATE TABLE message_drafts (
    draft_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    receiver_id INTEGER REFERENCES users(user_id),
    task_id INTEGER REFERENCES tasks(task_id),
    content TEXT,
    attachments JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 消息举报表
CREATE TABLE message_reports (
    report_id SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES messages(message_id) ON DELETE CASCADE,
    reporter_id INTEGER REFERENCES users(user_id),
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by INTEGER REFERENCES users(user_id)
);

-- 消息标签表
CREATE TABLE message_labels (
    label_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    color VARCHAR(20),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 消息标签关联表
CREATE TABLE message_label_relations (
    message_id INTEGER REFERENCES messages(message_id) ON DELETE CASCADE,
    label_id INTEGER REFERENCES message_labels(label_id) ON DELETE CASCADE,
    PRIMARY KEY (message_id, label_id)
);

-- 创建索引
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_task ON messages(task_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_is_read ON messages(is_read);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_message_attachments_message ON message_attachments(message_id);
CREATE INDEX idx_user_message_settings_user ON user_message_settings(user_id);
CREATE INDEX idx_message_conversations_task ON message_conversations(task_id);
CREATE INDEX idx_message_conversations_participants ON message_conversations(participant1_id, participant2_id);
CREATE INDEX idx_message_drafts_user ON message_drafts(user_id);
CREATE INDEX idx_message_reports_message ON message_reports(message_id);
CREATE INDEX idx_message_reports_reporter ON message_reports(reporter_id);

-- 插入默认消息模板
INSERT INTO message_templates (name, type, title_template, content_template, variables) VALUES 
('task_accepted', 'task', '任务已被接受', '您的任务"{{task_title}}"已被{{hunter_name}}接受，请及时沟通任务细节。', '{"task_title", "hunter_name"}'),
('task_completed', 'task', '任务已完成', '您的任务"{{task_title}}"已被{{hunter_name}}标记为完成，请及时验收。', '{"task_title", "hunter_name"}'),
('task_cancelled', 'task', '任务已取消', '任务"{{task_title}}"已被取消，原因：{{reason}}', '{"task_title", "reason"}'),
('payment_received', 'payment', '收到付款', '您收到了{{amount}}元的付款，来自任务"{{task_title}}"。', '{"amount", "task_title"}'),
('payment_sent', 'payment', '付款已发送', '您已向{{receiver_name}}发送{{amount}}元，用于任务"{{task_title}}"。', '{"receiver_name", "amount", "task_title"}'),
('review_received', 'review', '收到评价', '您收到了来自{{reviewer_name}}的评价，评分：{{rating}}星', '{"reviewer_name", "rating"}'),
('account_verified', 'system', '账户已认证', '恭喜！您的账户已通过实名认证，现在可以享受更多功能。', '{}'),
('password_changed', 'security', '密码已修改', '您的账户密码已成功修改，如非本人操作请立即联系客服。', '{}'),
('login_alert', 'security', '登录提醒', '您的账户在{{location}}登录，时间：{{login_time}}', '{"location", "login_time"}');

-- 插入默认消息标签
INSERT INTO message_labels (name, color, description) VALUES 
('重要', '#ef4444', '重要消息'),
('任务', '#3b82f6', '任务相关消息'),
('支付', '#10b981', '支付相关消息'),
('系统', '#6b7280', '系统通知'),
('营销', '#f59e0b', '营销推广'),
('紧急', '#dc2626', '紧急消息');

-- 创建触发器：更新消息会话
CREATE OR REPLACE FUNCTION update_message_conversation()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- 查找或创建会话
        INSERT INTO message_conversations (task_id, participant1_id, participant2_id, last_message_id, last_message_at)
        VALUES (NEW.task_id, NEW.sender_id, NEW.receiver_id, NEW.message_id, NEW.created_at)
        ON CONFLICT (task_id, participant1_id, participant2_id) 
        DO UPDATE SET
            last_message_id = NEW.message_id,
            last_message_at = NEW.created_at;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_message_conversation
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_message_conversation();

-- 创建触发器：自动标记消息为已读
CREATE OR REPLACE FUNCTION auto_mark_messages_read()
RETURNS TRIGGER AS $$
BEGIN
    -- 当用户发送消息时，自动标记该会话中的其他消息为已读
    UPDATE messages 
    SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
    WHERE receiver_id = NEW.sender_id 
      AND sender_id = NEW.receiver_id 
      AND task_id = NEW.task_id 
      AND is_read = FALSE;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_mark_messages_read
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION auto_mark_messages_read();

-- 创建视图：未读消息统计
CREATE VIEW unread_message_stats AS
SELECT 
    user_id,
    COUNT(*) as unread_count,
    COUNT(CASE WHEN message_type = 'system' THEN 1 END) as unread_system,
    COUNT(CASE WHEN message_type = 'text' THEN 1 END) as unread_text,
    COUNT(CASE WHEN task_id IS NOT NULL THEN 1 END) as unread_task_messages
FROM messages 
WHERE is_read = FALSE 
GROUP BY user_id;

-- 创建视图：消息统计
CREATE VIEW message_stats AS
SELECT 
    COUNT(*) as total_messages,
    COUNT(CASE WHEN message_type = 'text' THEN 1 END) as text_messages,
    COUNT(CASE WHEN message_type = 'image' THEN 1 END) as image_messages,
    COUNT(CASE WHEN message_type = 'file' THEN 1 END) as file_messages,
    COUNT(CASE WHEN message_type = 'system' THEN 1 END) as system_messages,
    COUNT(CASE WHEN is_read = FALSE THEN 1 END) as unread_messages,
    COUNT(DISTINCT sender_id) as active_senders,
    COUNT(DISTINCT receiver_id) as active_receivers
FROM messages;