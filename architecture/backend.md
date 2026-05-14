# Architecture: Backend

> 后端架构文档。包含分层设计、中间件、错误处理、依赖注入。

---

## 技术栈

| 层 | 选型 | 版本 | 备注 |
|----|------|------|------|
| 语言/运行时 | [Node.js / Go / Python] | | |
| 框架 | [Express / Fastify / Gin / FastAPI] | | |
| ORM | [Prisma / TypeORM / GORM] | | |
| 缓存 | [Redis] | | |
| 消息队列 | [Bull / RabbitMQ / Kafka] | | |

## 分层架构

```
Request
  → Middleware (auth, validation, logging)
    → Controller (路由处理、参数解析)
      → Service (业务逻辑)
        → Repository (数据访问)
          → Database
```

## 分层规则

- **Controller**：只做参数解析和 HTTP 相关处理，不写业务逻辑
- **Service**：纯业务逻辑，不依赖 HTTP 上下文（req/res）
- **Repository**：封装数据库查询，不写业务逻辑
- 禁止 Controller 直接调用 Repository
- 禁止 Service 直接操作 req/res 对象

## 目录结构

```
src/
├── controllers/       # HTTP 处理器
├── services/          # 业务逻辑
├── repositories/      # 数据访问
├── middleware/         # Express/framework 中间件
├── validators/        # 请求验证
├── types/             # 类型定义
├── utils/             # 工具函数
└── config/            # 配置
```

## 错误处理

- 统一错误格式：`{ error: { code: string, message: string, details?: any } }`
- Service 层抛出自定义业务异常
- Controller 层捕获并转换为 HTTP 状态码
- 所有未捕获异常由全局错误处理器处理
- 生产环境不返回 stack trace

## 中间件顺序

```
Request ID → Logging → CORS → Auth → Rate Limit → Validation → Route
```

## API 约定

- RESTful 风格
- 版本前缀：`/api/v1/`
- 分页参数：`?page=1&limit=20`
- 排序参数：`?sort=created_at:desc`

## 安全

- 所有输入必须验证（在 validator 层）
- 所有外部 API 调用必须有超时（默认 10s）
- 敏感操作记录审计日志
- Session/Token 不在 URL 中传递
