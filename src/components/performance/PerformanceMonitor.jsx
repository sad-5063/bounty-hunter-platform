import React, { useEffect, useState } from 'react';
import './PerformanceMonitor.css';

const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    networkLatency: 0,
    errorCount: 0
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 监控页面加载性能
    const measureLoadTime = () => {
      if (performance.timing) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        setMetrics(prev => ({ ...prev, loadTime }));
      }
    };

    // 监控内存使用
    const measureMemoryUsage = () => {
      if (performance.memory) {
        const memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
        setMetrics(prev => ({ ...prev, memoryUsage }));
      }
    };

    // 监控网络延迟
    const measureNetworkLatency = async () => {
      const start = performance.now();
      try {
        await fetch('/api/ping', { method: 'HEAD' });
        const latency = Math.round(performance.now() - start);
        setMetrics(prev => ({ ...prev, networkLatency: latency }));
      } catch (error) {
        setMetrics(prev => ({ ...prev, networkLatency: -1 }));
      }
    };

    // 监控渲染性能
    const measureRenderTime = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'measure') {
            setMetrics(prev => ({ 
              ...prev, 
              renderTime: Math.round(entry.duration) 
            }));
          }
        });
      });
      observer.observe({ entryTypes: ['measure'] });
    };

    // 监控错误
    const handleError = (event) => {
      setMetrics(prev => ({ 
        ...prev, 
        errorCount: prev.errorCount + 1 
      }));
    };

    // 初始化监控
    measureLoadTime();
    measureMemoryUsage();
    measureNetworkLatency();
    measureRenderTime();

    // 添加事件监听器
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);

    // 定期更新指标
    const interval = setInterval(() => {
      measureMemoryUsage();
      measureNetworkLatency();
    }, 5000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  const getPerformanceStatus = (metric, threshold) => {
    if (metric === -1) return 'error';
    if (metric <= threshold) return 'good';
    if (metric <= threshold * 1.5) return 'warning';
    return 'poor';
  };

  const getStatusColor = (status) => {
    const colors = {
      good: '#10b981',
      warning: '#f59e0b',
      poor: '#ef4444',
      error: '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusIcon = (status) => {
    const icons = {
      good: '✅',
      warning: '⚠️',
      poor: '❌',
      error: '❓'
    };
    return icons[status] || '❓';
  };

  if (!isVisible) {
    return (
      <button 
        className="performance-toggle"
        onClick={() => setIsVisible(true)}
        title="性能监控"
      >
        📊
      </button>
    );
  }

  return (
    <div className="performance-monitor">
      <div className="monitor-header">
        <h3>性能监控</h3>
        <button 
          className="close-btn"
          onClick={() => setIsVisible(false)}
        >
          ✕
        </button>
      </div>
      
      <div className="metrics-grid">
        <div className="metric-item">
          <div className="metric-label">页面加载时间</div>
          <div className="metric-value">
            {metrics.loadTime}ms
            <span className={`status-indicator ${getPerformanceStatus(metrics.loadTime, 2000)}`}>
              {getStatusIcon(getPerformanceStatus(metrics.loadTime, 2000))}
            </span>
          </div>
        </div>

        <div className="metric-item">
          <div className="metric-label">渲染时间</div>
          <div className="metric-value">
            {metrics.renderTime}ms
            <span className={`status-indicator ${getPerformanceStatus(metrics.renderTime, 16)}`}>
              {getStatusIcon(getPerformanceStatus(metrics.renderTime, 16))}
            </span>
          </div>
        </div>

        <div className="metric-item">
          <div className="metric-label">内存使用</div>
          <div className="metric-value">
            {metrics.memoryUsage}MB
            <span className={`status-indicator ${getPerformanceStatus(metrics.memoryUsage, 50)}`}>
              {getStatusIcon(getPerformanceStatus(metrics.memoryUsage, 50))}
            </span>
          </div>
        </div>

        <div className="metric-item">
          <div className="metric-label">网络延迟</div>
          <div className="metric-value">
            {metrics.networkLatency === -1 ? 'N/A' : `${metrics.networkLatency}ms`}
            <span className={`status-indicator ${getPerformanceStatus(metrics.networkLatency, 100)}`}>
              {getStatusIcon(getPerformanceStatus(metrics.networkLatency, 100))}
            </span>
          </div>
        </div>

        <div className="metric-item">
          <div className="metric-label">错误数量</div>
          <div className="metric-value">
            {metrics.errorCount}
            <span className={`status-indicator ${metrics.errorCount === 0 ? 'good' : 'poor'}`}>
              {getStatusIcon(metrics.errorCount === 0 ? 'good' : 'poor')}
            </span>
          </div>
        </div>
      </div>

      <div className="monitor-actions">
        <button className="action-btn" onClick={() => window.location.reload()}>
          🔄 刷新页面
        </button>
        <button className="action-btn" onClick={() => {
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
              registrations.forEach(registration => registration.unregister());
            });
          }
        }}>
          🗑️ 清除缓存
        </button>
      </div>
    </div>
  );
};

export default PerformanceMonitor;
