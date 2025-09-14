import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './AdminPage.css';

const AdminPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // 模拟数据
  const [users] = useState([
    { id: 1, name: '张三', email: 'zhangsan@example.com', role: 'user', status: 'active', joinDate: '2025-01-01' },
    { id: 2, name: '李四', email: 'lisi@example.com', role: 'user', status: 'active', joinDate: '2025-01-02' },
    { id: 3, name: '王五', email: 'wangwu@example.com', role: 'admin', status: 'active', joinDate: '2025-01-03' }
  ]);

  const [tasks] = useState([
    { id: 1, title: '网站设计任务', publisher: '张三', reward: 2000, status: 'open', createdAt: '2025-01-10' },
    { id: 2, title: '内容创作', publisher: '李四', reward: 500, status: 'completed', createdAt: '2025-01-09' },
    { id: 3, title: '数据分析', publisher: '王五', reward: 1500, status: 'open', createdAt: '2025-01-08' }
  ]);

  const [transactions] = useState([
    { id: 1, user: '张三', amount: 2000, type: 'income', status: 'completed', date: '2025-01-10' },
    { id: 2, user: '李四', amount: 500, type: 'expense', status: 'completed', date: '2025-01-09' },
    { id: 3, user: '王五', amount: 1500, type: 'income', status: 'pending', date: '2025-01-08' }
  ]);

  // 检查管理员权限
  if (user?.role !== 'admin') {
    return (
      <div className="admin-page">
        <div className="access-denied">
          <h2>访问被拒绝</h2>
          <p>您没有权限访问管理后台</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        <h1>管理后台</h1>
        
        <div className="admin-tabs">
          <button 
            className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            仪表板
          </button>
          <button 
            className={`tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            用户管理
          </button>
          <button 
            className={`tab ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            任务管理
          </button>
          <button 
            className={`tab ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            资金管理
          </button>
        </div>
        
        <div className="admin-content">
          {activeTab === 'dashboard' && (
            <div className="dashboard-section">
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>总用户数</h3>
                  <div className="stat-number">{users.length}</div>
                </div>
                <div className="stat-card">
                  <h3>总任务数</h3>
                  <div className="stat-number">{tasks.length}</div>
                </div>
                <div className="stat-card">
                  <h3>总交易额</h3>
                  <div className="stat-number">¥{transactions.reduce((sum, t) => sum + t.amount, 0)}</div>
                </div>
                <div className="stat-card">
                  <h3>活跃用户</h3>
                  <div className="stat-number">{users.filter(u => u.status === 'active').length}</div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'users' && (
            <div className="users-section">
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>姓名</th>
                      <th>邮箱</th>
                      <th>角色</th>
                      <th>状态</th>
                      <th>加入时间</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>
                          <span className={`status-badge ${user.status}`}>
                            {user.status === 'active' ? '活跃' : '禁用'}
                          </span>
                        </td>
                        <td>{user.joinDate}</td>
                        <td>
                          <button className="btn btn-secondary">编辑</button>
                          <button className="btn btn-danger">禁用</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {activeTab === 'tasks' && (
            <div className="tasks-section">
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>任务标题</th>
                      <th>发布者</th>
                      <th>赏金</th>
                      <th>状态</th>
                      <th>创建时间</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map(task => (
                      <tr key={task.id}>
                        <td>{task.id}</td>
                        <td>{task.title}</td>
                        <td>{task.publisher}</td>
                        <td>¥{task.reward}</td>
                        <td>
                          <span className={`status-badge ${task.status}`}>
                            {task.status === 'open' ? '开放' : '已完成'}
                          </span>
                        </td>
                        <td>{task.createdAt}</td>
                        <td>
                          <button className="btn btn-secondary">查看</button>
                          <button className="btn btn-danger">删除</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {activeTab === 'transactions' && (
            <div className="transactions-section">
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>用户</th>
                      <th>金额</th>
                      <th>类型</th>
                      <th>状态</th>
                      <th>日期</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(transaction => (
                      <tr key={transaction.id}>
                        <td>{transaction.id}</td>
                        <td>{transaction.user}</td>
                        <td>¥{transaction.amount}</td>
                        <td>{transaction.type === 'income' ? '收入' : '支出'}</td>
                        <td>
                          <span className={`status-badge ${transaction.status}`}>
                            {transaction.status === 'completed' ? '已完成' : '待处理'}
                          </span>
                        </td>
                        <td>{transaction.date}</td>
                        <td>
                          <button className="btn btn-secondary">查看</button>
                          <button className="btn btn-primary">处理</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;