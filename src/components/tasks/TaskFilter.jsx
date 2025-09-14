import React, { useState } from 'react';
import './TaskFilter.css';

const TaskFilter = ({ onFilterChange, categories = [], skills = [] }) => {
  const [filters, setFilters] = useState({
    category: '',
    subcategory: '',
    minReward: '',
    maxReward: '',
    location: '',
    experienceLevel: '',
    skills: [],
    status: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSkillToggle = (skill) => {
    const newSkills = filters.skills.includes(skill)
      ? filters.skills.filter(s => s !== skill)
      : [...filters.skills, skill];
    
    const newFilters = { ...filters, skills: newSkills };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      category: '',
      subcategory: '',
      minReward: '',
      maxReward: '',
      location: '',
      experienceLevel: '',
      skills: [],
      status: '',
      sortBy: 'created_at',
      sortOrder: 'desc'
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    Array.isArray(value) ? value.length > 0 : value !== ''
  );

  return (
    <div className="task-filter">
      <div className="filter-header">
        <h3>筛选任务</h3>
        {hasActiveFilters && (
          <button 
            className="clear-filters-btn"
            onClick={clearFilters}
          >
            清除筛选
          </button>
        )}
      </div>

      <div className="filter-sections">
        {/* 分类筛选 */}
        <div className="filter-section">
          <label className="filter-label">任务分类</label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="filter-select"
          >
            <option value="">全部分类</option>
            {categories.map(category => (
              <option key={category.category_id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* 赏金范围 */}
        <div className="filter-section">
          <label className="filter-label">赏金范围</label>
          <div className="reward-range">
            <input
              type="number"
              placeholder="最低"
              value={filters.minReward}
              onChange={(e) => handleFilterChange('minReward', e.target.value)}
              className="reward-input"
            />
            <span className="range-separator">-</span>
            <input
              type="number"
              placeholder="最高"
              value={filters.maxReward}
              onChange={(e) => handleFilterChange('maxReward', e.target.value)}
              className="reward-input"
            />
          </div>
        </div>

        {/* 地理位置 */}
        <div className="filter-section">
          <label className="filter-label">地理位置</label>
          <input
            type="text"
            placeholder="输入城市或地区"
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            className="filter-input"
          />
        </div>

        {/* 经验要求 */}
        <div className="filter-section">
          <label className="filter-label">经验要求</label>
          <select
            value={filters.experienceLevel}
            onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
            className="filter-select"
          >
            <option value="">不限经验</option>
            <option value="beginner">初级</option>
            <option value="intermediate">中级</option>
            <option value="expert">高级</option>
          </select>
        </div>

        {/* 任务状态 */}
        <div className="filter-section">
          <label className="filter-label">任务状态</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="filter-select"
          >
            <option value="">全部状态</option>
            <option value="pending">待接单</option>
            <option value="active">进行中</option>
            <option value="in_progress">执行中</option>
            <option value="completed">已完成</option>
          </select>
        </div>

        {/* 技能标签 */}
        {skills.length > 0 && (
          <div className="filter-section">
            <label className="filter-label">技能要求</label>
            <div className="skills-filter">
              {skills.slice(0, 10).map(skill => (
                <button
                  key={skill.skill_id}
                  className={`skill-filter-btn ${
                    filters.skills.includes(skill.name) ? 'active' : ''
                  }`}
                  onClick={() => handleSkillToggle(skill.name)}
                >
                  {skill.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 排序方式 */}
        <div className="filter-section">
          <label className="filter-label">排序方式</label>
          <div className="sort-controls">
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="filter-select"
            >
              <option value="created_at">发布时间</option>
              <option value="reward">赏金金额</option>
              <option value="deadline">截止时间</option>
              <option value="view_count">浏览次数</option>
              <option value="application_count">申请人数</option>
            </select>
            <select
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
              className="filter-select"
            >
              <option value="desc">降序</option>
              <option value="asc">升序</option>
            </select>
          </div>
        </div>
      </div>

      {/* 快速筛选按钮 */}
      <div className="quick-filters">
        <h4>快速筛选</h4>
        <div className="quick-filter-buttons">
          <button
            className={`quick-filter-btn ${
              filters.minReward === '1000' && filters.maxReward === '' ? 'active' : ''
            }`}
            onClick={() => handleFilterChange('minReward', '1000')}
          >
            高赏金 (¥1000+)
          </button>
          <button
            className={`quick-filter-btn ${
              filters.experienceLevel === 'beginner' ? 'active' : ''
            }`}
            onClick={() => handleFilterChange('experienceLevel', 'beginner')}
          >
            新手友好
          </button>
          <button
            className={`quick-filter-btn ${
              filters.status === 'pending' ? 'active' : ''
            }`}
            onClick={() => handleFilterChange('status', 'pending')}
          >
            可申请
          </button>
          <button
            className={`quick-filter-btn ${
              filters.sortBy === 'deadline' ? 'active' : ''
            }`}
            onClick={() => handleFilterChange('sortBy', 'deadline')}
          >
            即将截止
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskFilter;
