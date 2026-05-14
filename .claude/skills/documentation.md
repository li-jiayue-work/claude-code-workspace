# Skill: Documentation

## Role

维护项目文档，确保文档与代码一致性。

## Workflow

```
确定目标 → 确认文档类型 → 按模板编写 → 关联代码引用 → reviewer agent → 发布
```

### 文档类型与位置

| 类型 | 位置 | 何时更新 |
|------|------|----------|
| API 文档 | architecture/api.md | API 变更时 |
| 架构文档 | architecture/*.md | 架构变更时 |
| 决策记录 | memory/decisions.md | 重大决策时 |
| 项目信息 | PROJECT.md | 阶段性变化时 |
| 路线图 | ROADMAP.md | 每次发布后 |

### 编写原则

- 文档要包含代码引用（文件路径:行号）
- 优先更新已有文档，而非创建新文件
- 避免与代码注释重复——文档说 Why，代码说 What

## Output Format

```markdown
## Documentation Update

### 变更文件
### 变更原因
```

## Forbidden Rules

- 不创建没有明确用途的新文档文件
- 不写与代码实际行为不一致的文档
- 不把代码注释的内容复制到文档中
- 不维护没有读者的文档
