# Architecture: Frontend

> 前端架构文档。包含技术选型、组件结构、状态管理、路由设计。

---

## 技术栈

| 层 | 选型 | 版本 | 备注 |
|----|------|------|------|
| 框架 | [React / Vue / Svelte] | | |
| 语言 | [TypeScript] | | |
| 状态管理 | [Zustand / Redux / Pinia] | | |
| 路由 | [React Router / Vue Router] | | |
| 样式 | [Tailwind / CSS Modules / styled] | | |
| 构建 | [Vite / Next.js / Nuxt] | | |

## 组件结构

```
src/
├── components/          # 可复用组件
│   ├── ui/              # 基础 UI 组件（Button, Input, Modal）
│   └── business/        # 业务组件
├── pages/               # 页面组件
├── hooks/               # 自定义 hooks
├── stores/              # 状态管理
├── api/                 # API 调用层
├── types/               # 类型定义
└── utils/               # 工具函数
```

## 组件设计规则

- UI 组件不包含业务逻辑，不调用 API
- 业务组件通过 hooks 获取数据
- 页面组件负责布局编排
- 禁止在组件中直接操作 localStorage（通过 hook 统一管理）

## 状态管理

- 全局状态：[store 名称] — 用途
- 服务端状态：通过 hooks 缓存，不在 store 中重复存储
- 表单状态：局部 state，不放入全局 store

## 路由

| 路径 | 页面 | 权限 |
|------|------|------|
| / | Home | 公开 |
| /login | Login | 公开 |

## API 调用规范

- 所有 API 调用集中在 `api/` 目录
- 统一错误处理
- 请求去重和取消
- 敏感数据不在 URL 参数中传递

## 性能约束

- 首屏加载 < 3s（3G 网络）
- 组件懒加载（route-level code splitting）
- 图片懒加载
- 列表 > 100 项使用虚拟滚动
