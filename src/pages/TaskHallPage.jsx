import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TaskCard from '../components/tasks/TaskCard';
import TaskFilter from '../components/tasks/TaskFilter';
import { taskAPI } from '../services/taskAPI';
import './TaskHallPage.css';

const TaskHallPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    minReward: '',
    maxReward: '',
    status: '',
    sortBy: 'created_at'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    loadTasks();
  }, [filters, currentPage]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await taskAPI.getTasks({
        ...filters,
        page: currentPage,
        limit: 10
      });
      
      if (currentPage === 1) {
        setTasks(response.tasks);
      } else {
        setTasks(prev => [...prev, ...response.tasks]);
      }
      
      setHasMore(response.hasMore);
    } catch (err) {
      setError(err.message || '加载任务失败');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleAcceptTask = async (taskId) => {
    try {
      await taskAPI.acceptTask(taskId);
      // 重新加载任务列表
      setCurrentPage(1);
      loadTasks();
    } catch (err) {
      alert(err.message || '接受任务失败');
    }
  };

  const handleViewDetails = (taskId) => {
    navigate(`/task/${taskId}`);
  };

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handleCreateTask = () => {
    navigate('/task/create');
  };

  return (
    <div className="task-hall-page">
      <div className="page-header">
        <div className="header-content">
          <h1>任务大厅</h1>
          <p>发现并接受您感兴趣的任务</p>
        </div>
        <button className="create-task-btn" onClick={handleCreateTask}>
          <span className="btn-icon">➕</span>
          发布任务
        </button>
      </div>

      <div className="page-content">
        <div className="sidebar">
          <TaskFilter onFilterChange={handleFilterChange} />
        </div>

        <div className="main-content">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {loading && tasks.length === 0 ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>加载任务中...</p>
            </div>
          ) : (
            <>
              <div className="tasks-grid">
                {tasks.map(task => (
                  <TaskCard
                    key={task.task_id}
                    task={task}
                    onAccept={handleAcceptTask}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>

              {tasks.length === 0 && !loading && (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <h3>暂无任务</h3>
                  <p>当前没有符合条件的任务，请调整筛选条件或稍后再试</p>
                  <button className="btn-primary" onClick={handleCreateTask}>
                    发布第一个任务
                  </button>
                </div>
              )}

              {hasMore && tasks.length > 0 && (
                <div className="load-more-section">
                  <button 
                    className="load-more-btn"
                    onClick={handleLoadMore}
                    disabled={loading}
                  >
                    {loading ? '加载中...' : '加载更多'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskHallPage;