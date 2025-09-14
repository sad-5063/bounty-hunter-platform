-- 评价相关表结构
-- PostgreSQL 数据库

-- 评价表
CREATE TABLE reviews (
    review_id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES tasks(task_id),
    reviewer_id INTEGER REFERENCES users(user_id),
    target_id INTEGER REFERENCES users(user_id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 评价标签表
CREATE TABLE review_tags (
    tag_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('positive', 'negative', 'neutral')),
    color VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 评价标签关联表
CREATE TABLE review_tag_relations (
    review_id INTEGER REFERENCES reviews(review_id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES review_tags(tag_id) ON DELETE CASCADE,
    PRIMARY KEY (review_id, tag_id)
);

-- 评价举报表
CREATE TABLE review_reports (
    report_id SERIAL PRIMARY KEY,
    review_id INTEGER REFERENCES reviews(review_id) ON DELETE CASCADE,
    reporter_id INTEGER REFERENCES users(user_id),
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by INTEGER REFERENCES users(user_id)
);

-- 评价模板表
CREATE TABLE review_templates (
    template_id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 评价统计表
CREATE TABLE review_statistics (
    user_id INTEGER PRIMARY KEY REFERENCES users(user_id),
    total_reviews INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    five_star_count INTEGER DEFAULT 0,
    four_star_count INTEGER DEFAULT 0,
    three_star_count INTEGER DEFAULT 0,
    two_star_count INTEGER DEFAULT 0,
    one_star_count INTEGER DEFAULT 0,
    positive_reviews INTEGER DEFAULT 0,
    negative_reviews INTEGER DEFAULT 0,
    last_review_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 评价回复表
CREATE TABLE review_replies (
    reply_id SERIAL PRIMARY KEY,
    review_id INTEGER REFERENCES reviews(review_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(user_id),
    content TEXT NOT NULL,
    is_author_reply BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 评价点赞表
CREATE TABLE review_likes (
    like_id SERIAL PRIMARY KEY,
    review_id INTEGER REFERENCES reviews(review_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(review_id, user_id)
);

-- 评价收藏表
CREATE TABLE review_favorites (
    favorite_id SERIAL PRIMARY KEY,
    review_id INTEGER REFERENCES reviews(review_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(review_id, user_id)
);

-- 评价历史表（用于追踪评价修改历史）
CREATE TABLE review_history (
    history_id SERIAL PRIMARY KEY,
    review_id INTEGER REFERENCES reviews(review_id) ON DELETE CASCADE,
    old_rating INTEGER,
    new_rating INTEGER,
    old_comment TEXT,
    new_comment TEXT,
    changed_by INTEGER REFERENCES users(user_id),
    change_reason VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_reviews_task ON reviews(task_id);
CREATE INDEX idx_reviews_reviewer ON reviews(reviewer_id);
CREATE INDEX idx_reviews_target ON reviews(target_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at);
CREATE INDEX idx_review_reports_review ON review_reports(review_id);
CREATE INDEX idx_review_reports_reporter ON review_reports(reporter_id);
CREATE INDEX idx_review_reports_status ON review_reports(status);
CREATE INDEX idx_review_templates_category ON review_templates(category);
CREATE INDEX idx_review_statistics_rating ON review_statistics(average_rating);
CREATE INDEX idx_review_replies_review ON review_replies(review_id);
CREATE INDEX idx_review_replies_user ON review_replies(user_id);
CREATE INDEX idx_review_likes_review ON review_likes(review_id);
CREATE INDEX idx_review_likes_user ON review_likes(user_id);
CREATE INDEX idx_review_favorites_review ON review_favorites(review_id);
CREATE INDEX idx_review_favorites_user ON review_favorites(user_id);
CREATE INDEX idx_review_history_review ON review_history(review_id);

-- 插入默认评价标签
INSERT INTO review_tags (name, category, color) VALUES 
-- 正面标签
('专业', 'positive', '#10b981'),
('高效', 'positive', '#10b981'),
('沟通良好', 'positive', '#10b981'),
('质量优秀', 'positive', '#10b981'),
('按时完成', 'positive', '#10b981'),
('创意十足', 'positive', '#10b981'),
('服务周到', 'positive', '#10b981'),
('值得推荐', 'positive', '#10b981'),
-- 负面标签
('质量差', 'negative', '#ef4444'),
('沟通困难', 'negative', '#ef4444'),
('延迟交付', 'negative', '#ef4444'),
('态度不好', 'negative', '#ef4444'),
('不专业', 'negative', '#ef4444'),
('价格不合理', 'negative', '#ef4444'),
('服务差', 'negative', '#ef4444'),
('不推荐', 'negative', '#ef4444'),
-- 中性标签
('一般', 'neutral', '#6b7280'),
('还可以', 'neutral', '#6b7280'),
('中等', 'neutral', '#6b7280'),
('普通', 'neutral', '#6b7280');

-- 插入默认评价模板
INSERT INTO review_templates (category, title, content, rating) VALUES 
('design', '设计质量优秀', '设计师非常专业，设计质量超出预期，沟通顺畅，强烈推荐！', 5),
('design', '设计不错', '设计质量还可以，基本满足需求，沟通正常。', 4),
('design', '设计一般', '设计质量一般，有些地方需要改进，但整体还可以。', 3),
('development', '开发专业', '开发者技术过硬，代码质量高，按时完成项目，非常满意！', 5),
('development', '开发良好', '开发质量不错，功能实现完整，沟通良好。', 4),
('development', '开发一般', '开发质量一般，基本功能实现，但有些细节需要优化。', 3),
('writing', '写作优秀', '文笔流畅，内容质量高，按时交付，非常专业！', 5),
('writing', '写作良好', '写作质量不错，内容符合要求，沟通顺畅。', 4),
('writing', '写作一般', '写作质量一般，基本满足需求，但还有提升空间。', 3);

-- 创建触发器：更新评价统计
CREATE OR REPLACE FUNCTION update_review_statistics()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- 插入新评价时更新统计
        INSERT INTO review_statistics (user_id, total_reviews, average_rating, 
                                     five_star_count, four_star_count, three_star_count, 
                                     two_star_count, one_star_count, last_review_at)
        VALUES (NEW.target_id, 1, NEW.rating, 
                CASE WHEN NEW.rating = 5 THEN 1 ELSE 0 END,
                CASE WHEN NEW.rating = 4 THEN 1 ELSE 0 END,
                CASE WHEN NEW.rating = 3 THEN 1 ELSE 0 END,
                CASE WHEN NEW.rating = 2 THEN 1 ELSE 0 END,
                CASE WHEN NEW.rating = 1 THEN 1 ELSE 0 END,
                CURRENT_TIMESTAMP)
        ON CONFLICT (user_id) DO UPDATE SET
            total_reviews = review_statistics.total_reviews + 1,
            average_rating = (review_statistics.average_rating * review_statistics.total_reviews + NEW.rating) / (review_statistics.total_reviews + 1),
            five_star_count = review_statistics.five_star_count + CASE WHEN NEW.rating = 5 THEN 1 ELSE 0 END,
            four_star_count = review_statistics.four_star_count + CASE WHEN NEW.rating = 4 THEN 1 ELSE 0 END,
            three_star_count = review_statistics.three_star_count + CASE WHEN NEW.rating = 3 THEN 1 ELSE 0 END,
            two_star_count = review_statistics.two_star_count + CASE WHEN NEW.rating = 2 THEN 1 ELSE 0 END,
            one_star_count = review_statistics.one_star_count + CASE WHEN NEW.rating = 1 THEN 1 ELSE 0 END,
            positive_reviews = review_statistics.positive_reviews + CASE WHEN NEW.rating >= 4 THEN 1 ELSE 0 END,
            negative_reviews = review_statistics.negative_reviews + CASE WHEN NEW.rating <= 2 THEN 1 ELSE 0 END,
            last_review_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP;
    ELSIF TG_OP = 'UPDATE' THEN
        -- 更新评价时重新计算统计
        UPDATE review_statistics SET
            average_rating = (
                SELECT AVG(rating)::DECIMAL(3,2) 
                FROM reviews 
                WHERE target_id = NEW.target_id
            ),
            five_star_count = (
                SELECT COUNT(*) 
                FROM reviews 
                WHERE target_id = NEW.target_id AND rating = 5
            ),
            four_star_count = (
                SELECT COUNT(*) 
                FROM reviews 
                WHERE target_id = NEW.target_id AND rating = 4
            ),
            three_star_count = (
                SELECT COUNT(*) 
                FROM reviews 
                WHERE target_id = NEW.target_id AND rating = 3
            ),
            two_star_count = (
                SELECT COUNT(*) 
                FROM reviews 
                WHERE target_id = NEW.target_id AND rating = 2
            ),
            one_star_count = (
                SELECT COUNT(*) 
                FROM reviews 
                WHERE target_id = NEW.target_id AND rating = 1
            ),
            positive_reviews = (
                SELECT COUNT(*) 
                FROM reviews 
                WHERE target_id = NEW.target_id AND rating >= 4
            ),
            negative_reviews = (
                SELECT COUNT(*) 
                FROM reviews 
                WHERE target_id = NEW.target_id AND rating <= 2
            ),
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = NEW.target_id;
    ELSIF TG_OP = 'DELETE' THEN
        -- 删除评价时更新统计
        UPDATE review_statistics SET
            total_reviews = review_statistics.total_reviews - 1,
            average_rating = CASE 
                WHEN review_statistics.total_reviews - 1 = 0 THEN 0.00
                ELSE (review_statistics.average_rating * review_statistics.total_reviews - OLD.rating) / (review_statistics.total_reviews - 1)
            END,
            five_star_count = review_statistics.five_star_count - CASE WHEN OLD.rating = 5 THEN 1 ELSE 0 END,
            four_star_count = review_statistics.four_star_count - CASE WHEN OLD.rating = 4 THEN 1 ELSE 0 END,
            three_star_count = review_statistics.three_star_count - CASE WHEN OLD.rating = 3 THEN 1 ELSE 0 END,
            two_star_count = review_statistics.two_star_count - CASE WHEN OLD.rating = 2 THEN 1 ELSE 0 END,
            one_star_count = review_statistics.one_star_count - CASE WHEN OLD.rating = 1 THEN 1 ELSE 0 END,
            positive_reviews = review_statistics.positive_reviews - CASE WHEN OLD.rating >= 4 THEN 1 ELSE 0 END,
            negative_reviews = review_statistics.negative_reviews - CASE WHEN OLD.rating <= 2 THEN 1 ELSE 0 END,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = OLD.target_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_review_statistics
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_review_statistics();

-- 创建触发器：记录评价修改历史
CREATE OR REPLACE FUNCTION log_review_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND (OLD.rating != NEW.rating OR OLD.comment != NEW.comment) THEN
        INSERT INTO review_history (review_id, old_rating, new_rating, old_comment, new_comment, changed_by, change_reason)
        VALUES (NEW.review_id, OLD.rating, NEW.rating, OLD.comment, NEW.comment, NEW.reviewer_id, '用户修改');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_review_changes
    AFTER UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION log_review_changes();

-- 创建视图：评价统计
CREATE VIEW review_stats AS
SELECT 
    COUNT(*) as total_reviews,
    COALESCE(AVG(rating), 0) as average_rating,
    COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star_reviews,
    COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star_reviews,
    COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star_reviews,
    COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star_reviews,
    COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star_reviews,
    COUNT(CASE WHEN rating >= 4 THEN 1 END) as positive_reviews,
    COUNT(CASE WHEN rating <= 2 THEN 1 END) as negative_reviews
FROM reviews;
