import React, { useState, useEffect } from 'react';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // 模拟用户数据
  const mockUsers = [
    {
      id: 1,
      name: '张三',
      email: 'zhangsan@example.com',
      phone: '13800138001',
      role: 'hunter',
      status: 'active',
      verified: true,
      reputation: 8.5,
      tasks_completed: 25,
      total_earnings: 15600,
      join_date: '2023-01-15',
      last_active: '2024-01-15 14:30'
    },
    {
      id: 2,
      name: '李四',
      email: 'lisi@example.com',
      phone: '13800138002',
      role: 'publisher',
      status: 'active',
      verified: false,
      reputation: 7.2,
      tasks_completed: 0,
      total_earnings: 0,
      join_date: '2023-02-20',
      last_active: '2024-01-14 09:15'
    },
    {
      id: 3,
      name: '王五',
      email: 'wangwu@example.com',
      phone: '13800138003',
      role: 'both',
      status: 'suspended',
      verified: true,
      reputation: 6.8,
      tasks_completed: 18,
      total_earnings: 8900,
      join_date: '2023-03-10',
      last_active: '2024-01-10 16:45'
    },
    {
      id: 4,
      name: '赵六',
      email: 'zhaoliu@example.com',
      phone: '13800138004',
      role: 'hunter',
      status: 'banned',
      verified: false,
      reputation: 3.2,
      tasks_completed: 5,
      total_earnings: 1200,
      join_date: '2023-04-05',
      last_active: '2024-01-05 11:20'
    }
  ];

  useEffect(() => {
    loadUsers();
  }, [currentPage, searchTerm, filterStatus, filterRole]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let filteredUsers = mockUsers;
      
      // 应用搜索过滤
      if (searchTerm) {
        filteredUsers = filteredUsers.filter(user => 
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone.includes(searchTerm)
        );
      }
      
      // 应用状态过滤
      if (filterStatus !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.status === filterStatus);
      }
      
      // 应用角色过滤
      if (filterRole !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.role === filterRole);
      }
      
      setUsers(filteredUsers);
      setTotalPages(Math.ceil(filteredUsers.length / 10));
    } catch (error) {
      console.error('加载用户失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUsers(prev => prev.map(user => {
        if (user.id === userId) {
          switch (action) {
            case 'ban':
              return { ...user, status: 'banned' };
            case 'unban':
              return { ...user, status: 'active' };
            case 'suspend':
              return { ...user, status: 'suspended' };
            case 'verify':
              return { ...user, verified: true };
            case 'unverify':
              return { ...user, verified: false };
            default:
              return user;
          }
        }
        return user;
      }));
    } catch (error) {
      console.error('用户操作失败:', error);
    }
  };

  const handleBulkAction = async (action) => {
    try {
      // 模拟批量操作
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUsers(prev => prev.map(user => {
        if (selectedUsers.includes(user.id)) {
          switch (action) {
            case 'ban':
              return { ...user, status: 'banned' };
            case 'unban':
              return { ...user, status: 'active' };
            case 'verify':
              return { ...user, verified: true };
            default:
              return user;
          }
        }
        return user;
      }));
      
      setSelectedUsers([]);
    } catch (error) {
      console.error('批量操作失败:', error);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { text: '正常', class: 'status-active' },
      suspended: { text: '暂停', class: 'status-suspended' },
      banned: { text: '封禁', class: 'status-banned' },
      inactive: { text: '未激活', class: 'status-inactive' }
    };
    return badges[status] || { text: '未知', class: 'status-unknown' };
  };

  const getRoleBadge = (role) => {
    const badges = {
      hunter: { text: '猎人', class: 'role-hunter' },
      publisher: { text: '发布者', class: 'role-publisher' },
      both: { text: '双重身份', class: 'role-both' }
    };
    return badges[role] || { text: '未知', class: 'role-unknown' };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  return (
    <div className="user-management">
      {/* 头部操作区 */}
      <div className="management-header">
        <div className="header-left">
          <h2>用户管理</h2>
          <span className="user-count">共 {users.length} 个用户</span>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary">
            📊 导出数据
          </button>
          <button className="btn btn-secondary">
            ➕ 添加用户
          </button>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="搜索用户姓名、邮箱或手机号..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <div className="filter-controls">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">全部状态</option>
            <option value="active">正常</option>
            <option value="suspended">暂停</option>
            <option value="banned">封禁</option>
            <option value="inactive">未激活</option>
          </select>
          
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="filter-select"
          >
            <option value="all">全部角色</option>
            <option value="hunter">猎人</option>
            <option value="publisher">发布者</option>
            <option value="both">双重身份</option>
          </select>
        </div>
      </div>

      {/* 批量操作 */}
      {selectedUsers.length > 0 && (
        <div className="bulk-actions">
          <span className="selected-count">已选择 {selectedUsers.length} 个用户</span>
          <div className="bulk-buttons">
            <button 
              className="btn btn-warning"
              onClick={() => handleBulkAction('verify')}
            >
              ✓ 批量认证
            </button>
            <button 
              className="btn btn-danger"
              onClick={() => handleBulkAction('ban')}
            >
              🚫 批量封禁
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => setSelectedUsers([])}
            >
              ✕ 取消选择
            </button>
          </div>
        </div>
      )}

      {/* 用户表格 */}
      <div className="users-table-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>加载用户数据中...</p>
          </div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(users.map(user => user.id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                  />
                </th>
                <th>用户信息</th>
                <th>角色</th>
                <th>状态</th>
                <th>认证状态</th>
                <th>信誉值</th>
                <th>完成任务</th>
                <th>总收入</th>
                <th>注册时间</th>
                <th>最后活跃</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user.id]);
                        } else {
                          setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                        }
                      }}
                    />
                  </td>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        {user.name.charAt(0)}
                      </div>
                      <div className="user-details">
                        <div className="user-name">{user.name}</div>
                        <div className="user-email">{user.email}</div>
                        <div className="user-phone">{user.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`role-badge ${getRoleBadge(user.role).class}`}>
                      {getRoleBadge(user.role).text}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusBadge(user.status).class}`}>
                      {getStatusBadge(user.status).text}
                    </span>
                  </td>
                  <td>
                    <span className={`verification-badge ${user.verified ? 'verified' : 'unverified'}`}>
                      {user.verified ? '✓ 已认证' : '⏳ 未认证'}
                    </span>
                  </td>
                  <td>
                    <div className="reputation-score">
                      <span className="score-value">{user.reputation}</span>
                      <div className="score-bar">
                        <div 
                          className="score-fill"
                          style={{ width: `${(user.reputation / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td>{user.tasks_completed}</td>
                  <td>{formatCurrency(user.total_earnings)}</td>
                  <td>{formatDate(user.join_date)}</td>
                  <td>{formatDate(user.last_active)}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn btn-sm btn-info"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserModal(true);
                        }}
                      >
                        查看
                      </button>
                      {user.status === 'banned' ? (
                        <button 
                          className="btn btn-sm btn-success"
                          onClick={() => handleUserAction(user.id, 'unban')}
                        >
                          解封
                        </button>
                      ) : (
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleUserAction(user.id, 'ban')}
                        >
                          封禁
                        </button>
                      )}
                      {!user.verified && (
                        <button 
                          className="btn btn-sm btn-warning"
                          onClick={() => handleUserAction(user.id, 'verify')}
                        >
                          认证
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 分页 */}
      <div className="pagination">
        <button 
          className="page-btn"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          上一页
        </button>
        <span className="page-info">
          第 {currentPage} 页，共 {totalPages} 页
        </span>
        <button 
          className="page-btn"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          下一页
        </button>
      </div>
    </div>
  );
};

export default UserManagement;
