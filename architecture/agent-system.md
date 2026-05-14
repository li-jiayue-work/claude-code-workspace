# Architecture: Agent System

> AI Agent 系统的架构设计。包含 agent 编排、调用链路、安全边界。

---

## 系统概述

[描述 agent 系统在整体架构中的角色]

## Agent 清单

| Agent | 职责 | 触发方式 | 调用者 |
|-------|------|----------|--------|
| planner | 任务规划 | 按需 | 用户 / start-task |
| reviewer | 代码审查 | 编码完成后 | 用户 / feature-workflow |
| debugger | 问题定位 | bug 出现时 | 用户 / emergency-debug |
| architect | 架构设计 | 架构变更时 | 用户 / planner |

## Agent 调用链路

```
用户需求
  → start-task (分类)
    → planner (规划)
      → [architect] (如需架构变更)
    → 编码
    → reviewer (审查)
    → finish-task (沉淀)
```

## 输出规范

- 所有 agent 输出使用统一的 markdown 格式
- 输出中包含可操作的结论（不输出空泛分析）
- 每个 agent 输出中标注 `[需确认]` 的项需要用户响应

## 安全边界

- Agent 不得自主执行 git push
- Agent 不得修改 CLAUDE.md 和 .claude/agents/ 自身定义
- Agent 不得删除 memory/ 中的记录（除非用户明确要求且标注原因）
- Agent 调用外部 API 必须经过用户确认（除非已在设置中预授权）

## 可观测性

- 记录 agent 调用链（哪个 agent 被谁触发）
- 记录 agent 输出摘要（用于后续 memory 更新）
- 异常发生时保留完整的 agent 对话上下文

## 扩展规则

- 新增 agent：在 agents/ 目录添加定义文件，更新本文件 agent 清单
- 废弃 agent：保留文件但标注 `[已废弃]`，说明替代方案
- Agent 职责不可重叠——每个 agent 有唯一职责域
