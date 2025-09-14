import React, { useState } from 'react';
import './TaskFilter.css';

const TaskFilter = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    minReward: '',
    maxReward: '',
    status: '',
    sortBy: 'created_at'
  });

  const categories = [
    'design', 'development', 'writing', 'translation', 
    'data_entry', 'marketing', 'research', 'other'
  ];

  const statuses = [
    { value: '', label: '全部状态' },
    { value: 'pending', label: '待接单' },
    { value: 'in_progress', label: '进行中' },
    { value: 'completed', label: '已完成' },
    { value: 'cancelled', label: '已取消' }
  ];

  const sortOptions = [
    { value: 'created_at', label: '最新发布' },
    { value: 'reward', label: '赏金最高' },
    { value: 'deadline', label: '截止时间' },
    { value: 'title', label: '标题排序' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      category: '',
      location: '',
      minReward: '',
      maxReward: '',
      status: '',
      sortBy: 'created_at'
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="task-filter">
      <div className="filter-header">
        <h3>筛选任务</h3>
        <button className="reset-btn" onClick={handleReset}>
          重置筛选
        </button>
      </div>

      <div className="filter-grid">
        <div className="filter-group">
          <label>任务类型</label>
          <select 
            value={filters.category} 
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">全部类型</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'design' ? '设计' :
                 cat === 'development' ? '开发' :
                 cat === 'writing' ? '写作' :
                 cat === 'translation' ? '翻译' :
                 cat === 'data_entry' ? '数据录入' :
                 cat === 'marketing' ? '营销' :
                 cat === 'research' ? '研究' :
                 cat === 'other' ? '其他' : cat}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>地区</label>
          <input
            type="text"
            placeholder="输入地区"
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>赏金范围</label>
          <div className="reward-range">
            <input
              type="number"
              placeholder="最低"
              value={filters.minReward}
              onChange={(e) => handleFilterChange('minReward', e.target.value)}
            />
            <span>至</span>
            <input
              type="number"
              placeholder="最高"
              value={filters.maxReward}
              onChange={(e) => handleFilterChange('maxReward', e.target.value)}
            />
          </div>
        </div>

        <div className="filter-group">
          <label>任务状态</label>
          <select 
            value={filters.status} 
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            {statuses.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>排序方式</label>
          <select 
            value={filters.sortBy} 
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="filter-summary">
        <span>当前筛选：</span>
        {filters.category && <span className="filter-tag">类型: {filters.category}</span>}
        {filters.location && <span className="filter-tag">地区: {filters.location}</span>}
        {filters.status && <span className="filter-tag">状态: {filters.status}</span>}
        {(filters.minReward || filters.maxReward) && (
          <span className="filter-tag">
            赏金: {filters.minReward || '0'} - {filters.maxReward || '∞'}
          </span>
        )}
      </div>
    </div>
  );
};

export default TaskFilter;
