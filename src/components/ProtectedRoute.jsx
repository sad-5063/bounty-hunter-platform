import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 如果正在加载，显示加载状态
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  // 如果用户未登录，重定向到登录页面
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 如果用户已登录，渲染子组件
  return children;
};

export default ProtectedRoute;
