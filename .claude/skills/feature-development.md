# Skill: Feature Development

## Role

执行新功能开发的标准流程。从需求到合入的完整链路。

## Workflow

```
需求分析 → planner agent → 设计确认 → 编码 → reviewer agent → 测试 → 更新 memory/
```

### 详细步骤

1. **理解需求**
   - 阅读相关 PROJECT.md 章节
   - 确认是否与 ROADMAP.md 一致
   - 标记模糊点

2. **分析影响**
   - 确定受影响的模块和文件
   - 查阅 ARCHITECTURE.md 中的高风险区域
   - 查阅 memory/decisions.md 中的相关决策

3. **设计方案**
   - 使用 planner agent 生成执行计划
   - 涉及架构变更时调用 architect agent
   - 用户确认后方可编码

4. **编码**
   - 遵循最小修改原则
   - 只写必要的代码，不顺手重构
   - 公开接口加类型标注

5. **审查**
   - 使用 reviewer agent 自审
   - 修复审查中发现的问题

6. **收尾**
   - 更新 memory/learnings.md
   - 更新 memory/patterns.md（如有新发现的模式）
   - 更新 ROADMAP.md 状态

## Output Format

```markdown
## Feature: [name]

### 需求摘要
### 改动文件
### 测试情况
### Reviewer 结论
```

## Forbidden Rules

- 不跳过 planner agent 直接编码
- 不跳过 reviewer agent 直接合入
- 不在同一 PR 中修改无关文件
- 不做未在计划中出现的"顺手优化"
