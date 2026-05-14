from __future__ import annotations

import json
import tempfile
from pathlib import Path

import pytest

from src.todo import Task, TodoList


class TestTask:
    def test_to_dict(self) -> None:
        task = Task(id=1, title="测试", created_at="2026-01-01T00:00:00")
        d = task.to_dict()
        assert d["id"] == 1
        assert d["title"] == "测试"
        assert d["done"] is False

    def test_from_dict(self) -> None:
        task = Task.from_dict({"id": 2, "title": "从字典创建", "done": True})
        assert task.id == 2
        assert task.title == "从字典创建"
        assert task.done is True


class TestTodoList:
    def _make_path(self) -> str:
        return str(Path(tempfile.mkdtemp()) / "test_tasks.json")

    def test_add_and_list(self) -> None:
        path = self._make_path()
        todo = TodoList(path)
        todo.add("第一件事")
        todo.add("第二件事")
        tasks = todo.list_all()
        assert len(tasks) == 2
        assert tasks[0].title == "第一件事"
        assert tasks[1].title == "第二件事"

    def test_mark_done(self) -> None:
        path = self._make_path()
        todo = TodoList(path)
        todo.add("待完成")
        todo.mark_done(1)
        assert todo.list_all()[0].done is True

    def test_mark_undone(self) -> None:
        path = self._make_path()
        todo = TodoList(path)
        todo.add("先完成再取消")
        todo.mark_done(1)
        todo.mark_undone(1)
        assert todo.list_all()[0].done is False

    def test_remove(self) -> None:
        path = self._make_path()
        todo = TodoList(path)
        todo.add("将被删除")
        todo.remove(1)
        assert len(todo.list_all()) == 0

    def test_not_found(self) -> None:
        path = self._make_path()
        todo = TodoList(path)
        with pytest.raises(ValueError, match="task 99 not found"):
            todo.mark_done(99)

    def test_persist(self) -> None:
        path = self._make_path()
        todo1 = TodoList(path)
        todo1.add("持久化测试")

        todo2 = TodoList(path)
        tasks = todo2.list_all()
        assert len(tasks) == 1
        assert tasks[0].title == "持久化测试"

    def test_empty_file(self) -> None:
        path = self._make_path()
        Path(path).write_text("[]", encoding="utf-8")
        todo = TodoList(path)
        assert len(todo.list_all()) == 0
