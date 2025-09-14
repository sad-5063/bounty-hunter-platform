import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // 启用React快速刷新
      fastRefresh: true,
      // 启用JSX运行时
      jsxRuntime: 'automatic',
    })
  ],
  
  // 路径别名
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@services': resolve(__dirname, 'src/services'),
      '@contexts': resolve(__dirname, 'src/contexts'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@assets': resolve(__dirname, 'src/assets'),
    }
  },

  // 开发服务器配置
  server: {
    port: 5173,
    host: true,
    open: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      }
    }
  },

  // 构建配置
  build: {
    // 输出目录
    outDir: 'dist',
    
    // 生成source map
    sourcemap: false,
    
    // 代码分割
    rollupOptions: {
      output: {
        // 手动分包
        manualChunks: {
          // React相关
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // UI组件库
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          
          // 工具库
          'utils-vendor': ['axios', 'date-fns', 'lodash'],
          
          // 图表库
          'chart-vendor': ['chart.js', 'react-chartjs-2'],
          
          // 编辑器
          'editor-vendor': ['@monaco-editor/react'],
        },
        
        // 资源文件命名
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)) {
            return `media/[name]-[hash].${ext}`;
          }
          if (/\.(png|jpe?g|gif|svg)(\?.*)?$/i.test(assetInfo.name)) {
            return `images/[name]-[hash].${ext}`;
          }
          if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name)) {
            return `fonts/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        }
      }
    },
    
    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        // 移除console
        drop_console: true,
        // 移除debugger
        drop_debugger: true,
        // 移除未使用的代码
        unused: true,
        // 移除死代码
        dead_code: true,
      },
      mangle: {
        // 混淆变量名
        toplevel: true,
      }
    },
    
    // 资源内联阈值
    assetsInlineLimit: 4096,
    
    // 启用CSS代码分割
    cssCodeSplit: true,
    
    // 目标浏览器
    target: 'es2015',
  },

  // CSS配置
  css: {
    // CSS预处理器
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    },
    
    // CSS模块
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]___[hash:base64:5]'
    }
  },

  // 依赖优化
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'date-fns',
      'lodash'
    ],
    exclude: [
      '@monaco-editor/react'
    ]
  },

  // 环境变量
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },

  // 预览服务器
  preview: {
    port: 4173,
    host: true,
    open: true,
  }
});
