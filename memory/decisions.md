# Memory: Technical Decisions

> 记录重要的技术决策及其背景和后果。
> 格式遵循 Architecture Decision Record (ADR) 简化版。

---

## 模板

```markdown
### [YYYY-MM-DD] [决策标题]

- **状态**：提议 / 已采纳 / 已废弃
- **背景**：[为什么需要做决策]
- **决策**：[选择了什么]
- **替代方案**：[考虑过但未选择的方案及原因]
- **后果**：[正面和负面影响]
- **相关**：[关联的 ADR / PR / issue]
```

---

## 记录

### [2026-05-14] MCP 服务器技术选型

- **状态**：已采纳
- **背景**：在 Windows 上为 Claude Code 配置 MCP 服务器，增强 AI 协作能力
- **决策**：选择 4 个 MCP——filesystem（官方包，Windows 不支持）、github（官方包，已连接）、duckduckgo（社区替代 Brave，已连接）、sqlite（社区替代，已连接）
- **替代方案**：
  - Brave Search：需企业认证，放弃
  - 全局安装 npm 包：选择 `npx -y` 临时下载模式，不污染全局
  - 项目级 mcp.json：选择用户级配置，所有项目共享
- **后果**：
  - 正面：零全局安装，3 个 MCP 连接成功（github / duckduckgo / sqlite），filesystem 因 Windows 兼容性失败但内置工具已覆盖
  - 注意：GitHub Token 明文存储于 claude.json，需确保文件不进入 git 仓库
- **相关**：[C:\Users\HP\.claude.json](C:\Users\HP\.claude.json)

---

### [2026-05-10] TODO CLI 工具技术选型

- **状态**：已采纳
- **背景**：第一个练习项目，需要一个简单但完整的小工具来走通 AI 协作工作流
- **决策**：纯 Python 标准库（argparse + json + pathlib），零外部依赖
- **替代方案**：
  - 使用 click/rich 等第三方 CLI 库：更强大但引入依赖，学习曲线陡
  - 使用 SQLite 存储：更正规但学习阶段不需要
  - 使用 Typer（基于 type hints 的 CLI 框架）：更现代但需要额外安装
- **后果**：
  - 正面：零依赖，pip install 都不需要，代码即用
  - 负面：argparse 较为冗长，功能复杂后替换成本高
- **相关**：[src/todo.py](src/todo.py), [src/cli.py](src/cli.py)

---

### [2026-05-11] 集成 note-slides Skill 到学习 workspace

- **状态**：已采纳
- **背景**：用户在 GitHub 发现 gainubi/note-slides Skill（81 Star），希望在当前 workspace 集成并适配
- **决策**：完整复制上游 SKILL.md + template.html + references/ + scripts/（15 个文件），适配为项目级 Skill 格式
- **替代方案**：
  - 仅集成 SKILL.md 定义文件：失去 references/ 设计规范和 scripts/ 自动化检查的价值
  - 作为独立仓库维护：与 PROJECT.md 的学习目标割裂
- **后果**：
  - 正面：CLAUDE.md Skills 注册表 +1，工作流测试完整通过，Python 脚本零依赖运行
  - 注意：template.html 依赖 Google Fonts CDN（离线环境需调整）
- **相关**：[.claude/skills/note-slides/SKILL.md](.claude/skills/note-slides/SKILL.md), CLAUDE.md

- **状态**：中期存档（6/12 维度完成）
- **背景**：用户请求对携程集团（Trip.com Group, NASDAQ: TCOM）进行商业尽调，场景为投资分析
- **决策**：采用 enterprise-due-diligence Skill 的 12 维度框架进行系统调查
- **关键发现**：综合评级🟡中风险；基本面强势（利润翻倍、P/E 7.52、现金718亿）vs 法律风险集中（SAMR反垄断调查、多项证券集体诉讼）；股权穿透显示 Capital World Investors 8.9%/百度 7.3%/BlackRock 5.2%/梁建章 6.5%
- **后果**：完整报告存档于 docs/due-diligence/携程-Trip.com-Group-2026-05-10.md，余6维度待补充
- **相关**：CLAUDE.md, .claude/skills/due-diligence/SKILL.md

---

## 索引

| 日期 | 决策 | 状态 |
|------|------|------|
| 2026-05-10 | 携程集团商业尽职调查 | 中期存档 |
| 2026-01-10 | 选择 TypeScript | 已采纳 |
