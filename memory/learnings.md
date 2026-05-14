# Memory: Learnings

> 记录开发过程中获得的重要认知，非错误也非决策。
> 区别于 mistakes.md：learnings 是正向的知识积累。

---

## 模板

```markdown
### [YYYY-MM-DD] [学习主题]

- **来源**：[文档/实践/他人分享]
- **内容**：[学到了什么]
- **影响**：[如何影响后续工作]
- **相关文件**：[代码引用]
```

---

## 记录

### [2026-05-14] Windows MCP 服务器配置全流程

- **来源**：在 Windows 上为 Claude Code 配置 4 个 MCP 服务器的实践
- **内容**：
  1. MCP 配置文件位于 `C:\Users\<user>\.claude\mcp.json`（用户级）或 `.claude/mcp.json`（项目级），Windows 上路径用正斜杠 `/` 不转义
  2. `npx -y <package>` 免全局安装模式可行，适合学习阶段快速试验
  3. GitHub MCP 用 Classic Token（非 fine-grained），scope 只选 `repo` 即可
  4. Brave Search MCP 需企业认证，DuckDuckGo MCP（`duckduckgo-mcp-server`）是免费免 API Key 的替代
  5. SQLite MCP 官方无维护包，社区替代 `@easy-mcps/sqlite-mcp-server` 可用
  6. `claude mcp add -s user <name> -- <command>` 是添加全局 MCP 的正确命令，`-s user` 不是 `--global`；`-e KEY=value` 必须放在 server name 之前
  7. MCP CLI 配置实际存储在 `~\.claude.json`，不是 `mcp.json`
  8. `@modelcontextprotocol/server-filesystem` 在 Windows 上无法连接（已知兼容性问题），但 Claude Code 内置的 Read/Write/Edit/Glob/Grep 工具已完全覆盖文件操作，filesystem MCP 非必需
- **影响**：后续 MCP 选型优先验证官方包是否存在，找不到再选社区包；优先用 `claude mcp` CLI 管理配置而非手动编辑 JSON
- **相关文件**：`~\.claude.json`

### [2026-05-10] Windows 中文终端 GBK 编码问题

- **来源**：TODO CLI 测试时发现 Unicode 字符 `✓` 在 Windows PowerShell 中报 GBK 编码错误
- **内容**：中文 Windows 终端默认 GBK 编码，不支持部分 Unicode 符号。CLI 输出应使用纯 ASCII 替代（如 `[x]`/`[ ]` 而非 `✓`/`○`）
- **影响**：后续所有 CLI 工具输出字符选择时优先 ASCII
- **相关文件**：[src/cli.py](src/cli.py)

### [2026-05-10] 知识库分类体系设计

- **来源**：自主设计——如何管理 AI 对话中积累的政治/文化/商业洞察
- **内容**：建立六层认知深度阶梯（Raw Notes → Observations → Patterns → Principles → Frameworks → Viewpoints），按"认知动作"分类而非按话题分类。8 种洞察类型标签（causal-mechanism、structural-comparison、counterintuitive 等）。配套 5 阶段蒸馏工作流（捕获→提取→蒸馏→概括→综合），从每周 15 分钟到每半年 2 小时递进。双向 up-refs/down-refs 形成完整证据链。
- **影响**：后续所有 AI 对话洞察按此体系归档；WORKFLOW.md 为日常操作入口
- **相关文件**：[knowledge-base/](knowledge-base/)

### [2026-05-10] Enterprise Due-Diligence Skill 集成经验

- **来源**：将企业尽调 Skill（13 维度）集成到 workspace，并执行携程集团实际调查
- **内容**：Skill 设计的核心矛盾——广度 vs 深度。13 维度确保不遗漏，但单次执行难以在全部维度上达到深度分析。解决思路：引入"分级输出"策略，核心维度深度分析 + 非核心维度信号级判断
- **影响**：后续优化 Skill 时将维度分为 P0（必须深挖）和 P1（信号级即可），支持分批输出
- **相关文件**：[.claude/skills/due-diligence/SKILL.md](.claude/skills/due-diligence/SKILL.md), [docs/due-diligence/](docs/due-diligence/)

