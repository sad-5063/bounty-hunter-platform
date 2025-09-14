-- 钱包与支付系统数据库结构
-- 支持 PostgreSQL 和 MongoDB

-- ============================================
-- 用户钱包表 (User Wallets)
-- ============================================
CREATE TABLE user_wallets (
    wallet_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    balance DECIMAL(12,2) DEFAULT 0.00,
    frozen_balance DECIMAL(12,2) DEFAULT 0.00, -- 冻结资金（用于任务担保）
    currency VARCHAR(3) DEFAULT 'CNY',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'closed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, currency)
);

-- 交易记录表 (Transactions)
CREATE TABLE transactions (
    transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    wallet_id UUID REFERENCES user_wallets(wallet_id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'task_payment', 'task_reward', 'refund', 'fee', 'bonus')),
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'CNY',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
    
    -- 交易详情
    description TEXT,
    reference_id VARCHAR(100), -- 关联的任务ID或外部交易ID
    external_transaction_id VARCHAR(100), -- 第三方支付平台交易ID
    
    -- 手续费信息
    fee_amount DECIMAL(12,2) DEFAULT 0.00,
    fee_type VARCHAR(20), -- 'percentage', 'fixed'
    
    -- 交易元数据
    metadata JSONB, -- 存储额外的交易信息
    ip_address INET,
    user_agent TEXT,
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- 审核信息
    reviewed_by UUID REFERENCES users(user_id),
    reviewed_at TIMESTAMP,
    review_notes TEXT
);

-- 充值记录表 (Deposits)
CREATE TABLE deposits (
    deposit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    wallet_id UUID REFERENCES user_wallets(wallet_id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions(transaction_id) ON DELETE CASCADE,
    
    -- 充值信息
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'CNY',
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('bank_card', 'paypal', 'alipay', 'wechat', 'crypto')),
    
    -- 支付详情
    payment_account VARCHAR(100), -- 支付账户信息（脱敏）
    payment_reference VARCHAR(100), -- 支付平台交易号
    
    -- 状态和时间
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- 审核信息
    requires_review BOOLEAN DEFAULT FALSE,
    reviewed_by UUID REFERENCES users(user_id),
    reviewed_at TIMESTAMP,
    review_notes TEXT
);

