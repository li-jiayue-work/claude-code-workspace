# Knowledge Base 蒸馏工作流

## 概述

本知识库采用**六层认知深度阶梯**，知识从原始对话片段逐级蒸馏为个人观点。

```
1. Raw Notes（我听到了什么？）
       ↓
2. Observations（我注意到了什么？）
       ↓
3. Patterns（什么在重复出现？）
       ↓
4. Principles（什么是普遍成立的？）
       ↓
5. Frameworks（如何分析这类情况？）
       ↓
6. Viewpoints（我相信什么？为什么？）
```

每层升维需要回答该层的核心问题。不是所有条目都需要升到顶层——大多数条目永远停留在 Layer 1-3，这是正常的。

---

## 洞察类型标签

在创建 Layer 2+ 条目时，必须标记一个洞察类型（按认知动作分类，而非按主题）：

| 标签 | 含义 |
|------|------|
| `causal-mechanism` | 理解为什么/如何运作——引擎在引擎盖下 |
| `structural-comparison` | 两个系统/方法的差异及其揭示的信息 |
| `counterintuitive` | 让你惊讶或推翻先前信念的发现 |
| `historical-trajectory` | 事物如何演变，什么路径依赖塑造了它 |
| `leverage-point` | 小变化产生不成比例大效果的地方 |
| `constraint-identification` | 塑造系统的隐形边界或前提条件 |
| `value-tradeoff` | 选择 X 而非 Y 的得失 |
| `pattern-recognition` | 在不同领域看到的重复配置 |

---

## Phase 1: 捕获（持续，60 秒）

**时机：** 每次 AI 对话结束后，当某个内容让你觉得"有意思"时。

**步骤：**
1. 打开 `knowledge-base/inbox/`
2. 创建文件 `YYYY-MM-DD-简短主题.md`
3. 粘贴有趣的对话片段。不格式化、不分析、不评判。只保存。
4. 文件第一行写：`保存原因：[一句话]`
5. 整个过程应在 60 秒内完成。

**规则：** 如果犹豫要不要保存——保存。假阳性的代价是一个小文件，假阴性的代价是丢失一个洞察。

---

## Phase 2: 提取（每周，15 分钟）

**时机：** 每周固定时间。建议周末晚上。

**步骤：**
1. 打开 `knowledge-base/inbox/`，找到所有未处理的文件。
2. 对每个 inbox 文件，识别 1-3 个值得提升的片段。
3. 对每个片段，使用模板 `templates/template-1-raw-note.md` 创建 Layer 1 Raw Note。
4. 在 Raw Note 中记录"说了什么"和"为什么保存"。
5. 在 inbox 文件第一行添加 `[已处理 YYYY-MM-DD]`。
6. 更新 `1-raw-notes/_INDEX.md` 和 `_INDEX.md`。

**丢弃规则：** 如果你无法用一句话表达"为什么保存这个"，丢弃该片段。不是 inbox 中的所有内容都需要保留。

---

## Phase 3: 蒸馏（每月，30 分钟）

**时机：** 每月第一个周末。

### Raw Notes → Observations

1. 回顾过去一个月的所有 Raw Notes，以及之前感觉"卡住"的旧条目。
2. 对每条，问："我能否用自己的话，表述一个由此支持或引发的清晰主张？"
3. 能 → 创建 Layer 2 Observation。在 `up-refs` 中链接源 Raw Note。
4. 不能 → Raw Note 保持原位。不是所有内容都能升维。

### Observations → Patterns

1. 回顾所有 Observations。寻找共享同一底层动态的条目对或集群。
2. 问："在不同的案例中，什么相同的机制在起作用？"
3. 能命名共享动态 → 创建 Layer 3 Pattern。在 `up-refs` 中链接所有来源 Observation。
4. 更新每个来源 Observation 的 `down-refs`，指向新的 Pattern。

---

## Phase 4: 概括（每季度，1 小时）

**时机：** 每季度初（1 月 / 4 月 / 7 月 / 10 月第一个周末）。

### Patterns → Principles

1. 回顾 Patterns。对每条，问："这能否表述为一个超越当前案例的、普遍的因果主张？"
2. 能 → 创建 Layer 4 Principle。**机制部分是必须的**——如果你不能解释为什么该模式成立，它还没准备好成为原则。
3. 链接来源 Pattern，更新其 `down-refs`。

