-- 赏金猎人平台数据库结构
-- PostgreSQL 数据库

-- 用户表
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    wallet_balance DECIMAL(10,2) DEFAULT 0.00,
    reputation_score INTEGER DEFAULT 0,
    phone VARCHAR(20),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 任务表
CREATE TABLE tasks (
    task_id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    reward DECIMAL(10,2) NOT NULL,
    deadline TIMESTAMP NOT NULL,
    attachments JSONB,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    publisher_id INTEGER REFERENCES users(user_id),
    hunter_id INTEGER REFERENCES users(user_id),
    location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 钱包交易表
CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    amount DECIMAL(10,2) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'task_reward', 'task_payment')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 评价表
CREATE TABLE reviews (
    review_id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES tasks(task_id),
    reviewer_id INTEGER REFERENCES users(user_id),
    target_id INTEGER REFERENCES users(user_id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 消息表
CREATE TABLE messages (
    message_id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(user_id),
    receiver_id INTEGER REFERENCES users(user_id),
    task_id INTEGER REFERENCES tasks(task_id),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 通知表
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_category ON tasks(category);
CREATE INDEX idx_tasks_publisher ON tasks(publisher_id);
CREATE INDEX idx_tasks_hunter ON tasks(hunter_id);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);

-- 插入示例数据
INSERT INTO users (email, password_hash, name, role) VALUES 
('admin@bountyhunter.com', '$2b$10$example_hash', 'Admin User', 'admin'),
('demo@example.com', '$2b$10$example_hash', 'Demo User', 'user');

INSERT INTO tasks (title, description, category, reward, deadline, publisher_id) VALUES 
('网站设计任务', '需要一个现代化的网站设计', 'design', 500.00, '2024-02-15 23:59:59', 2),
('数据录入任务', '需要录入1000条客户数据', 'data_entry', 200.00, '2024-02-10 18:00:00', 2);
