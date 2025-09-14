-- 钱包相关表结构
-- PostgreSQL 数据库

-- 钱包交易表
CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    amount DECIMAL(10,2) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'task_reward', 'task_payment', 'transfer', 'refund', 'fee')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    description TEXT,
    target_user_id INTEGER REFERENCES users(user_id),
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    fee_amount DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    failed_reason TEXT
);

-- 钱包冻结记录表
CREATE TABLE wallet_freeze_records (
    freeze_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    amount DECIMAL(10,2) NOT NULL,
    reason VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'released')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    released_at TIMESTAMP,
    released_by INTEGER REFERENCES users(user_id)
);

-- 支付方式表
CREATE TABLE payment_methods (
    method_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('bank_card', 'alipay', 'wechat', 'paypal', 'stripe')),
    is_active BOOLEAN DEFAULT TRUE,
    min_amount DECIMAL(10,2) DEFAULT 1.00,
    max_amount DECIMAL(10,2) DEFAULT 10000.00,
    fee_rate DECIMAL(5,4) DEFAULT 0.0000,
    fee_fixed DECIMAL(10,2) DEFAULT 0.00,
    processing_time VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 提现方式表
CREATE TABLE withdraw_methods (
    method_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('bank_card', 'alipay', 'wechat', 'paypal')),
    is_active BOOLEAN DEFAULT TRUE,
    min_amount DECIMAL(10,2) DEFAULT 10.00,
    max_amount DECIMAL(10,2) DEFAULT 50000.00,
    fee_rate DECIMAL(5,4) DEFAULT 0.0000,
    fee_fixed DECIMAL(10,2) DEFAULT 0.00,
    processing_time VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户支付密码表
CREATE TABLE user_payment_passwords (
    user_id INTEGER PRIMARY KEY REFERENCES users(user_id),
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户绑定的支付账户表
CREATE TABLE user_payment_accounts (
    account_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('bank_card', 'alipay', 'wechat', 'paypal')),
    account_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(255) NOT NULL,
    bank_name VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP
);

-- 交易手续费表
CREATE TABLE transaction_fees (
    fee_id SERIAL PRIMARY KEY,
    transaction_type VARCHAR(20) NOT NULL,
    payment_method VARCHAR(50),
    fee_type VARCHAR(20) NOT NULL CHECK (fee_type IN ('rate', 'fixed', 'hybrid')),
    fee_rate DECIMAL(5,4) DEFAULT 0.0000,
    fee_fixed DECIMAL(10,2) DEFAULT 0.00,
    min_fee DECIMAL(10,2) DEFAULT 0.00,
    max_fee DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 钱包日志表
CREATE TABLE wallet_logs (
    log_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    action VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2),
    balance_before DECIMAL(10,2),
    balance_after DECIMAL(10,2),
    transaction_id INTEGER REFERENCES transactions(transaction_id),
    description TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_target_user ON transactions(target_user_id);
CREATE INDEX idx_wallet_freeze_records_user ON wallet_freeze_records(user_id);
CREATE INDEX idx_wallet_freeze_records_status ON wallet_freeze_records(status);
CREATE INDEX idx_user_payment_accounts_user ON user_payment_accounts(user_id);
CREATE INDEX idx_user_payment_accounts_type ON user_payment_accounts(account_type);
CREATE INDEX idx_transaction_fees_type ON transaction_fees(transaction_type);
CREATE INDEX idx_wallet_logs_user ON wallet_logs(user_id);
CREATE INDEX idx_wallet_logs_action ON wallet_logs(action);
CREATE INDEX idx_wallet_logs_created_at ON wallet_logs(created_at);

-- 插入默认支付方式
INSERT INTO payment_methods (name, type, min_amount, max_amount, fee_rate, processing_time, description) VALUES 
('支付宝', 'alipay', 1.00, 50000.00, 0.0060, '即时到账', '支付宝快捷支付'),
('微信支付', 'wechat', 1.00, 50000.00, 0.0060, '即时到账', '微信支付'),
('银行卡', 'bank_card', 1.00, 100000.00, 0.0050, '1-3个工作日', '银行卡支付'),
('PayPal', 'paypal', 1.00, 10000.00, 0.0340, '即时到账', 'PayPal国际支付');

-- 插入默认提现方式
INSERT INTO withdraw_methods (name, type, min_amount, max_amount, fee_rate, processing_time, description) VALUES 
('支付宝', 'alipay', 10.00, 50000.00, 0.0010, '1-2个工作日', '提现到支付宝'),
('微信', 'wechat', 10.00, 50000.00, 0.0010, '1-2个工作日', '提现到微信'),
('银行卡', 'bank_card', 50.00, 100000.00, 0.0005, '1-3个工作日', '提现到银行卡'),
('PayPal', 'paypal', 10.00, 10000.00, 0.0200, '3-5个工作日', '提现到PayPal');

-- 插入默认交易手续费
INSERT INTO transaction_fees (transaction_type, payment_method, fee_type, fee_rate, fee_fixed) VALUES 
('deposit', 'alipay', 'rate', 0.0060, 0.00),
('deposit', 'wechat', 'rate', 0.0060, 0.00),
('deposit', 'bank_card', 'rate', 0.0050, 0.00),
('deposit', 'paypal', 'rate', 0.0340, 0.00),
('withdrawal', 'alipay', 'rate', 0.0010, 0.00),
('withdrawal', 'wechat', 'rate', 0.0010, 0.00),
('withdrawal', 'bank_card', 'rate', 0.0005, 0.00),
('withdrawal', 'paypal', 'rate', 0.0200, 0.00),
('transfer', NULL, 'fixed', 0.0000, 0.00);

-- 创建触发器：更新用户余额
CREATE OR REPLACE FUNCTION update_user_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        IF NEW.type IN ('deposit', 'task_reward', 'transfer') THEN
            UPDATE users 
            SET wallet_balance = wallet_balance + NEW.amount
            WHERE user_id = NEW.user_id;
        ELSIF NEW.type IN ('withdrawal', 'task_payment') THEN
            UPDATE users 
            SET wallet_balance = wallet_balance - NEW.amount
            WHERE user_id = NEW.user_id;
        END IF;
        
        -- 记录钱包日志
        INSERT INTO wallet_logs (user_id, action, amount, transaction_id, description)
        VALUES (NEW.user_id, NEW.type, NEW.amount, NEW.transaction_id, NEW.description);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_balance
    AFTER UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_balance();

-- 创建视图：钱包统计
CREATE VIEW wallet_stats AS
SELECT 
    COUNT(*) as total_transactions,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_transactions,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_transactions,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_transactions,
    COALESCE(SUM(CASE WHEN type = 'deposit' AND status = 'completed' THEN amount ELSE 0 END), 0) as total_deposits,
    COALESCE(SUM(CASE WHEN type = 'withdrawal' AND status = 'completed' THEN amount ELSE 0 END), 0) as total_withdrawals,
    COALESCE(SUM(CASE WHEN type = 'task_reward' AND status = 'completed' THEN amount ELSE 0 END), 0) as total_rewards,
    COALESCE(SUM(CASE WHEN type = 'task_payment' AND status = 'completed' THEN amount ELSE 0 END), 0) as total_payments,
    COALESCE(SUM(CASE WHEN type = 'transfer' AND status = 'completed' THEN amount ELSE 0 END), 0) as total_transfers,
    COALESCE(SUM(CASE WHEN status = 'completed' THEN fee_amount ELSE 0 END), 0) as total_fees
FROM transactions;