### [2026-05-10] Feature-workflow 首次完整走通

- **来源**：TODO CLI 工具从需求到合入的完整流程
- **内容**：planner 分析 → 用户确认 → 编码 → reviewer 自审 → 发现编码 bug → 修复 → memory 沉淀。关键体验：reviewer 阶段发现了测试未覆盖的编码问题（测试用 assert，不涉及终端输出）
- **影响**：确认 workflow 有效，后续坚持走完整流程
- **相关文件**：workflows/feature-workflow.md

### [2026-05-11] LobeHub Skills Marketplace 集成与 Skill Vetter 安全协议

- **来源**：通过 LobeHub Skills Marketplace 安装 openclaw-skills-skill-vetter
- **内容**：LobeHub 是全球最大 AI Agent Skill 市场（10万+ skill），通过 `npx -y @lobehub/market-cli` 统一管理——register（注册设备）→ skills search（搜索）→ skills install（安装，支持 `--agent claude-code` 指定目标平台）→ skills rate/comment（评价）。安装路径为 `./.claude/skills/<identifier>/`（Claude Code）。Skill Vetter 定义了 4 步安全审计协议：① 来源检查（作者/星数/评论/更新日期）② 强制代码审查（14 项红旗检测：curl、凭证窃取、base64混淆、eval/exec、sudo 等）③ 权限范围分析（文件读写/命令执行/网络访问）④ 四级风险分类（🟢低/🟡中/🔴高/⛔极端）
- **影响**：后续安装任何第三方 Skill 前强制走 4 步 Skill Vetter 协议，不跳过代码审查
- **相关文件**：[.claude/skills/openclaw-skills-skill-vetter/SKILL.md](.claude/skills/openclaw-skills-skill-vetter/SKILL.md)

### [2026-05-11] 首次 PDF→PPTX 端到端创作实践

- **来源**：将网易云音乐学术论文 PDF 转换为 14 页演示文稿
- **内容**：完整走通了 PPTX Skill 的三大阶段——① PDF 内容提取（markitdown→识别论文结构/章节/关键论点）② pptxgenjs 代码生成（暗色主题 + 网易云音乐品牌色系 + 14 页分章节布局 + 表格/卡片/时间线/流程图多模式）③ QA 流程（Content QA：markitdown 反提取检查占位符 → Visual QA：LibreOffice→PDF→pdftoppm→14 张 JPG + 子 Agent 程序化分析发现 32 个问题 → 修复间距/字号/溢出 6 处 → 重新生成验证）。关键技巧：全局 npm 包需设置 NODE_PATH 环境变量；暗色主题下红色标题对比度需 ≥4.5:1；pptxgenjs 不复制 option 对象（会被内部 mutate）
- **影响**：验证了 PPTX Skill 完整工具链在 Windows 上的可行性，后续 PDF→PPTX 任务直接复用此流程
- **相关文件**：[scratch/create_pptx_netease_cloudmusic.js](scratch/create_pptx_netease_cloudmusic.js)

### [2026-05-11] Anthropic PPTX Skill 集成——全流程幻灯片工具包

- **来源**：通过 LobeHub 安装 anthropics-skills-pptx（v1.0.2），59 文件
- **内容**：三大工作流——① 读取（markitdown 文本提取 + thumbnail.py 缩略图网格 + unpack 原始 XML 查看）② 编辑（unpack → 修改 XML → clean → pack，保留注释/版式/修订）③ 从零创建（pptxgenjs + JS 代码生成，含设计系统：10 套色彩主题 + 8 组字体配对 + 布局模式 + 排版规范 + 7 大常见错误警示）。另有强制 QA 流程（Content QA: markitdown 文本检查 + 占位符残留检测 | Visual QA: 必须用 SubAgent 审查截图，至少一次 fix-and-verify 循环）。
- **影响**：后续任何涉及 .pptx 的任务（读取/创建/编辑/QA）直接使用此工具包
- **相关文件**：[.claude/skills/anthropics-skills-pptx/SKILL.md](.claude/skills/anthropics-skills-pptx/SKILL.md)

