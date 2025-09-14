import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://eqqcrkghiavkjgfmzhnb.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key-here'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 数据库表名常量
export const TABLES = {
  USERS: 'users',
  TASKS: 'tasks',
  TRANSACTIONS: 'transactions',
  REVIEWS: 'reviews',
  MESSAGES: 'messages',
  NOTIFICATIONS: 'notifications'
}

// 认证相关函数
export const auth = {
  // 用户注册
  async signUp(email, password, userData) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  },

  // 用户登录
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // 用户登出
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // 获取当前用户
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  }
}

// 任务相关函数
export const tasks = {
  // 获取任务列表
  async getTasks(filters = {}) {
    let query = supabase
      .from(TABLES.TASKS)
      .select(`
        *,
        publisher:users!tasks_publisher_id_fkey(name, avatar_url),
        hunter:users!tasks_hunter_id_fkey(name, avatar_url)
      `)
      .order('created_at', { ascending: false })

    // 应用筛选条件
    if (filters.category) {
      query = query.eq('category', filters.category)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.minReward) {
      query = query.gte('reward', filters.minReward)
    }
    if (filters.maxReward) {
      query = query.lte('reward', filters.maxReward)
    }

    const { data, error } = await query
    return { data, error }
  },

  // 获取任务详情
  async getTask(taskId) {
    const { data, error } = await supabase
      .from(TABLES.TASKS)
      .select(`
        *,
        publisher:users!tasks_publisher_id_fkey(*),
        hunter:users!tasks_hunter_id_fkey(*)
      `)
      .eq('task_id', taskId)
      .single()

    return { data, error }
  },

  // 创建任务
  async createTask(taskData) {
    const { data, error } = await supabase
      .from(TABLES.TASKS)
      .insert([taskData])
      .select()
      .single()

    return { data, error }
  },

  // 更新任务
  async updateTask(taskId, updates) {
    const { data, error } = await supabase
      .from(TABLES.TASKS)
      .update(updates)
      .eq('task_id', taskId)
      .select()
      .single()

    return { data, error }
  },

  // 接受任务
  async acceptTask(taskId, hunterId) {
    const { data, error } = await supabase
      .from(TABLES.TASKS)
      .update({ 
        status: 'in_progress', 
        hunter_id: hunterId,
        updated_at: new Date().toISOString()
      })
      .eq('task_id', taskId)
      .select()
      .single()

    return { data, error }
  }
}

// 用户相关函数
export const users = {
  // 获取用户信息
  async getUser(userId) {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .eq('user_id', userId)
      .single()

    return { data, error }
  },

  // 更新用户信息
  async updateUser(userId, updates) {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()

    return { data, error }
  }
}

// 钱包相关函数
export const wallet = {
  // 获取交易记录
  async getTransactions(userId, limit = 20) {
    const { data, error } = await supabase
      .from(TABLES.TRANSACTIONS)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    return { data, error }
  },

  // 创建交易记录
  async createTransaction(transactionData) {
    const { data, error } = await supabase
      .from(TABLES.TRANSACTIONS)
      .insert([transactionData])
      .select()
      .single()

    return { data, error }
  }
}

// 评价相关函数
export const reviews = {
  // 获取用户评价
  async getUserReviews(userId) {
    const { data, error } = await supabase
      .from(TABLES.REVIEWS)
      .select(`
        *,
        reviewer:users!reviews_reviewer_id_fkey(name, avatar_url),
        task:tasks(title)
      `)
      .eq('target_id', userId)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  // 创建评价
  async createReview(reviewData) {
    const { data, error } = await supabase
      .from(TABLES.REVIEWS)
      .insert([reviewData])
      .select()
      .single()

    return { data, error }
  }
}

export default supabase
