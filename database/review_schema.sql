-- 评价与信誉系统数据库结构
-- 支持 PostgreSQL 和 MongoDB

-- ============================================
-- 任务评价表 (Task Reviews)
-- ============================================
CREATE TABLE task_reviews (
    review_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(task_id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES users(user_id) ON DELETE CASCADE, -- 评价者
    target_id UUID REFERENCES users(user_id) ON DELETE CASCADE,  -- 被评价者
    
    -- 评价内容
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    
    -- 评价维度（可选）
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    timeliness_rating INTEGER CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
    professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
    
    -- 评价类型
    review_type VARCHAR(20) NOT NULL CHECK (review_type IN ('publisher_to_hunter', 'hunter_to_publisher', 'mutual')),
    
    -- 状态和时间
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'reported', 'deleted')),
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- 确保一个用户只能对同一个任务评价一次
    UNIQUE(task_id, reviewer_id, review_type)
);

-- 评价回复表 (Review Replies)
CREATE TABLE review_replies (
    reply_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES task_reviews(review_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    reply_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户信誉表 (User Reputation)
CREATE TABLE user_reputation (
    reputation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    badges JSONB DEFAULT '[]', -- 存储用户获得的徽章
    
    -- 信誉历史
    reputation_history JSONB DEFAULT '[]', -- 存储信誉变化历史
    
    -- 状态和时间
    is_verified BOOLEAN DEFAULT FALSE,
    last_calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id)
);

-- 信誉徽章表 (Reputation Badges)
CREATE TABLE reputation_badges (
    badge_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    badge_name VARCHAR(50) UNIQUE NOT NULL,
    badge_description TEXT,
    badge_icon VARCHAR(50), -- 图标名称或URL
    badge_color VARCHAR(7), -- 十六进制颜色代码
    
    -- 获得条件
    condition_type VARCHAR(20) NOT NULL CHECK (condition_type IN ('rating_threshold', 'review_count', 'task_count', 'special')),
    condition_value DECIMAL(10,2),
    condition_description TEXT,
    
    -- 徽章属性
    badge_category VARCHAR(20) DEFAULT 'general' CHECK (badge_category IN ('general', 'quality', 'communication', 'timeliness', 'professionalism', 'special')),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 评价举报表 (Review Reports)
CREATE TABLE review_reports (
    report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES task_reviews(review_id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- 举报信息
    report_reason VARCHAR(50) NOT NULL CHECK (report_reason IN ('inappropriate_content', 'fake_review', 'spam', 'harassment', 'other')),
    report_description TEXT,
    
    -- 处理状态
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'rejected')),
    reviewed_by UUID REFERENCES users(user_id),
    reviewed_at TIMESTAMP,
    review_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 信誉规则表 (Reputation Rules)
CREATE TABLE reputation_rules (
    rule_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_name VARCHAR(100) NOT NULL,
    rule_description TEXT,
    
    -- 规则条件
    condition_type VARCHAR(20) NOT NULL CHECK (condition_type IN ('rating', 'review_count', 'task_count', 'time_period')),
    condition_value DECIMAL(10,2),
    condition_operator VARCHAR(10) DEFAULT '>=' CHECK (condition_operator IN ('>', '>=', '=', '<', '<=')),
    
    -- 规则效果
    effect_type VARCHAR(20) NOT NULL CHECK (effect_type IN ('score_adjustment', 'level_change', 'badge_award', 'penalty')),
    effect_value DECIMAL(10,2),
    effect_description TEXT,
    
    -- 规则属性
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_reviews_task ON task_reviews(task_id);
CREATE INDEX idx_reviews_reviewer ON task_reviews(reviewer_id);
CREATE INDEX idx_reviews_target ON task_reviews(target_id);
CREATE INDEX idx_reviews_type ON task_reviews(review_type);
CREATE INDEX idx_reviews_rating ON task_reviews(rating);
CREATE INDEX idx_reviews_created ON task_reviews(created_at);

CREATE INDEX idx_replies_review ON review_replies(review_id);
CREATE INDEX idx_replies_user ON review_replies(user_id);

CREATE INDEX idx_reputation_user ON user_reputation(user_id);
CREATE INDEX idx_reputation_score ON user_reputation(reputation_score);
CREATE INDEX idx_reputation_level ON user_reputation(reputation_level);

CREATE INDEX idx_reports_review ON review_reports(review_id);
CREATE INDEX idx_reports_reporter ON review_reports(reporter_id);
CREATE INDEX idx_reports_status ON review_reports(status);

CREATE INDEX idx_badges_category ON reputation_badges(badge_category);
CREATE INDEX idx_badges_active ON reputation_badges(is_active);

CREATE INDEX idx_rules_type ON reputation_rules(condition_type);
CREATE INDEX idx_rules_active ON reputation_rules(is_active);

-- 插入默认信誉徽章
INSERT INTO reputation_badges (badge_name, badge_description, badge_icon, badge_color, condition_type, condition_value, condition_description, badge_category, sort_order) VALUES
('新手', '完成第一个任务', '🆕', '#6b7280', 'task_count', 1, '完成1个任务', 'general', 1),
('青铜', '获得10个好评', '🥉', '#cd7f32', 'review_count', 10, '获得10个5星评价', 'general', 2),
('白银', '获得50个好评', '🥈', '#c0c0c0', 'review_count', 50, '获得50个5星评价', 'general', 3),
('黄金', '获得100个好评', '🥇', '#ffd700', 'review_count', 100, '获得100个5星评价', 'general', 4),
('白金', '获得500个好评', '💎', '#e5e4e2', 'review_count', 500, '获得500个5星评价', 'general', 5),
('钻石', '获得1000个好评', '💠', '#b9f2ff', 'review_count', 1000, '获得1000个5星评价', 'general', 6),
('质量专家', '质量评分平均4.5+', '⭐', '#10b981', 'rating_threshold', 4.5, '质量评分平均4.5分以上', 'quality', 7),
('沟通达人', '沟通评分平均4.5+', '💬', '#3b82f6', 'rating_threshold', 4.5, '沟通评分平均4.5分以上', 'communication', 8),
('守时专家', '准时完成率95%+', '⏰', '#f59e0b', 'rating_threshold', 4.5, '准时完成率95%以上', 'timeliness', 9),
('专业大师', '专业评分平均4.5+', '🎯', '#8b5cf6', 'rating_threshold', 4.5, '专业评分平均4.5分以上', 'professionalism', 10);

-- 插入默认信誉规则
INSERT INTO reputation_rules (rule_name, rule_description, condition_type, condition_value, condition_operator, effect_type, effect_value, effect_description, priority) VALUES
('新手保护', '新用户初始信誉值', 'review_count', 0, '=', 'score_adjustment', 5.0, '新用户初始信誉值为5.0', 1),
('好评奖励', '获得5星评价奖励', 'rating', 5, '=', 'score_adjustment', 0.1, '获得5星评价信誉值+0.1', 2),
('差评惩罚', '获得1星评价惩罚', 'rating', 1, '=', 'score_adjustment', -0.2, '获得1星评价信誉值-0.2', 3),
('评价数量奖励', '评价数量达到阈值奖励', 'review_count', 10, '>=', 'score_adjustment', 0.5, '评价数量达到10个信誉值+0.5', 4),
('信誉等级提升', '信誉值达到等级阈值', 'rating', 6.0, '>=', 'level_change', 1, '信誉值达到6.0提升到白银等级', 5);

-- ============================================
-- MongoDB 等效结构 (JSON Schema)
-- ============================================
/*
{
  "task_reviews": {
    "_id": "ObjectId",
    "task_id": "ObjectId",
    "reviewer_id": "ObjectId",
    "target_id": "ObjectId",
    "rating": "Number (1-5)",
    "comment": "String",
    "quality_rating": "Number (1-5)",
    "communication_rating": "Number (1-5)",
    "timeliness_rating": "Number (1-5)",
    "professionalism_rating": "Number (1-5)",
    "review_type": "String (enum)",
    "status": "String (enum)",
    "is_anonymous": "Boolean",
    "created_at": "Date",
    "updated_at": "Date"
  },
  "review_replies": {
    "_id": "ObjectId",
    "review_id": "ObjectId",
    "user_id": "ObjectId",
    "reply_text": "String",
    "created_at": "Date",
    "updated_at": "Date"
  },
  "user_reputation": {
    "_id": "ObjectId",
    "user_id": "ObjectId",
    "reputation_score": "Decimal (0-10)",
    "reputation_level": "String (enum)",
    "total_reviews": "Number",
    "positive_reviews": "Number",
    "negative_reviews": "Number",
    "neutral_reviews": "Number",
    "avg_quality_rating": "Decimal",
    "avg_communication_rating": "Decimal",
    "avg_timeliness_rating": "Decimal",
    "avg_professionalism_rating": "Decimal",
    "badges": ["Object"],
    "reputation_history": ["Object"],
    "is_verified": "Boolean",
    "last_calculated_at": "Date",
    "created_at": "Date",
    "updated_at": "Date"
  },
  "reputation_badges": {
    "_id": "ObjectId",
    "badge_name": "String",
    "badge_description": "String",
    "badge_icon": "String",
    "badge_color": "String",
    "condition_type": "String (enum)",
    "condition_value": "Decimal",
    "condition_description": "String",
    "badge_category": "String (enum)",
    "is_active": "Boolean",
    "sort_order": "Number",
    "created_at": "Date"
  },
  "review_reports": {
    "_id": "ObjectId",
    "review_id": "ObjectId",
    "reporter_id": "ObjectId",
    "report_reason": "String (enum)",
    "report_description": "String",
    "status": "String (enum)",
    "reviewed_by": "ObjectId",
    "reviewed_at": "Date",
    "review_notes": "String",
    "created_at": "Date",
    "updated_at": "Date"
  },
  "reputation_rules": {
    "_id": "ObjectId",
    "rule_name": "String",
    "rule_description": "String",
    "condition_type": "String (enum)",
    "condition_value": "Decimal",
    "condition_operator": "String (enum)",
    "effect_type": "String (enum)",
    "effect_value": "Decimal",
    "effect_description": "String",
    "is_active": "Boolean",
    "priority": "Number",
    "created_at": "Date",
    "updated_at": "Date"
  }
}
*/
