from __future__ import annotations

import argparse
import sys

from src.todo import TodoList


def cmd_add(todo: TodoList, args: argparse.Namespace) -> int:
    task = todo.add(args.title)
    print(f"[{task.id}] {task.title} — 已添加")
    return 0


def cmd_list(todo: TodoList, args: argparse.Namespace) -> int:  # noqa: ARG001
    tasks = todo.list_all()
    if not tasks:
        print("暂无待办事项")
        return 0
    for task in tasks:
        status = "[x]" if task.done else "[ ]"
        print(f"  [{task.id}] {status} {task.title}")
    return 0


def cmd_done(todo: TodoList, args: argparse.Namespace) -> int:
    task = todo.mark_done(args.id)
    print(f"[{task.id}] {task.title} — 已标记完成")
    return 0


def cmd_undone(todo: TodoList, args: argparse.Namespace) -> int:
    task = todo.mark_undone(args.id)
    print(f"[{task.id}] {task.title} — 已取消完成")
    return 0


def cmd_remove(todo: TodoList, args: argparse.Namespace) -> int:
    task = todo.remove(args.id)
    print(f"[{task.id}] {task.title} — 已删除")
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="todo", description="待办事项管理工具")
    subparsers = parser.add_subparsers(dest="command")

    p_add = subparsers.add_parser("add", help="添加待办事项")
    p_add.add_argument("title", help="事项标题")

    subparsers.add_parser("list", help="列出所有待办事项")

    p_done = subparsers.add_parser("done", help="标记为已完成")
    p_done.add_argument("id", type=int, help="事项编号")

    p_undone = subparsers.add_parser("undone", help="取消完成标记")
    p_undone.add_argument("id", type=int, help="事项编号")

    p_remove = subparsers.add_parser("remove", help="删除待办事项")
    p_remove.add_argument("id", type=int, help="事项编号")

    args = parser.parse_args(argv)
    if args.command is None:
        parser.print_help()
        return 1

    todo = TodoList()
    handlers = {
        "add": cmd_add,
        "list": cmd_list,
        "done": cmd_done,
        "undone": cmd_undone,
        "remove": cmd_remove,
    }
    try:
        return handlers[args.command](todo, args)
    except ValueError as e:
        print(f"错误: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
