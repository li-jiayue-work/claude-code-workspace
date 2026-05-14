# Skill: Bug Fixing

## Role

系统性修复 bug，确保不只是消除症状而是解决根因。

## Workflow

```
bug 描述 → debugger agent → 根因确认 → 最小修复 → reviewer agent → 回归验证 → 更新 memory/mistakes.md
```

### 详细步骤

1. **收集信息**
   - bug 复现步骤
   - 错误日志 / stack trace
   - 受影响版本和用户

2. **定位根因**
   - 使用 debugger agent 形成假设并验证
   - git log 查找引入 bug 的 commit
   - 确认真正的问题所在

3. **设计修复**
   - 最小修复 — 只修改导致 bug 的代码
   - 考虑边界情况
   - 评估修复是否会影响其他功能

4. **实施修复**
   - 编写修复代码
   - 添加回归测试
   - 使用 reviewer agent 审查

5. **写入测试**
   - 确保 bug 场景被测试覆盖
   - 验证修复不会引入新问题

6. **沉淀**
   - 更新 memory/mistakes.md — 记录根因和教训
   - 如发现模式问题，更新 memory/patterns.md

## Output Format

```markdown
## Bug Fix: [title]

### 根因
### 修复
### 回归测试
### 教训
```

## Forbidden Rules

- 不修复症状而不找根因
- 不跳过 debugger agent
- 不跳过回归测试
- 不在修复 bug 时顺手重构（除非重构本身就是修复方案）
- 修复后不更新 memory/mistakes.md
