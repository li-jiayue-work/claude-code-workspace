# ROADMAP.md — 路线图

> 记录已完成、进行中、计划中的工作。

---

## 版本规划

### v0.1 — 学习工作流（当前）

- [x] Workspace 初始化
- [x] 第一个练习项目：TODO CLI 工具
- [ ] 完整走通 debug-workflow（制造一个 bug 然后修）
- [ ] 完整走通 review-workflow（跨多个 PR 的场景）

### v0.2 — 进阶项目

- [ ] 选择一个更大一点的 Python 项目
- [ ] 引入外部依赖（如 requests, rich）
- [ ] 体验架构变更流程（architect agent）

## 变更记录

| 日期 | 内容 |
| --- | --- |
| 2026-05-16 | 安装并配置 3 个 Claude Code 插件：commit-commands / security-guidance / content-creator |
| 2026-05-16 | 新增 2 个 Claude Code 插件市场：ccplugins/awesome-claude-code-plugins + anthropics/claude-code |
| 2026-05-16 | git SSL 后端切换为 schannel（Windows 原生），解决 GFW 阻断 GitHub 连接 |
| 2026-05-15 | 安装 OpenCLI：CLI + Chrome 扩展 + 5 个 AI Agent Skills（对称安装了多种 IDE） |
| 2026-05-15 | 配置 Lark MCP 服务器（project-level，含凭证） |
| 2026-05-14 | 配置 MCP 服务器 4 个：filesystem / github / duckduckgo / sqlite（npx 零全局安装） |
| 2026-05-11 | 首次 PDF→PPTX 完整创作流程：14 页学术论文演示文稿（pptxgenjs + QA + fix cycle） |
| 2026-05-11 | 集成 LobeHub Skills Marketplace + 安装 skill-vetter（技能安全审计协议） |
| 2026-05-11 | 集成 Anthropic PPTX Skill（59 文件，markitdown + python-pptx + pptxgenjs） |
| 2026-05-11 | 建立 knowledge-base 知识库分类体系（六层认知阶梯 + 蒸馏工作流，16 个文件） |
| 2026-05-11 | 集成 note-slides Skill（长文/PDF/访谈转 HTML Slides，15 个文件，工作流测试通过） |
| 2026-05-10 | 完成第一个练习项目：TODO CLI 工具（add/list/done/undone/remove） |
| 2026-05-10 | 集成 enterprise-due-diligence Skill（13 维度企业尽调） |
| 2026-05-10 | Workspace 结构初始化 |