### [2026-05-11] LobeHub Skills Marketplace 集成与 Skill Vetter 安全协议

- **来源**：通过 LobeHub Skills Marketplace 安装 openclaw-skills-skill-vetter
- **内容**：LobeHub 是全球最大 AI Agent Skill 市场（10万+ skill），通过 `npx -y @lobehub/market-cli` 统一管理——register（注册设备）→ skills search（搜索）→ skills install（安装，支持 `--agent claude-code` 指定目标平台）→ skills rate/comment（评价）。安装路径为 `./.claude/skills/<identifier>/`（Claude Code）。Skill Vetter 定义了 4 步安全审计协议：① 来源检查（作者/星数/评论/更新日期）② 强制代码审查（14 项红旗检测：curl、凭证窃取、base64混淆、eval/exec、sudo 等）③ 权限范围分析（文件读写/命令执行/网络访问）④ 四级风险分类（🟢低/🟡中/🔴高/⛔极端）
- **影响**：后续安装任何第三方 Skill 前强制走 4 步 Skill Vetter 协议，不跳过代码审查
- **相关文件**：[.claude/skills/openclaw-skills-skill-vetter/SKILL.md](.claude/skills/openclaw-skills-skill-vetter/SKILL.md)

### [2026-05-11] 外部 GitHub Skill 集成流程

- **来源**：将 gainubi/note-slides 仓库的 Skill 集成到 .claude/skills/
- **内容**：外部 Skill 集成的标准流程——WebFetch 读取上游 SKILL.md + references/ + scripts/ → 适配项目 Skill 格式（Role/Workflow/Forbidden Rules）→ 对齐 PROJECT.md 技术栈（Python 标准库）→ 更新 CLAUDE.md 注册表 → 端到端工作流测试（prepare_source.py → check_plan.py → 循环修复 → pass）
- **影响**：后续第三方 Skill 集成直接复用此流程，减少摸索成本
- **相关文件**：[.claude/skills/note-slides/SKILL.md](.claude/skills/note-slides/SKILL.md)

### [2026-05-14] npx skills add 批量安装实战

- **来源**：通过 `npx skills add` 从多个源安装 10+ skills 的实践
- **内容**：
  1. `npx skills add <owner>/<repo>@<skill-name> -g -y` 是标准安装命令，`-g` 全局安装到 `~\.agents\skills\`，`-y` 跳过交互
  2. `github/awesome-copilot` 是官方社区 skills 仓库（341 skills），不是独立 org `awesome-copilot`——`github/awesome-copilot@refactor` 正确，`awesome-copilot/refactor` 是私有/不存在
  3. `github/awesome-copilot` 仓库极大，默认 300s 克隆超时，需设 `$env:SKILLS_CLONE_TIMEOUT_MS = '600000'` 才能成功安装
  4. 安装前需确认仓库可访问性——`supercent-io/skills-template` 和 `awesome-copilot/refactor` 均认证失败
  5. 安装后 skill 自动出现在 available skills 列表中，无需重启
- **影响**：后续安装 skills 优先用 `github/awesome-copilot`（官方社区源）；大仓库安装提前设 `SKILLS_CLONE_TIMEOUT_MS`；先 `gh repo view` 验证仓库存在
- **相关文件**：`~\.agents\skills\`

---

## 索引

| 日期 | 主题 | 来源 |
|------|------|------|
| 2026-05-14 | npx skills add 批量安装 | Skills 环境搭建 |
| 2026-02-01 | Prisma 连接池 | 生产排查 |
