# Memory: Patterns

> 记录代码中发现的模式和约定。
> 每条记录包含：模式名、适用场景、代码示例、反模式。

---

## 模板

```markdown
### [模式名]

- **场景**：[什么时候用]
- **结构**：[核心结构描述]
- **示例**：[代码片段或文件引用]
- **反模式**：[什么情况下不应该用]
- **来源**：[发现于哪个模块]
```

---

## 记录

### Pipeline-Skill Architecture（管道式 Skill 架构）

- **场景**：Skill 有严格的顺序处理流程（如 材料→提取→规划→检查→生成→验证），每个阶段有对应的 Python 脚本做自动化检查
- **结构**：SKILL.md 定义角色和工作流 → references/ 提供设计决策参考 → scripts/ 提供每个阶段的 CLI 验证工具 → template.html 为产出骨架 → 每个阶段失败即停止
- **示例**：见 [.claude/skills/note-slides/SKILL.md](.claude/skills/note-slides/SKILL.md)（8 步管道，3 个 Python 检查脚本）
- **反模式**：不要跳过管道中的检查步骤——check_plan.py 捕获的错误在实际 HTML 生成后会放大 N 倍
- **来源**：note-slides Skill 集成

### PDF-to-PPTX Creation Pipeline（PDF 转 PPTX 创作管道）

- **场景**：将 PDF/文档内容转换为结构化演示文稿（学术论文、报告、提案等）
- **结构**：6 阶段管道——① 内容提取（markitdown 提取全文 → 识别章节/层级/关键数据）② 结构规划（按论文逻辑映射为幻灯片序列，每页一个核心观点）③ 设计决策（选定色彩主题/字体配对/布局模式，与内容属性匹配）④ 代码生成（pptxgenjs 逐页编程，善用卡片/表格/时间线/流程图等多模式组件）⑤ Content QA（markitdown 反提取 → grep 占位符/结构完整性）⑥ Visual QA（LibreOffice → PDF → pdftoppm → JPG → 子 Agent 程序化检查间距/溢出/对比度/对齐 → 修复 → 重新生成）
- **示例**：见 [scratch/create_pptx_netease_cloudmusic.js](scratch/create_pptx_netease_cloudmusic.js)（14 页暗色主题学术演示文稿，含 VRIN 表格/时间线/三阶段流图）
- **反模式**：不要跳过 Visual QA——代码生成的幻灯片第一版几乎总有间距/对齐/溢出问题；不要使用 Unicode 项目符号（pptxgenjs 用 `bullet: true`）
- **来源**：网易云音乐论文 PPTX 创作实践

### Skill Vetting Gateway（Skill 安全审计网关）

- **场景**：安装任何来自外部源的 AI Agent Skill（LobeHub、GitHub、其他 Agent 分享）之前
- **结构**：4 步审计管道——来源检查（作者/星数/更新日期/社区评价）→ 强制代码审查（14 项红旗清单：网络外传、凭证窃取、base64 混淆、eval/exec、sudo、隐藏下载等）→ 权限范围分析（最小权限原则）→ 四级风险分类（低/中/高/极端）→ 产生标准化审计报告
- **示例**：见 [.claude/skills/openclaw-skills-skill-vetter/SKILL.md](.claude/skills/openclaw-skills-skill-vetter/SKILL.md)（本次任务对 skill-vetter 自身执行了自审计）
- **反模式**：不要因为 Skill 评价高/下载量大就跳过代码审查——纯文档 Skill 安全不等于所有 Skill 安全
- **来源**：openclaw-skills-skill-vetter

### Multi-Dimension Due Diligence（多维度分级尽调）

- **场景**：需要对目标企业/技术方案/第三方服务做全面评估时
- **结构**：定义评估维度 → 每个维度有明确的检查项和数据来源 → 维度分为 P0（必须深挖）和 P1（信号级判断）→ 逐维度输出带评级的报告 → 综合评级 → 场景化建议
- **示例**：见 [.claude/skills/due-diligence/SKILL.md](.claude/skills/due-diligence/SKILL.md)（13 维度企业尽调框架）
- **反模式**：不要所有维度平均用力——核心维度深度分析，非核心维度接受信号级判断即可
- **来源**：enterprise-due-diligence Skill

### Skills Marketplace Installation（Skills 市场安装模式）

- **场景**：从 GitHub 仓库批量安装 AI Agent Skills 到工作区
- **结构**：`npx skills add <owner>/<repo>@<skill-name> -g -y` → 克隆 → 发现 skills → 安全评估（Gen/Socket/Snyk）→ 安装到 `~\.agents\skills\` → 自动注册到 Claude Code
- **示例**：`npx skills add github/awesome-copilot@refactor -g -y`（官方社区源，341 skills）
- **反模式**：不要假设 `<org>/<repo>` 格式的 org 就是 GitHub 用户名——先 `gh repo view` 验证；大仓库（如 awesome-copilot）不设 `SKILLS_CLONE_TIMEOUT_MS` 会超时
- **来源**：Skills 安装实践

---

## 索引

| 模式 | 适用层 | 定义位置 |
|------|--------|----------|
| Repository Pattern | 数据层 | [memory/patterns.md](memory/patterns.md) |
