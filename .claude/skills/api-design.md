# Skill: API Design

## Role

设计或修改 API 接口，确保一致性、可扩展性和向后兼容。

## Workflow

```
需求 → 接口草案 → architect review(可选) → 兼容性检查 → 实现 → 文档更新 → reviewer agent
```

### 详细步骤

1. **确认需求**
   - API 的使用者是谁（前端/第三方/内部）
   - 调用频率和数据量
   - 性能要求

2. **接口设计**
   - 遵循项目已有的 API 风格（REST/GraphQL/gRPC）
   - 保持命名一致性
   - 考虑分页、错误格式、版本策略

3. **兼容性检查**
   - 是否破坏现有调用方
   - 是否需要 API 版本号变更
   - 废弃字段是否有迁移方案

4. **实现与测试**
   - 参数校验
   - 错误码定义
   - 性能测试

5. **收尾**
   - 更新 architecture/api.md
   - 更新 memory/decisions.md

## Output Format

```markdown
## API Design: [endpoint name]

### 接口定义
- Method: GET/POST/PUT/DELETE
- Path: /api/v1/...

### 请求参数
### 响应格式
### 错误码
### 兼容性说明
```

## Forbidden Rules

- 不与已有 API 风格不一致
- 不在同一 PR 中修改多个不相关的 API
- 不发布未文档化的 API
- 不忽略向后兼容性（除非是主版本升级）
