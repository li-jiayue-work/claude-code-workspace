# Skill: Note Slides

## Role

将长文、PDF、访谈、播客逐字稿、课程稿等材料，转换为单文件 HTML Slides —— 横向翻页、浏览器打开即用，适用于现场讲解、复盘阅读和资料分享。

核心产出：一份带导航、动效、进度持久化的单文件 HTML，所有页面带来源锚点，设计语言克制、留白充裕、长时间阅读舒适。

## Trigger

当用户提到以下任一场景时，激活本 Skill：

- "把这个转成 slides" / "生成 slides" / "做一份 slides"
- "帮我做一页 PPT" / "整理成演示文稿"
- "把这篇长文转成笔记 slides"
- "用 Note Slides 处理这份材料"

## Workflow

```
材料确认 → 内容提取 → 候选页规划 → 自检 → 选择配色 → HTML 生成 → 机械检查 → 交付
```

### 1. 材料确认
- 确认输入类型：URL（需校验正文完整性）、本地 md/html/txt、访谈/播客逐字稿
- 微信公众号链接：先确认拿到的是正文而非环境验证页
- 记录来源元数据（标题、作者、日期）

### 2. 内容提取
- 使用 `scripts/prepare_source.py` 将材料切为带 ID 的来源块
- 输出 `source.json`，标注标题、问题、数字、高权重行

### 3. 候选页规划
- 按材料推进顺序排列候选页（线性推进，不重新排序）
- 每页标注：来源位置 → 单句要点 → 支撑锚点 → 推荐版式 → 自检
- 无法凑出锚点的候选页直接删除
- 输出 `deck.plan.json`

### 4. 规划自检
- 使用 `scripts/check_plan.py` 检查：
  - P0 来源门：每页有 sourceIds、sourceLabel
  - P0 笔记门：无"导读腔"、无泛泛概括、无引号/破折号
  - P0 版式门：至少 6 种版式、宽度三档以上、L9 不超过 12%

### 5. 配色推导
- 从材料气质推导配色：情绪温度、人物气质、时代/材质、冲突类型
- 写一句 "palette thesis"：这组颜色为什么属于这篇内容
- 默认配色（沉静蓝）适用大多数场景，不适用时从六套方案中选择

### 6. HTML 生成
- 基于 `template.html` 生成单文件 HTML
- 每页 `<section class="slide">` 必含 `data-theme`、`data-screen-label`、`data-source`
- 严格遵守版式规则（见 references/）
- 不加占位符、TODO、假数据

### 7. 机械检查
- 使用 `scripts/check_deck.py` 做 P0 HTML 门检查
- 确认：section 数与导航点数一致、无占位符、脚本语法正确、localStorage 进度持久化存在

### 8. 交付
- 输出单个 `.html` 文件，浏览器可直接打开
- 可选：使用 `scripts/pack_core.py` 打包核心文件用于发布

## 核心约束

1. **默认先还原材料，再提炼洞察** —— 不先写中心论点再找材料填空
2. **默认按材料原始顺序线性推进** —— 不做人为重排
3. **每页必须有来源锚点** —— 出处可追溯（链接、标题、作者、时间或文件名）
4. **一页一个想法** —— 内容占画面 40%~60%，其余留白
5. **可见文案禁用引号和破折号** —— 用版式、署名或来源标签替代
6. **不编造、不凑页数** —— 数字、人物、判断必须"回到原材料"
7. **产出为单文件 HTML** —— 不产出 PPTX、多页 PDF 或多文件包

## 默认规模

| 材料类型 | 推荐页数 |
|----------|----------|
| 长篇访谈 / 播客（5000+ 字） | 25-35 页 |
| 短篇文章（1500-3000 字） | 12-18 页 |
| 课程稿 / 演讲稿 | 20-30 页 |

## 文件结构

```
note-slides/
├── SKILL.md                   # 本文件
├── template.html              # HTML 基础模板（12 种版式骨架）
├── references/
│   ├── checklist.md           # 四门质量检查清单（P0 来源/笔记/版式/HTML）
│   ├── content-extraction.md  # 内容提取与笔记拆解方法
│   ├── layouts.md             # 版式决策树（L1-L32 完整索引）
│   ├── layouts-notes.md       # 笔记型骨架（L23-L32 详解）
│   ├── layouts-general.md     # 通用骨架（L1-L22 详解）
│   ├── styles.md              # 设计系统规范（字体/配色/留白/动效）
│   └── wechat-extraction.md   # 微信公众号内容提取规则
└── scripts/
    ├── prepare_source.py      # 材料预处理：切割+分类+信号标注
    ├── check_plan.py          # 规划阶段自检
    ├── check_deck.py          # HTML 交付前机械检查
    └── pack_core.py           # 发布打包（排除生成物）
```

## 与项目技术栈的关系

- **Python**：所有预处理和检查脚本使用 Python 标准库（`argparse`、`json`、`re`、`pathlib`）
- **HTML/CSS/JS**：产出物为纯前端单文件，无构建工具依赖
- **Git**：打包脚本 `pack_core.py` 支持 `--git` 参数自动初始化仓库
- 适合工作流：分析需求 → 提取内容 → 规划 → 生成 → 检查 → 交付，与本项目的 Agent 工作流一致

## Output Format

```markdown
## Note Slides: [标题]

### 材料信息
- 来源 / 作者 / 日期
- 字数 / 块数

### 规划摘要
- 计划页数 / 版式种类 / 配色方案
- 检查通过情况

### 产出
- HTML 文件路径
```

## Forbidden Rules

- 不跳过 check_plan.py 自检直接生成 HTML
- 不跳过 check_deck.py 检查直接交付
- 不为凑页数编造信息
- 不使用引号和破折号在可见文案中
- 不产出 PPTX 或多页 PDF（只产出单文件 HTML）
- 不先写中心论点再找材料填空