-- 提现记录表 (Withdrawals)
CREATE TABLE withdrawals (
    withdrawal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    wallet_id UUID REFERENCES user_wallets(wallet_id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions(transaction_id) ON DELETE CASCADE,
    
    -- 提现信息
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'CNY',
    withdrawal_method VARCHAR(20) NOT NULL CHECK (withdrawal_method IN ('bank_card', 'paypal', 'alipay', 'wechat')),
    
    -- 收款账户信息
    account_holder_name VARCHAR(100),
    account_number VARCHAR(100), -- 脱敏处理
    bank_name VARCHAR(100),
    bank_code VARCHAR(20),
    account_type VARCHAR(20), -- 'savings', 'checking', 'business'
    
    -- 状态和时间
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- 审核信息
    requires_review BOOLEAN DEFAULT TRUE,
    reviewed_by UUID REFERENCES users(user_id),
    reviewed_at TIMESTAMP,
    review_notes TEXT,
    rejection_reason TEXT
);

-- 支付方式表 (Payment Methods)
CREATE TABLE payment_methods (
    payment_method_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    method_type VARCHAR(20) NOT NULL CHECK (method_type IN ('bank_card', 'paypal', 'alipay', 'wechat', 'crypto')),
    
    -- 支付方式详情
    account_name VARCHAR(100),
    account_number VARCHAR(100), -- 脱敏存储
    bank_name VARCHAR(100),
    bank_code VARCHAR(20),
    expiry_date DATE, -- 信用卡有效期
    
    -- 验证状态
    is_verified BOOLEAN DEFAULT FALSE,
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed')),
    
    -- 安全信息
    encrypted_data TEXT, -- 加密的敏感信息
    last_four_digits VARCHAR(4), -- 卡号后四位
    
    -- 状态和时间
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 资金冻结记录表 (Frozen Funds)
CREATE TABLE frozen_funds (
    freeze_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    wallet_id UUID REFERENCES user_wallets(wallet_id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions(transaction_id) ON DELETE CASCADE,
    
    -- 冻结信息
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'CNY',
    freeze_reason VARCHAR(50) NOT NULL CHECK (freeze_reason IN ('task_guarantee', 'dispute', 'security', 'manual')),
    reference_id VARCHAR(100), -- 关联的任务ID或争议ID
    
    -- 状态和时间
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'released', 'forfeited')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    released_at TIMESTAMP,
    
    -- 审核信息
    reviewed_by UUID REFERENCES users(user_id),
    review_notes TEXT
);

-- 系统配置表 (System Settings)
CREATE TABLE system_settings (
    setting_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    setting_type VARCHAR(20) DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_wallets_user ON user_wallets(user_id);
CREATE INDEX idx_wallets_status ON user_wallets(status);

CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_wallet ON transactions(wallet_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created ON transactions(created_at);
CREATE INDEX idx_transactions_reference ON transactions(reference_id);

CREATE INDEX idx_deposits_user ON deposits(user_id);
CREATE INDEX idx_deposits_status ON deposits(status);
CREATE INDEX idx_deposits_method ON deposits(payment_method);
CREATE INDEX idx_deposits_created ON deposits(created_at);

CREATE INDEX idx_withdrawals_user ON withdrawals(user_id);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);
CREATE INDEX idx_withdrawals_method ON withdrawals(withdrawal_method);
CREATE INDEX idx_withdrawals_created ON withdrawals(created_at);

CREATE INDEX idx_payment_methods_user ON payment_methods(user_id);
CREATE INDEX idx_payment_methods_type ON payment_methods(method_type);
CREATE INDEX idx_payment_methods_active ON payment_methods(is_active);

CREATE INDEX idx_frozen_funds_user ON frozen_funds(user_id);
CREATE INDEX idx_frozen_funds_status ON frozen_funds(status);
CREATE INDEX idx_frozen_funds_reason ON frozen_funds(freeze_reason);

-- 插入默认系统配置
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('min_deposit_amount', '10.00', 'number', '最小充值金额', true),
('max_deposit_amount', '50000.00', 'number', '最大充值金额', true),
('min_withdrawal_amount', '50.00', 'number', '最小提现金额', true),
('max_withdrawal_amount', '20000.00', 'number', '最大提现金额', true),
('withdrawal_fee_rate', '0.01', 'number', '提现手续费率', true),
('withdrawal_fee_min', '2.00', 'number', '最小提现手续费', true),
('deposit_fee_rate', '0.00', 'number', '充值手续费率', true),
('task_payment_fee_rate', '0.05', 'number', '任务支付手续费率', true),
('daily_withdrawal_limit', '10000.00', 'number', '每日提现限额', true),
('monthly_withdrawal_limit', '100000.00', 'number', '每月提现限额', true),
('auto_approve_withdrawal_limit', '1000.00', 'number', '自动审核提现限额', false),
('payment_timeout_minutes', '30', 'number', '支付超时时间（分钟）', false);

-- ============================================
-- MongoDB 等效结构 (JSON Schema)
-- ============================================
/*
{
  "user_wallets": {
    "_id": "ObjectId",
    "user_id": "ObjectId",
    "balance": "Decimal",
    "frozen_balance": "Decimal",
    "currency": "String",
    "status": "String (enum)",
    "created_at": "Date",
    "updated_at": "Date"
  },
  "transactions": {
    "_id": "ObjectId",
    "user_id": "ObjectId",
    "wallet_id": "ObjectId",
    "type": "String (enum)",
    "amount": "Decimal",
    "currency": "String",
    "status": "String (enum)",
    "description": "String",
    "reference_id": "String",
    "external_transaction_id": "String",
    "fee_amount": "Decimal",
    "fee_type": "String",
    "metadata": "Object",
    "ip_address": "String",
    "user_agent": "String",
    "created_at": "Date",
    "processed_at": "Date",
    "completed_at": "Date",
    "reviewed_by": "ObjectId",
    "reviewed_at": "Date",
    "review_notes": "String"
  },
  "deposits": {
    "_id": "ObjectId",
    "user_id": "ObjectId",
    "wallet_id": "ObjectId",
    "transaction_id": "ObjectId",
    "amount": "Decimal",
    "currency": "String",
    "payment_method": "String (enum)",
    "payment_account": "String",
    "payment_reference": "String",
    "status": "String (enum)",
    "created_at": "Date",
    "completed_at": "Date",
    "requires_review": "Boolean",
    "reviewed_by": "ObjectId",
    "reviewed_at": "Date",
    "review_notes": "String"
  },
  "withdrawals": {
    "_id": "ObjectId",
    "user_id": "ObjectId",
    "wallet_id": "ObjectId",
    "transaction_id": "ObjectId",
    "amount": "Decimal",
    "currency": "String",
    "withdrawal_method": "String (enum)",
    "account_holder_name": "String",
    "account_number": "String",
    "bank_name": "String",
    "bank_code": "String",
    "account_type": "String",
    "status": "String (enum)",
    "created_at": "Date",
    "processed_at": "Date",
    "completed_at": "Date",
    "requires_review": "Boolean",
    "reviewed_by": "ObjectId",
    "reviewed_at": "Date",
    "review_notes": "String",
    "rejection_reason": "String"
  },
  "payment_methods": {
    "_id": "ObjectId",
    "user_id": "ObjectId",
    "method_type": "String (enum)",
    "account_name": "String",
    "account_number": "String",
    "bank_name": "String",
    "bank_code": "String",
    "expiry_date": "Date",
    "is_verified": "Boolean",
    "verification_status": "String (enum)",
    "encrypted_data": "String",
    "last_four_digits": "String",
    "is_active": "Boolean",
    "is_default": "Boolean",
    "created_at": "Date",
    "updated_at": "Date"
  }
}
*/
