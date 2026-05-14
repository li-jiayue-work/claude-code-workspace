# ARCHITECTURE.md — 系统架构

> 学习 sandbox 的架构约束。当前无生产系统，架构规则作为学习参考。
> 按需读取，不在每次对话中自动加载。

---

## 系统概述

当前 workspace 本身是一个"AI 协作开发系统"，其"架构"包括：

- **流程架构**：workflows/ 定义的标准开发流程
- **能力架构**：agents/ 和 skills/ 构成的可调用能力单元
- **知识架构**：memory/ 构成的持续学习系统

当有具体代码项目时，此文件将记录该项目的技术架构。

---

## Workspace 内文件依赖关系

```text
CLAUDE.md（自动加载核心约束）
  ├── workflows/（标准流程）
  │     ├── feature-workflow.md → skills/feature-development.md → agents/planner.md + agents/reviewer.md
  │     ├── debug-workflow.md → skills/bug-fixing.md → agents/debugger.md
  │     ├── review-workflow.md → skills/code-review.md → agents/reviewer.md
  │     └── release-workflow.md
  │
  ├── agents/（能力单元）
  │     ├── planner.md → 输出执行计划
  │     ├── reviewer.md → 输出审查报告
  │     ├── debugger.md → 输出根因分析
  │     └── architect.md → 输出架构决策
  │
  ├── memory/（经验沉淀）
  │     ├── mistakes.md
  │     ├── patterns.md
  │     ├── decisions.md
  │     └── learnings.md
  │
  └── PROJCECT.md / ARCHITECTURE.md / ROADMAP.md / DECISIONS.md
        ↑ 按需读取的项目级文档
```

## 数据流：一次标准任务的运转路径

```text
用户需求
  → CLAUDE.md（加载约束）
  → start-task（分类任务类型）
  → 读取 PROJECT.md（确认与当前阶段一致）
  → 读取 memory/（查询过往经验）
  → 启动对应 agent（planner/debugger/architect）
  → 执行编码
  → reviewer agent（审查）
  → finish-task
     → update-memory skill（沉淀）
     → 写入 memory/
```

## 当前技术栈

| 层 | 状态 | 备注 |
| --- | --- | --- |
| 语言 | Python（计划） | 入门友好 |
| 框架 | 未确定 | 根据第一个项目选择 |
| 数据库 | SQLite（计划） | 本地学习不需要外部数据库 |
| 部署 | 本地 | 暂无部署需求 |

## 架构规则（即使学习阶段也应遵守）

- 代码和文档分离——不要把所有信息写在一个文件
- 每次改动走标准流程，养成肌肉记忆
- 不跳过 reviewer
- 每次任务后更新 memory/

## 高风险区域（学习阶段标记）

目前无生产风险。但以下行为应避免：

- 不确认需求就直接写代码
- 跳过 workflow 直接 git commit
- 不更新 memory 就结束任务
