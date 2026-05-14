# Command: Finish Task

## 触发

用户表示任务完成或代码修改结束。

## 执行流程

1. **验证**
   - 对照原始需求逐项检查
   - 确认 reviewer agent 已通过
   - 确认测试通过

2. **清理**
   - 移除调试代码
   - 检查是否有遗留的 TODO
   - 确认没有无关文件的修改

3. **文档更新**
   - 更新 ROADMAP.md 状态
   - 更新 PROJECT.md 已知问题（如修复了 bug）

4. **沉淀经验**
   - 调用 skills/update-memory.md
   - 更新 memory/mistakes.md（如有犯错）
   - 更新 memory/patterns.md（如有模式发现）
   - 更新 memory/learnings.md（如有新认知）

5. **输出任务摘要**
   ```markdown
   ## Task Complete: [名称]
   - 改动文件：[数量]
   - Review 结论：[通过/条件通过]
   - Memory 更新：[条数]
   ```

## 禁止事项

- 不跳过 update-memory 步骤
- 不遗留未跟踪的 TODO
- 不提交调试代码
