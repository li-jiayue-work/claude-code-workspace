from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


class Task:
    def __init__(self, id: int, title: str, done: bool = False, created_at: str = "") -> None:
        self.id = id
        self.title = title
        self.done = done
        self.created_at = created_at or datetime.now(timezone.utc).isoformat()

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "done": self.done,
            "created_at": self.created_at,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Task:
        return cls(
            id=data["id"],
            title=data["title"],
            done=data.get("done", False),
            created_at=data.get("created_at", ""),
        )


class TodoList:
    def __init__(self, filepath: str = "tasks.json") -> None:
        self._filepath = Path(filepath)
        self._tasks: list[Task] = []
        self._next_id = 1
        self._load()

    def add(self, title: str) -> Task:
        task = Task(id=self._next_id, title=title)
        self._tasks.append(task)
        self._next_id += 1
        self._save()
        return task

    def list_all(self) -> list[Task]:
        return list(self._tasks)

    def mark_done(self, task_id: int) -> Task:
        task = self._find(task_id)
        task.done = True
        self._save()
        return task

    def mark_undone(self, task_id: int) -> Task:
        task = self._find(task_id)
        task.done = False
        self._save()
        return task

    def remove(self, task_id: int) -> Task:
        task = self._find(task_id)
        self._tasks.remove(task)
        self._save()
        return task

    def _find(self, task_id: int) -> Task:
        for task in self._tasks:
            if task.id == task_id:
                return task
        raise ValueError(f"task {task_id} not found")

    def _load(self) -> None:
        if self._filepath.exists():
            data = json.loads(self._filepath.read_text(encoding="utf-8"))
            self._tasks = [Task.from_dict(item) for item in data]
            if self._tasks:
                self._next_id = max(t.id for t in self._tasks) + 1

    def _save(self) -> None:
        self._filepath.write_text(
            json.dumps([t.to_dict() for t in self._tasks], ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
