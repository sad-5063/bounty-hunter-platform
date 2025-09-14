import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';

// 页面组件
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TaskHallPage from './pages/TaskHallPage';
import TaskDetailPage from './pages/TaskDetailPage';
import WalletPage from './pages/WalletPage';
import MessagesPage from './pages/MessagesPage';
import AdminPage from './pages/AdminPage';
import MobileNavigation from './components/mobile/MobileNavigation';
import PerformanceMonitor from './components/performance/PerformanceMonitor';

// 样式
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Header />
          
          <main className="main-content">
            <Routes>
              {/* 公开路由 */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/tasks" element={<TaskHallPage />} />
              <Route path="/tasks/:taskId" element={<TaskDetailPage />} />
              
              {/* 受保护的路由 */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />
                       <Route 
                         path="/wallet" 
                         element={
                           <ProtectedRoute>
                             <WalletPage />
                           </ProtectedRoute>
                         } 
                       />
                       <Route 
                         path="/messages" 
                         element={
                           <ProtectedRoute>
                             <MessagesPage />
                           </ProtectedRoute>
                         } 
                       />
                       <Route 
                         path="/admin" 
                         element={
                           <ProtectedRoute>
                             <AdminPage />
                           </ProtectedRoute>
                         } 
                       />
              
              {/* 404重定向 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          
                  <Footer />
                  
                  {/* 移动端导航 */}
                  <MobileNavigation />
                  
                  {/* 性能监控（开发环境） */}
                  {process.env.NODE_ENV === 'development' && <PerformanceMonitor />}
                </div>
              </Router>
            </AuthProvider>
          );
        }

export default App;
