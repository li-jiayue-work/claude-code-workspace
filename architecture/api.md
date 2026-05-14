# Architecture: API

> API 设计文档。列出所有端点、请求/响应格式、错误码。

---

## 设计原则

- RESTful 风格
- 资源命名使用复数名词
- 版本号在 URL 中：`/api/v1/`
- 统一错误格式
- 分页、排序、筛选使用查询参数

## 通用格式

### 请求头

```
Authorization: Bearer <token>
Content-Type: application/json
Accept: application/json
```

### 成功响应

```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

### 错误响应

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "human-readable description",
    "details": [
      { "field": "email", "message": "invalid format" }
    ]
  }
}
```

## 端点清单

### Auth

| Method | Path | 描述 | 认证 |
|--------|------|------|------|
| POST | /api/v1/auth/login | 登录 | 否 |
| POST | /api/v1/auth/register | 注册 | 否 |
| POST | /api/v1/auth/refresh | 刷新 token | 否 |
| POST | /api/v1/auth/logout | 登出 | 是 |

<!-- 根据项目扩展 -->

## 错误码

| Code | HTTP Status | 说明 |
|------|-------------|------|
| VALIDATION_ERROR | 400 | 请求参数无效 |
| UNAUTHORIZED | 401 | 未认证 |
| FORBIDDEN | 403 | 无权限 |
| NOT_FOUND | 404 | 资源不存在 |
| CONFLICT | 409 | 资源冲突 |
| RATE_LIMITED | 429 | 请求过于频繁 |
| INTERNAL_ERROR | 500 | 服务器内部错误 |

## 速率限制

- 全局：100 req/min per IP
- 认证用户：1000 req/min per user
- 敏感端点（login/register）：10 req/min per IP

## 版本策略

- 主版本变更（v1 → v2）：向后不兼容时
- 次版本兼容：新增字段、新增端点
- 废弃字段至少保留一个主版本的过渡期
