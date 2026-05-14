# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> 本文件为 Claude Code 自动加载的最高优先级上下文。
> 保持短小、强约束，不做解释性文档。

---

## 项目概述

这是一个 **AI 协作开发学习工作区**（见 [PROJECT.md](PROJECT.md)），通过实际动手项目掌握 Claude Code + Agent 工作流。当前代码是一个 Python TODO CLI 工具——第一个练习项目。

### 代码架构

```
src/
  todo.py    — 核心领域层：Task 模型 + TodoList（JSON 文件持久化，无外部依赖）
  cli.py     — CLI 入口：argparse 子命令（add / list / done / undone / remove）
tests/
  test_todo.py — pytest 测试（Task 模型 + TodoList CRUD + 持久化）
```

### 元系统架构（AI 协作框架）

```
CLAUDE.md 约束 → workflows/（标准流程）→ skills/（任务分类）→ agents/（能力单元：planner / reviewer / debugger / architect）
                    ↑ 每次任务后 → memory/（经验沉淀）
                    ↑ 需要背景时 → knowledge-base/（六层认知蒸馏：原始笔记 → 观察 → 模式 → 原则 → 框架 → 观点）
```

### 常用命令

```bash
# 运行 TODO CLI
python -m src.cli add "买个东西"
python -m src.cli list
python -m src.cli done 1
python -m src.cli remove 1

# 运行所有测试
python -m pytest tests/ -v

# 运行单个测试
python -m pytest tests/test_todo.py::TestTodoList::test_add_and_list -v
```

当前无 build/lint/formatter 配置。项目仅依赖 Python 3.10+ 标准库 + pytest。

---

## 核心原则

1. **最小修改原则** — 只改必须改的代码，拒绝顺手重构。
2. **先分析再编码** — 每次修改前必须先阅读相关代码，输出分析结论。
3. **Reviewer 强制** — 任何非 trivial 修改必须经过 reviewer agent 检查。
4. **Memory 沉淀** — 每次任务完成后更新 memory/ 目录。
5. **工作流优先** — 遵循 workflows/ 中定义的标准流程，不即兴发挥。

## 禁止事项

- 禁止在未理解上下文时直接修改代码
- 禁止在未经用户确认时主动进行大规模重构
- 禁止跳过 workflows/ 中定义的检查步骤
- 禁止编写无类型标注的公共接口
- 禁止在 feature 分支上修改无关文件
- 禁止使用 `git add -A` 或 `git add .`
- 禁止 force push 到 main/master
- 禁止在 commit 中混入调试代码

## 默认 Workflow

```
分析需求 → 查阅 memory/ → 指定受影响文件 → reviewer 审查 → 修改代码 → 验证 → 更新 memory/
```

## 文件层级

| 层级 | 文件 | 加载方式 |
|------|------|----------|
| 自动核心层 | CLAUDE.md | 每次自动加载 |
| 按需知识层 | PROJECT.md, ARCHITECTURE.md, ROADMAP.md | 按需读取 |
| 流程层 | workflows/*.md | 任务启动时加载 |
| 经验层 | memory/*.md | 决策时查询 |
| 能力层 | .claude/skills/*.md, .claude/agents/*.md | 按需调用 |
| 架构详情层 | architecture/*.md | 涉及具体领域时读取 |

## Skills 注册表

| Skill | 入口 Command | 用途 |
| --- | --- | --- |
| feature-development | start-task | 新功能开发全流程 |
| bug-fixing | start-task | 系统性 bug 修复 |
| refactor | start-task | 安全重构 |
| api-design | start-task | API 接口设计 |
| code-review | review-workflow | 代码审查 |
| update-memory | finish-task | 经验沉淀 |
| documentation | 按需 | 文档维护 |
| enterprise-due-diligence | start-due-diligence | 企业深度尽职调查（十二维度情报分析） |
| note-slides | note-slides | 长文/PDF/访谈转精美 HTML Slides（单文件横向翻页） |
| skill-vetter | (auto) | Skill 安全审计网关——安装前强制 4 步审查协议（来源/代码/权限/风险） |
| pptx | (auto) | PPTX 全流程工具包——读取/编辑/创建/QA（markitdown + python-pptx + pptxgenjs） |

## 代码规范（全局）

- 公开 API 必须有类型标注
- 命名遵循项目已有风格
- 错误信息面向开发者，不面向用户
- 不在代码中写长注释解释业务逻辑——用 commit message 和文档

## 分支策略

- `main` — 生产分支，只合入经过 review 的 PR
- `feature/<name>` — 功能开发
- `fix/<name>` — bug 修复
- 禁止直接在 main 上提交

## Commit 规范

- 一个 commit 只做一件事
- message 格式：`<type>: <what> — <why>`
- type: feat / fix / refactor / docs / chore
