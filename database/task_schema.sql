-- 任务相关表结构
-- PostgreSQL 数据库

-- 任务表
CREATE TABLE tasks (
    task_id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    reward DECIMAL(10,2) NOT NULL,
    deadline TIMESTAMP NOT NULL,
    location VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    publisher_id INTEGER REFERENCES users(user_id),
    hunter_id INTEGER REFERENCES users(user_id),
    completion_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- 任务附件表
CREATE TABLE task_attachments (
    attachment_id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES tasks(task_id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size INTEGER,
    file_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 任务完成附件表
CREATE TABLE task_completion_attachments (
    attachment_id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES tasks(task_id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size INTEGER,
    file_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 任务分类表
CREATE TABLE task_categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 任务标签表
CREATE TABLE task_tags (
    tag_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    color VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 任务标签关联表
CREATE TABLE task_tag_relations (
    task_id INTEGER REFERENCES tasks(task_id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES task_tags(tag_id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, tag_id)
);

-- 任务浏览记录表
CREATE TABLE task_views (
    view_id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES tasks(task_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(task_id, user_id)
);

-- 任务收藏表
CREATE TABLE task_favorites (
    favorite_id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES tasks(task_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(task_id, user_id)
);

-- 任务举报表
CREATE TABLE task_reports (
    report_id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES tasks(task_id) ON DELETE CASCADE,
    reporter_id INTEGER REFERENCES users(user_id),
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by INTEGER REFERENCES users(user_id)
);

-- 创建索引
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_category ON tasks(category);
CREATE INDEX idx_tasks_publisher ON tasks(publisher_id);
CREATE INDEX idx_tasks_hunter ON tasks(hunter_id);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);
CREATE INDEX idx_tasks_reward ON tasks(reward);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_task_attachments_task ON task_attachments(task_id);
CREATE INDEX idx_task_completion_attachments_task ON task_completion_attachments(task_id);
CREATE INDEX idx_task_views_task ON task_views(task_id);
CREATE INDEX idx_task_views_user ON task_views(user_id);
CREATE INDEX idx_task_favorites_task ON task_favorites(task_id);
CREATE INDEX idx_task_favorites_user ON task_favorites(user_id);
CREATE INDEX idx_task_reports_task ON task_reports(task_id);
CREATE INDEX idx_task_reports_reporter ON task_reports(reporter_id);

-- 插入默认任务分类
INSERT INTO task_categories (name, description, icon, color) VALUES 
('design', '设计类任务', '🎨', '#8b5cf6'),
('development', '开发类任务', '💻', '#3b82f6'),
('writing', '写作类任务', '✍️', '#10b981'),
('translation', '翻译类任务', '🌐', '#f59e0b'),
('data_entry', '数据录入任务', '📊', '#6b7280'),
('marketing', '营销类任务', '📢', '#ef4444'),
('research', '研究类任务', '🔬', '#8b5cf6'),
('other', '其他类型任务', '📋', '#6b7280');

-- 插入默认任务标签
INSERT INTO task_tags (name, color) VALUES 
('urgent', '#ef4444'),
('high-priority', '#f59e0b'),
('easy', '#10b981'),
('difficult', '#8b5cf6'),
('long-term', '#3b82f6'),
('short-term', '#06b6d4'),
('remote', '#84cc16'),
('on-site', '#f97316');

-- 创建触发器：更新任务修改时间
CREATE OR REPLACE FUNCTION update_task_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_task_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_task_updated_at();

-- 创建视图：任务统计
CREATE VIEW task_stats AS
SELECT 
    COUNT(*) as total_tasks,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_tasks,
    COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tasks,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_tasks,
    COALESCE(AVG(reward), 0) as average_reward,
    COALESCE(SUM(reward), 0) as total_reward
FROM tasks;