### Principles → Frameworks

1. 回顾 Principles。问："是否有两个或以上原则，组合起来能解释如何分析某一类情况？"
2. 能 → 创建 Layer 5 Framework。**分析序列**是框架与原则列表的区别——定义"先看什么，再看什么，最后看什么"。
3. 链接组成 Principle，更新其 `down-refs`。

---

## Phase 5: 综合（每半年，2 小时）

**时机：** 每年年中（6 月）和年底（12 月）。

### 创建 Viewpoint

1. 问自己："有哪些问题是我一年前回答不了的，但现在感觉自己有能力回答的？"
2. 使用 `templates/template-6-viewpoint.md` 起草 Viewpoint。
3. 明确陈述立场。追溯证据链——从 Framework 到 Principle 到 Pattern 到 Observation 到 Raw Note。
4. 诚实标注链条中的薄弱环节。**每条 Viewpoint 必须包含"什么会改变我的想法"**。
5. 更新所有被引用条目的 `down-refs`。

**重要：** 不需要很多 Viewpoints。一年产出 2-3 个有扎实支撑的观点，就是成功的系统。薄弱的证据链比没有观点更糟。

---

## 复习节奏总览

| 活动 | 频率 | 耗时 | 从 | 到 |
|------|------|------|-----|-----|
| 捕获到 inbox | 每次对话后 | 60 秒 | 记忆 | inbox |
| 提取 | 每周 | 15 分钟 | inbox | Layer 1 |
| 蒸馏 | 每月 | 30 分钟 | Layer 1 | Layer 2 |
| 连接 | 每月 | （同上） | Layer 2 | Layer 3 |
| 概括 | 每季度 | 1 小时 | Layer 3 | Layer 4 |
| 构建框架 | 每季度 | （同上） | Layer 4 | Layer 5 |
| 综合观点 | 每半年 | 2 小时 | Layer 4-5 | Layer 6 |

---

## 双向交叉引用

每条 Layer 2+ 的条目有两个引用字段：

```yaml
up-refs: [该条目建立于哪些下层条目]      # "什么支撑了这条？"
down-refs: [哪些上层条目引用了我]        # "这条支撑了什么？"
```

升维时双端更新：
- 新条目在 `up-refs` 中列出父条目。
- 每个父条目的 `down-refs` 添加新条目。

这构成了一个双向可追溯的证据图谱：
- **向下追溯：** Viewpoint → Framework → Principle → Pattern → Observation → Raw Note
- **向上追溯：** Raw Note → Observation → Pattern → Principle → Framework → Viewpoint

---

## 维护规则

### 不删除条目
如果某条观察后来被推翻，将状态改为 `superseded`，添加备注说明被什么取代。历史记录本身有价值。

### 状态字段用法

| 状态 | 含义 |
|------|------|
| `draft` | 刚创建，尚未与其他条目交叉验证 |
| `stable` | 已验证，成立 |
| `challenged` | 遇到矛盾证据，审查中 |
| `superseded` | 被更准确的条目取代 |
| `revised` | （仅 Viewpoints）基于新证据更新 |

### 置信度字段用法

| 置信度 | 含义 |
|--------|------|
| `tentative` | 有趣的想法，可能错误，正在检验 |
| `moderate` | 多源支撑，看起来稳健 |
| `firm` | 跨多语境验证，如果被推翻会很意外 |

### 分叉而非覆盖
如果需要大幅修改某条 Observation 或 Principle，创建新条目并将旧条目标记为 `superseded`。不要编辑旧条目（除了状态更新、交叉引用和微调）。**思维发展的可追溯性是本系统的核心价值。**

---

## 条目命名规范

- **ID 格式：** `PREFIX-YYYY-NNN`（如 `OBS-2026-003`、`PAT-2026-012`）
- **文件命名：** 小写前缀 + 年份 + 序号（如 `obs-2026-003.md`）
- **序号：** 创建新条目时，查看对应层的 `_INDEX.md` 找到最后一个使用的序号，+1

前缀映射：

| 层级 | ID 前缀 | 文件前缀 |
|------|---------|----------|
| Raw Notes | RAW | raw |
| Observations | OBS | obs |
| Patterns | PAT | pat |
| Principles | PRN | prn |
| Frameworks | FRW | frw |
| Viewpoints | VWP | vwp |
