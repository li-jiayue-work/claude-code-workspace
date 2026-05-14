# PROJECT.md — 项目定义

> 学习型 workspace，用于练习 AI 协作开发，边学边做。
> 没有生产需求，重点是理解 Claude Code + Agent 工作流。

---

## 基本信息

- **项目名称**：AI-Native 编程学习工作区
- **代码仓库**：本地（Git 已初始化）
- **主分支**：`main`

## 项目目标

通过实际动手项目，掌握：

1. 用 Claude Code 进行 AI 协作开发
2. Agent 工作流（planner → reviewer → debugger）的运转方式
3. 从需求到代码到合入的完整开发流程

目标用户是自己。没有交付压力，重点是理解过程。

## 当前阶段

- [x] 环境搭建（workspace 初始化完成）
- [x] 工作流定义（agents / skills / workflows 就绪）
- [x] 第一个练习项目：TODO CLI 工具
- [x] 完整走通一次 feature-workflow
- [x] 建立 knowledge-base 知识库体系
- [x] 集成 LobeHub Skills Marketplace（注册 + skill-vetter + pptx）
- [x] 端到端 PPTX 创作验证：PDF→提取→规划→pptxgenjs 生成→QA→修复→再验证
- [x] MCP 服务器配置：filesystem / github / duckduckgo / sqlite（用户级 mcp.json）
- [ ] 完整走通一次 debug-workflow

## 技术起点

- **语言**：Python（入门友好，适合边学边写）
- **工具**：Claude Code + Git
- **方向**：待探索——可能是一个 CLI 工具、一个简单 Web API、或一个小游戏

## 当前重点（本周）

1. 完善 knowledge-base 体系并开始日常捕获
2. 完整走通一次 debug-workflow

## 学习路线（粗略）

| 阶段 | 目标 | 预期产出 |
|------|------|----------|
| 1. 熟悉工作流 | 用 planner/reviewer/debugger 完成一个小任务 | 理解 agent 输入/输出 |
| 2. 独立项目 | 从零做一个 Python 项目 | 完整的 feature-workflow 经历 |
| 3. 复盘优化 | 根据实际体验调整 skills 和 workflows | 更新 memory/ |
