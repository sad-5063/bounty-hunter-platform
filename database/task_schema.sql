-- 任务系统数据库结构
-- 支持 PostgreSQL 和 MongoDB

-- ============================================
-- 任务表 (Tasks Table)
-- ============================================
CREATE TABLE tasks (
    task_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    subcategory VARCHAR(50),
    reward DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'CNY',
    deadline TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'in_progress', 'completed', 'cancelled', 'disputed')),
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- 地理位置信息
    country VARCHAR(100),
    city VARCHAR(100),
    region VARCHAR(100),
    
    -- 任务要求
    skills_required TEXT[], -- 技能标签数组
    experience_level VARCHAR(20) DEFAULT 'any' CHECK (experience_level IN ('any', 'beginner', 'intermediate', 'expert')),
    estimated_hours INTEGER,
    
    -- 附件和媒体
    attachments JSONB, -- 存储附件信息
    images TEXT[], -- 图片URL数组
    
    -- 用户关联
    publisher_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    hunter_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- 任务设置
    is_public BOOLEAN DEFAULT TRUE,
    auto_assign BOOLEAN DEFAULT FALSE,
    max_applicants INTEGER DEFAULT 10,
    
    -- 任务统计
    view_count INTEGER DEFAULT 0,
    application_count INTEGER DEFAULT 0,
    
    -- 任务标签
    tags TEXT[]
);

-- 任务申请表 (Task Applications)
CREATE TABLE task_applications (
    application_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(task_id) ON DELETE CASCADE,
    hunter_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    application_message TEXT,
    proposed_reward DECIMAL(10,2), -- 猎人提出的价格
    estimated_completion_date TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- 确保一个猎人只能申请一次同一个任务
    UNIQUE(task_id, hunter_id)
);

-- 任务进度表 (Task Progress)
CREATE TABLE task_progress (
    progress_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(task_id) ON DELETE CASCADE,
    hunter_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    progress_note TEXT,
    attachments JSONB, -- 进度附件
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 任务交付表 (Task Deliverables)
CREATE TABLE task_deliverables (
    deliverable_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(task_id) ON DELETE CASCADE,
    hunter_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    file_urls TEXT[], -- 交付文件URL数组
    file_types TEXT[], -- 文件类型数组
    file_sizes BIGINT[], -- 文件大小数组
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'approved', 'rejected', 'revision_requested')),
    publisher_feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 任务分类表 (Task Categories)
CREATE TABLE task_categories (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50), -- 图标名称或URL
    parent_category_id UUID REFERENCES task_categories(category_id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 任务标签表 (Task Tags)
CREATE TABLE task_tags (
    tag_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7), -- 十六进制颜色代码
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 任务技能表 (Task Skills)
CREATE TABLE task_skills (
    skill_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50),
    description TEXT,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_category ON tasks(category);
CREATE INDEX idx_tasks_publisher ON tasks(publisher_id);
CREATE INDEX idx_tasks_hunter ON tasks(hunter_id);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);
CREATE INDEX idx_tasks_reward ON tasks(reward);
CREATE INDEX idx_tasks_created ON tasks(created_at);
CREATE INDEX idx_tasks_location ON tasks(country, city);
CREATE INDEX idx_tasks_public ON tasks(is_public);

CREATE INDEX idx_applications_task ON task_applications(task_id);
CREATE INDEX idx_applications_hunter ON task_applications(hunter_id);
CREATE INDEX idx_applications_status ON task_applications(status);

CREATE INDEX idx_progress_task ON task_progress(task_id);
CREATE INDEX idx_progress_hunter ON task_progress(hunter_id);

CREATE INDEX idx_deliverables_task ON task_deliverables(task_id);
CREATE INDEX idx_deliverables_hunter ON task_deliverables(hunter_id);

-- 插入默认分类数据
INSERT INTO task_categories (name, description, icon, sort_order) VALUES
('技术开发', '软件开发、网站建设、移动应用等技术相关任务', '💻', 1),
('设计创意', 'UI/UX设计、平面设计、视频制作等创意类任务', '🎨', 2),
('写作翻译', '文案写作、翻译、内容创作等文字类任务', '✍️', 3),
('营销推广', '社交媒体运营、SEO优化、广告投放等营销任务', '📈', 4),
('数据分析', '数据收集、分析、报告等数据相关任务', '📊', 5),
('其他服务', '其他类型的服务任务', '🔧', 6);

-- 插入默认技能标签
INSERT INTO task_skills (name, category, description) VALUES
('React', '前端开发', 'React.js 前端框架'),
('Vue.js', '前端开发', 'Vue.js 前端框架'),
('Node.js', '后端开发', 'Node.js 后端开发'),
('Python', '编程语言', 'Python 编程语言'),
('JavaScript', '编程语言', 'JavaScript 编程语言'),
('UI设计', '设计', '用户界面设计'),
('UX设计', '设计', '用户体验设计'),
('Photoshop', '设计工具', 'Adobe Photoshop'),
('Figma', '设计工具', 'Figma 设计工具'),
('文案写作', '写作', '营销文案写作'),
('SEO优化', '营销', '搜索引擎优化'),
('社交媒体', '营销', '社交媒体运营');

-- ============================================
-- MongoDB 等效结构 (JSON Schema)
-- ============================================
/*
{
  "tasks": {
    "_id": "ObjectId",
    "title": "String",
    "description": "String",
    "category": "String",
    "subcategory": "String",
    "reward": "Decimal",
    "currency": "String",
    "deadline": "Date",
    "status": "String (enum)",
    "priority": "String (enum)",
    "country": "String",
    "city": "String",
    "region": "String",
    "skills_required": ["String"],
    "experience_level": "String",
    "estimated_hours": "Number",
    "attachments": "Object",
    "images": ["String"],
    "publisher_id": "ObjectId",
    "hunter_id": "ObjectId",
    "created_at": "Date",
    "updated_at": "Date",
    "started_at": "Date",
    "completed_at": "Date",
    "is_public": "Boolean",
    "auto_assign": "Boolean",
    "max_applicants": "Number",
    "view_count": "Number",
    "application_count": "Number",
    "tags": ["String"]
  },
  "task_applications": {
    "_id": "ObjectId",
    "task_id": "ObjectId",
    "hunter_id": "ObjectId",
    "application_message": "String",
    "proposed_reward": "Decimal",
    "estimated_completion_date": "Date",
    "status": "String (enum)",
    "created_at": "Date",
    "updated_at": "Date"
  },
  "task_progress": {
    "_id": "ObjectId",
    "task_id": "ObjectId",
    "hunter_id": "ObjectId",
    "progress_percentage": "Number",
    "progress_note": "String",
    "attachments": "Object",
    "created_at": "Date"
  },
  "task_deliverables": {
    "_id": "ObjectId",
    "task_id": "ObjectId",
    "hunter_id": "ObjectId",
    "title": "String",
    "description": "String",
    "file_urls": ["String"],
    "file_types": ["String"],
    "file_sizes": ["Number"],
    "status": "String (enum)",
    "publisher_feedback": "String",
    "created_at": "Date",
    "updated_at": "Date"
  }
}
*/
