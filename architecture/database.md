# Architecture: Database

> 数据库设计文档。包含表结构、索引策略、迁移规范。

---

## 技术选型

| 项 | 选型 | 备注 |
|----|------|------|
| 数据库 | [PostgreSQL / MySQL / SQLite] | |
| 缓存 | [Redis] | |
| 全文搜索 | [Elasticsearch / 数据库内置] | |
| 迁移工具 | [Prisma Migrate / Flyway / Alembic] | |

## 表设计规则

- 所有表必须有 `id`（UUID 或自增整数）、`created_at`、`updated_at`
- 软删除使用 `deleted_at` 字段（nullable datetime）
- 枚举值用数据库原生 enum 或 lookup 表，不用字符串
- 外键必须有对应的索引
- 不存储敏感数据明文（如 password、secret key）

## 索引策略

- 所有外键列建立索引
- WHERE 条件中频繁出现的列建立索引
- 避免在低基数列上建立索引（如 boolean、status with <5 values）
- 复合索引列顺序：高选择性在前
- 定期审查慢查询日志

## 迁移规范

- 迁移文件命名：`YYYYMMDDHHMMSS_description.sql`
- 每次迁移必须可回滚（提供 down 脚本）
- 涉及大表（>10M 行）的迁移必须使用在线 DDL
- 迁移执行前在 staging 环境验证
- 禁止在事务中包含耗时操作（如建立索引——用 CONCURRENTLY）
- 迁移脚本中禁止包含数据修补——数据修补单独进行并记录到 decisions.md

## 查询规范

- 禁止 `SELECT *`——明确列出所需字段
- 查询必须有限制（LIMIT 或分页）
- 批量操作使用批处理（每批 < 1000 行）
- 报告类查询使用只读副本（如有）
- ORM 生成的 SQL 需检查（避免 N+1 查询）

## ERD 关键实体

<!-- 根据项目实际填写 -->
```
[User] 1—* [Order] *—* [Product]
```

## 备份策略

- 全量备份：每日
- 增量备份：每 6 小时
- 备份保留：30 天
- 恢复演练：每季度
