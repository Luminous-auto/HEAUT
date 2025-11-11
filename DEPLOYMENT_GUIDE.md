# HEAUT 前端部署指南

本文档详细记录了将 HEAUT 前端项目部署到 GitHub Pages 的完整过程，包括所有遇到的问题、解决方案和最佳实践。

## 📋 目录

1. [项目概述](#项目概述)
2. [初始配置](#初始配置)
3. [遇到的问题及解决方案](#遇到的问题及解决方案)
4. [最终正确配置](#最终正确配置)
5. [快速部署步骤](#快速部署步骤)
6. [常见问题排查](#常见问题排查)

---

## 项目概述

- **项目名称**: HEAUT (Aura Journal)
- **技术栈**: React + Vite + Tailwind CSS
- **部署平台**: GitHub Pages
- **仓库地址**: https://github.com/Luminous-auto/HEAUT
- **部署地址**: https://luminous-auto.github.io/HEAUT/

---

## 初始配置

### 项目结构
```
aura-journal-9c91f52b/
├── src/
│   ├── api/
│   │   └── base44Client.js    # Base44 API 客户端
│   ├── pages/                 # 页面组件
│   ├── components/            # UI 组件
│   └── App.jsx                # 主应用组件
├── vite.config.js             # Vite 配置
├── package.json
└── dist/                      # 构建输出目录
```

### 关键依赖
- `@tanstack/react-query`: 数据获取和状态管理
- `react-router-dom`: 路由管理
- `@base44/sdk`: Base44 SDK（静态展示时使用 mock）

---

## 遇到的问题及解决方案

### ❌ 问题 1: 资源路径 404 错误

**错误现象**:
- 浏览器控制台显示: `Failed to load resource: the server responded with a status of 404`
- 资源路径: `/assets/index-xxx.js` 和 `/assets/index-xxx.css`
- 页面显示空白

**原因分析**:
GitHub Pages 部署在子目录 `/HEAUT/` 下，但构建的资源路径是绝对路径 `/assets/...`，实际应该是 `/HEAUT/assets/...`

**解决方案**:
在 `vite.config.js` 中添加 `base` 配置：

```javascript
export default defineConfig({
  base: '/HEAUT/',  // ✅ 添加这一行
  plugins: [react()],
  // ... 其他配置
})
```

**验证方法**:
构建后检查 `dist/index.html`，资源路径应该是：
```html
<script src="/HEAUT/assets/index-xxx.js"></script>
<link href="/HEAUT/assets/index-xxx.css">
```

---

### ❌ 问题 2: Base44 认证重定向导致 404

**错误现象**:
- 页面加载后立即跳转到 `base44.app/login`
- 显示 Base44 404 错误页面
- 错误信息: "This app was not found"

**原因分析**:
- `base44Client.js` 中设置了 `requiresAuth: true`
- Base44 SDK 在初始化时自动检查认证状态
- 由于 app_id 无效，Base44 返回 404

**解决方案**:
创建 Mock Base44 客户端，完全避免加载真实的 Base44 SDK：

```javascript
// src/api/base44Client.js
const createMockClient = () => {
  // Demo 用户数据
  const demoUser = {
    id: 'demo-user-123',
    email: 'demo@heaut.app',
    username: 'Demo User',
    language: 'en',
    tokens: 100,
    // ... 其他字段
  };

  const mockAuth = {
    isAuthenticated: async () => false,
    me: async () => demoUser,  // ✅ 返回 demo 用户，而不是抛出错误
    updateMe: async () => demoUser,
    logout: async () => {},
    redirectToLogin: () => {},  // ✅ 防止重定向
  };

  const createMockEntity = () => ({
    list: async () => [],
    create: async () => { throw new Error('Mock mode'); },
    get: async () => { throw new Error('Mock mode'); },
    update: async () => { throw new Error('Mock mode'); },
    delete: async () => { throw new Error('Mock mode'); },
    filter: async () => [],
  });

  const mockEntities = {
    DiaryEntry: createMockEntity(),
    Survey: createMockEntity(),
    // ... 所有需要的实体
  };

  const mockIntegrations = {
    Core: {
      InvokeLLM: async () => { throw new Error('Mock mode'); },
      // ... 所有集成方法
    },
  };

  return {
    auth: mockAuth,
    entities: mockEntities,
    integrations: mockIntegrations,
  };
};

// ✅ 始终使用 mock 客户端，不加载真实 SDK
export const base44 = createMockClient();
```

**关键点**:
- ❌ 不要使用 `requiresAuth: false`（仍然会尝试初始化 SDK）
- ✅ 完全移除 `@base44/sdk` 的导入
- ✅ `me()` 方法返回 demo 用户数据，而不是抛出错误（这样页面可以正常渲染）

---

### ❌ 问题 3: React Query 缺少 QueryClientProvider

**错误现象**:
- 浏览器控制台显示: `Error: No QueryClient set, use QueryClientProvider to set one`
- 所有使用 `useQuery` 或 `useMutation` 的页面显示空白
- 只有不使用 React Query 的页面（如 Insights）能正常显示

**原因分析**:
- `App.jsx` 中缺少 `QueryClientProvider`
- 所有页面组件都使用了 `@tanstack/react-query` 的 hooks

**解决方案**:
在 `App.jsx` 中添加 `QueryClientProvider`：

```javascript
// src/App.jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// ✅ 创建 QueryClient 实例
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>  {/* ✅ 包裹整个应用 */}
      <Pages />
      <Toaster />
    </QueryClientProvider>
  )
}
```

---

### ❌ 问题 4: React Router 路由不匹配

**错误现象**:
- 浏览器控制台显示: `No routes matched location "/HEAUT/"`
- 页面路由无法正确匹配
- URL 路径不正确

**原因分析**:
- React Router 没有设置 `basename`
- 在 GitHub Pages 子目录部署时，需要告诉 Router base path

**解决方案**:
在 `Router` 组件中添加 `basename`：

```javascript
// src/pages/index.jsx
export default function Pages() {
    return (
        <Router basename="/HEAUT">  {/* ✅ 添加 basename */}
            <PagesContent />
        </Router>
    );
}
```

同时，确保 `createPageUrl` 函数不包含 base path（因为 Router 已经处理了）：

```javascript
// src/utils/index.ts
export function createPageUrl(pageName: string) {
    return '/' + pageName.toLowerCase().replace(/ /g, '-');
}
```

---

### ❌ 问题 5: GitHub Pages 404 错误

**错误现象**:
- 访问 https://luminous-auto.github.io/HEAUT/ 显示 GitHub Pages 404
- 提示: "There isn't a GitHub Pages site here"

**原因分析**:
- 可能缺少 `.nojekyll` 文件
- GitHub Pages 可能没有正确识别构建文件

**解决方案**:
1. 在 `dist` 目录创建 `.nojekyll` 文件：
```bash
touch dist/.nojekyll
```

2. 确保 GitHub Pages 设置正确：
   - Settings → Pages
   - Source: "Deploy from a branch"
   - Branch: `gh-pages`
   - Folder: `/ (root)`

---

## 最终正确配置

### 1. vite.config.js

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: '/HEAUT/',  // ✅ 必须设置 base path
  plugins: [react()],
  server: {
    allowedHosts: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json']
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
})
```

### 2. src/App.jsx

```javascript
import './App.css'
import Pages from "@/pages/index.jsx"
import { Toaster } from "@/components/ui/toaster"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'  // ✅ 必须导入

// ✅ 创建 QueryClient 实例
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>  {/* ✅ 必须包裹 */}
      <Pages />
      <Toaster />
    </QueryClientProvider>
  )
}

export default App
```

### 3. src/pages/index.jsx

```javascript
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

export default function Pages() {
    return (
        <Router basename="/HEAUT">  {/* ✅ 必须设置 basename */}
            <PagesContent />
        </Router>
    );
}
```

### 4. src/api/base44Client.js

```javascript
// ✅ 完全使用 Mock 客户端，不加载真实 SDK
const createMockClient = () => {
  const demoUser = {
    id: 'demo-user-123',
    email: 'demo@heaut.app',
    username: 'Demo User',
    language: 'en',
    tokens: 100,
    // ... 其他必要字段
  };

  const mockAuth = {
    isAuthenticated: async () => false,
    me: async () => demoUser,  // ✅ 返回 demo 用户
    updateMe: async () => demoUser,
    logout: async () => {},
    redirectToLogin: () => {},  // ✅ 防止重定向
  };

  // ... Mock entities 和 integrations

  return {
    auth: mockAuth,
    entities: mockEntities,
    integrations: mockIntegrations,
  };
};

export const base44 = createMockClient();  // ✅ 始终使用 mock
```

### 5. src/utils/index.ts

```javascript
export function createPageUrl(pageName: string) {
    return '/' + pageName.toLowerCase().replace(/ /g, '-');
    // ✅ 不包含 /HEAUT/，因为 Router basename 已经处理
}
```

---

## 快速部署步骤

### 前置条件

1. 确保已安装 Node.js 和 npm
2. 确保已安装 Git
3. 确保有 GitHub 仓库访问权限

### 部署流程

#### 步骤 1: 安装依赖

```bash
cd /path/to/aura-journal-9c91f52b
npm install
```

#### 步骤 2: 检查配置

确保以下文件配置正确：
- ✅ `vite.config.js` 包含 `base: '/HEAUT/'`
- ✅ `src/App.jsx` 包含 `QueryClientProvider`
- ✅ `src/pages/index.jsx` Router 包含 `basename="/HEAUT"`
- ✅ `src/api/base44Client.js` 使用 mock 客户端

#### 步骤 3: 构建项目

```bash
npm run build
```

**验证构建结果**:
```bash
# 检查 dist/index.html 中的资源路径
cat dist/index.html
# 应该看到: src="/HEAUT/assets/index-xxx.js"
```

#### 步骤 4: 创建 .nojekyll 文件

```bash
touch dist/.nojekyll
```

#### 步骤 5: 部署到 gh-pages 分支

```bash
# 创建临时目录
rm -rf /tmp/gh-pages-deploy
mkdir -p /tmp/gh-pages-deploy

# 复制构建文件
cp -r dist/.nojekyll dist/index.html dist/assets /tmp/gh-pages-deploy/

# 进入临时目录
cd /tmp/gh-pages-deploy

# 初始化 git 并推送
git init
git remote add origin https://github.com/Luminous-auto/HEAUT.git
git add -A
git commit -m "Deploy: Update frontend"
git branch -M gh-pages
git push -f origin gh-pages
```

#### 步骤 6: 更新 main 分支（可选）

```bash
cd /path/to/aura-journal-9c91f52b
git add -A
git commit -m "Update: Frontend changes"
git push origin main
```

#### 步骤 7: 验证部署

1. 等待 2-5 分钟让 GitHub Pages 更新
2. 访问: https://luminous-auto.github.io/HEAUT/
3. 检查浏览器控制台是否有错误
4. 测试各个页面导航

---

## 常见问题排查

### 问题: 页面仍然显示空白

**排查步骤**:

1. **检查浏览器控制台**:
   - 打开开发者工具 (F12)
   - 查看 Console 标签的错误信息
   - 查看 Network 标签的资源加载情况

2. **检查资源路径**:
   ```bash
   cat dist/index.html
   # 确认资源路径包含 /HEAUT/
   ```

3. **清除浏览器缓存**:
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`
   - 或在开发者工具中勾选 "Disable cache"

4. **检查 GitHub Pages 设置**:
   - 访问: https://github.com/Luminous-auto/HEAUT/settings/pages
   - 确认 Source 是 "Deploy from a branch"
   - 确认 Branch 是 `gh-pages`
   - 确认 Folder 是 `/ (root)`

### 问题: 控制台显示 "No QueryClient set"

**解决方案**:
- 检查 `src/App.jsx` 是否包含 `QueryClientProvider`
- 确保 `QueryClientProvider` 包裹了所有组件

### 问题: 路由不工作

**解决方案**:
- 检查 `src/pages/index.jsx` Router 是否设置了 `basename="/HEAUT"`
- 检查 `createPageUrl` 函数是否正确

### 问题: Base44 404 错误

**解决方案**:
- 检查 `src/api/base44Client.js` 是否完全使用 mock 客户端
- 确保没有导入 `@base44/sdk`
- 确保 `me()` 方法返回 demo 用户而不是抛出错误

### 问题: GitHub Pages 404

**解决方案**:
- 确认 `gh-pages` 分支存在且有内容
- 确认 `.nojekyll` 文件已包含
- 等待几分钟让 GitHub Pages 更新

---

## 部署检查清单

在每次部署前，确认以下项目：

- [ ] `vite.config.js` 包含 `base: '/HEAUT/'`
- [ ] `src/App.jsx` 包含 `QueryClientProvider`
- [ ] `src/pages/index.jsx` Router 包含 `basename="/HEAUT"`
- [ ] `src/api/base44Client.js` 使用 mock 客户端
- [ ] `dist/.nojekyll` 文件存在
- [ ] `dist/index.html` 中的资源路径包含 `/HEAUT/`
- [ ] 构建成功，没有错误
- [ ] `gh-pages` 分支已更新

---

## 自动化部署（可选）

可以使用 GitHub Actions 自动部署。已包含 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/deploy-pages@v4
```

**注意**: 如果使用 GitHub Actions，需要在 Settings → Pages 中选择 "GitHub Actions" 作为 Source。

---

## 总结

### 关键配置要点

1. **Vite base path**: 必须设置为 `/HEAUT/`
2. **QueryClientProvider**: 必须在 App.jsx 中包裹整个应用
3. **Router basename**: 必须设置为 `/HEAUT`
4. **Mock Base44 Client**: 必须完全使用 mock，不加载真实 SDK
5. **.nojekyll 文件**: 必须包含在部署中

### 部署流程总结

```bash
# 1. 安装依赖
npm install

# 2. 构建
npm run build

# 3. 创建 .nojekyll
touch dist/.nojekyll

# 4. 部署到 gh-pages
# (使用上面的部署脚本)
```

### 验证清单

- [ ] 所有页面都能正常显示
- [ ] 浏览器控制台没有错误
- [ ] 路由导航正常工作
- [ ] 资源文件正确加载

---

## 更新日志

- **2024-11-12**: 初始文档创建，记录所有调试过程和最终配置
- 修复了资源路径、Base44 认证、QueryClientProvider、路由匹配等问题

---

## 参考资源

- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html)
- [GitHub Pages 文档](https://docs.github.com/en/pages)
- [React Router 文档](https://reactrouter.com/)
- [TanStack Query 文档](https://tanstack.com/query/latest)

---

**最后更新**: 2024-11-12
**维护者**: HEAUT 开发团队

