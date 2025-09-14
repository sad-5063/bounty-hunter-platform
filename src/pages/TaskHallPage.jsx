import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { taskAPI } from '../services/taskAPI';
import TaskCard from '../components/tasks/TaskCard';
import TaskFilter from '../components/tasks/TaskFilter';
import './TaskHallPage.css';

const TaskHallPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({});

  const TASKS_PER_PAGE = 12;

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadTasks();
  }, [currentPage, filters]);

  const loadInitialData = async () => {
    try {
      const [categoriesData, skillsData] = await Promise.all([
        taskAPI.getCategories(),
        taskAPI.getSkills()
      ]);
      
      setCategories(categoriesData);
      setSkills(skillsData);
    } catch (error) {
      console.error('加载初始数据失败:', error);
    }
  };

  const loadTasks = async () => {
    setLoading(true);
    setError('');

    try {
      const params = {
        page: currentPage,
        limit: TASKS_PER_PAGE,
        ...filters
      };

      const response = await taskAPI.getTasks(params);
      setTasks(response.tasks);
      setFilteredTasks(response.tasks);
      setTotalPages(Math.ceil(response.total / TASKS_PER_PAGE));
    } catch (error) {
      setError('加载任务失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // 重置到第一页
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTaskApply = async (taskId) => {
    if (!user) {
      alert('请先登录');
      return;
    }

    try {
      await taskAPI.applyTask(taskId);
      alert('申请成功！');
      loadTasks(); // 重新加载任务列表
    } catch (error) {
      alert('申请失败: ' + error.message);
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-btn ${i === currentPage ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination">
        <button
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          上一页
        </button>
        {pages}
        <button
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          下一页
        </button>
      </div>
    );
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="task-hall-loading">
        <div className="loading-spinner"></div>
        <p>加载任务中...</p>
      </div>
    );
  }

  return (
    <div className="task-hall-page">
      <div className="task-hall-header">
        <h1>任务大厅</h1>
        <p>发现适合您的任务，开始您的赏金猎人之路</p>
      </div>

      <div className="task-hall-content">
        <div className="task-hall-sidebar">
          <TaskFilter
            onFilterChange={handleFilterChange}
            categories={categories}
            skills={skills}
          />
        </div>

        <div className="task-hall-main">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="task-hall-stats">
            <div className="stat-item">
              <span className="stat-number">{filteredTasks.length}</span>
              <span className="stat-label">个任务</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {filteredTasks.reduce((sum, task) => sum + task.reward, 0).toLocaleString()}
              </span>
              <span className="stat-label">总赏金</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {categories.length}
              </span>
              <span className="stat-label">个分类</span>
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="no-tasks">
              <div className="no-tasks-icon">🔍</div>
              <h3>暂无任务</h3>
              <p>没有找到符合条件的任务，请尝试调整筛选条件</p>
              <button 
                className="btn btn-primary"
                onClick={() => setFilters({})}
              >
                清除筛选
              </button>
            </div>
          ) : (
            <>
              <div className="task-grid">
                {filteredTasks.map(task => (
                  <TaskCard
                    key={task.task_id}
                    task={task}
                    showActions={true}
                  />
                ))}
              </div>

              {renderPagination()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskHallPage;
