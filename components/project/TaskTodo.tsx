"use client";

import { useState } from "react";
import { CheckCircle2, Circle, Pencil, Trash2 } from "lucide-react";
import { Task, TaskStatus } from "@/types/schema";
import { DeleteTask } from "@/lib/actions/task";

const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  REVIEW: "Review",
  DONE: "Done",
};

const STATUS_OPTIONS: TaskStatus[] = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];

type TaskTodoProps = {
  task: Task;
  onStatusChange?: (taskId: string, nextStatus: TaskStatus) => void;
  onEdit?: () => void;
  onClick?: () => void;
  clientId: string;
  projectId: string;
  userId: string | undefined;
};

async function handleDeleteTask({ taskId, userId, projectId, clientId }: { taskId: string; userId: string | undefined; projectId: string; clientId: string }) {
  await DeleteTask({ taskId, userId, projectId, clientId });
}

export default function TaskTodo({ task, onStatusChange, onEdit, onClick, clientId, userId, projectId }: TaskTodoProps) {
  const [expanded, setExpanded] = useState(false);
  const isDone = task.status === "DONE";

  const handleToggle = () => {
    if (!onStatusChange) return;
    onStatusChange(task.id, isDone ? "TODO" : "DONE");
  };

  return (
    <article
      className="rounded-lg border border-border bg-transparent p-2 transition hover:bg-muted/30"
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            handleToggle();
          }}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-input bg-transparent text-slate-600 transition hover:bg-primary/10 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
          aria-label={isDone ? "Mark task as active" : "Mark task as done"}
        >
          {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
        </button>

        <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
          {task.title}
        </span>

        <select
          value={task.status}
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => onStatusChange?.(task.id, event.target.value as TaskStatus)}
          className="shrink-0 rounded-md border border-input bg-transparent px-1.5 py-1 text-xs outline-none"
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>

        {onEdit && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onEdit();
            }}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-input bg-transparent text-slate-500 transition hover:bg-muted hover:text-foreground"
            aria-label="Edit task"
          >
            <Pencil className="h-4 w-4" />
          </button>
        )}

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            handleDeleteTask({ taskId: task.id, userId, projectId, clientId });
          }}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-input bg-transparent text-red-500 transition hover:bg-red-50 hover:text-red-600"
          aria-label="Delete task"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {task.description && (
        <p
          onClick={(event) => {
            event.stopPropagation();
            setExpanded((current) => !current);
          }}
          className={`mt-1 cursor-pointer pl-9 text-xs text-muted-foreground ${
            expanded ? "whitespace-pre-wrap" : "truncate"
          }`}
        >
          {task.description}
        </p>
      )}
    </article>
  );
}
