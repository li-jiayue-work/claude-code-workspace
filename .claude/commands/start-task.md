# Command: Start Task

## 触发

用户在对话中说明要做什么（feature/bugfix/refactor/design）。

## 执行流程

1. **加载上下文**
   - 读取 CLAUDE.md（自动）
   - 读取 PROJECT.md — 确认任务与当前阶段一致
   - 读取 memory/learnings.md — 查阅相关经验

2. **分类任务**
   - Feature → 加载 workflows/feature-workflow.md, skills/feature-development.md
   - Bug → 加载 workflows/debug-workflow.md, skills/bug-fixing.md
   - Refactor → 加载 workflows/review-workflow.md, skills/refactor.md
   - API Design → 加载 skills/api-design.md

3. **启动对应 agent**
   - Feature/设计类 → planner agent 先分析
   - Bug 类 → debugger agent 先定位
   - Refactor → architect agent 评估

4. **输出初始分析**
   - 任务分类
   - 受影响的文件范围
   - 下一步行动

## 禁止事项

- 不确定任务类型就直接动手
- 不加载上下文就开始分析
