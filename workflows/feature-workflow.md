# Workflow: Feature Development

## 阶段

```
需求 → 分析 → 设计 → 编码 → 审查 → 合入 → 沉淀
```

## 步骤

### 1. 需求确认 (10%)

- 查阅 PROJECT.md 确认一致
- 检查 ROADMAP.md 确认优先级
- 标记模糊需求为 `[待澄清]`

### 2. 分析 (20%)

- 确定受影响文件和模块
- 查阅 ARCHITECTURE.md 高风险区域
- 查阅 memory/decisions.md 相关决策
- 查阅 memory/learnings.md 相关经验
- 输出：受影响文件清单 + 风险点

### 3. 设计 (15%)

- 调用 planner agent 生成计划
- 涉及架构变更时调用 architect agent
- 输出：执行计划 + 验证方法
- **用户确认后进入编码**

### 4. 编码 (25%)

- 分支：`feature/<name>`
- 最小修改原则
- 编写/更新测试
- 每完成一个子任务，确认测试通过

### 5. 审查 (20%)

- 调用 reviewer agent
- 按 code-review skill 检查清单逐项检查
- 修复审查中发现的问题
- 确认改动范围未扩散

### 6. 合入 (5%)

- commit message 遵循规范
- PR 描述包含：what, why, test plan
- 合入目标分支确认

### 7. 沉淀 (5%)

- 更新 memory/learnings.md
- 更新 memory/patterns.md
- 更新 ROADMAP.md
- 调用 update-memory skill

## 决策门

每个阶段结束时评估：
- 是否按计划进行
- 是否需要回退或调整
- 是否需要升级到 architect agent

## 禁止事项

- 不跳过用户确认直接编码（非 trivial 修改）
- 不跳过 reviewer
- 不跳过经验沉淀
- 不在同一 PR 中包含多个不相关功能
