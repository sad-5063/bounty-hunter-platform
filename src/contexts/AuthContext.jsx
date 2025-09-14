import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/authAPI';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // 检查用户登录状态
  useEffect(() => {
    const checkAuthStatus = async () => {
      if (token) {
        try {
          const userData = await authAPI.getCurrentUser(token);
          setUser(userData);
        } catch (error) {
          console.error('Token验证失败:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, [token]);

  // 登录
  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const { user: userData, token: authToken } = response;
      
      localStorage.setItem('token', authToken);
      setToken(authToken);
      setUser(userData);
      
      return userData;
    } catch (error) {
      throw new Error(error.message || '登录失败');
    }
  };

  // 注册
  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { user: newUser, token: authToken } = response;
      
      localStorage.setItem('token', authToken);
      setToken(authToken);
      setUser(newUser);
      
      return newUser;
    } catch (error) {
      throw new Error(error.message || '注册失败');
    }
  };

  // 登出
  const logout = async () => {
    try {
      if (token) {
        await authAPI.logout(token);
      }
    } catch (error) {
      console.error('登出请求失败:', error);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  };

  // 更新用户信息
  const updateProfile = async (profileData) => {
    try {
      const updatedUser = await authAPI.updateProfile(token, profileData);
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      throw new Error(error.message || '更新失败');
    }
  };

  // 修改密码
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await authAPI.changePassword(token, currentPassword, newPassword);
    } catch (error) {
      throw new Error(error.message || '密码修改失败');
    }
  };

  // 忘记密码
  const forgotPassword = async (email) => {
    try {
      await authAPI.forgotPassword(email);
    } catch (error) {
      throw new Error(error.message || '发送重置邮件失败');
    }
  };

  // 重置密码
  const resetPassword = async (token, newPassword) => {
    try {
      await authAPI.resetPassword(token, newPassword);
    } catch (error) {
      throw new Error(error.message || '密码重置失败');
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isModerator: user?.role === 'moderator'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
