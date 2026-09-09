"use client";

import { useState } from "react";
import { Pencil, Trash2, AlertCircle } from "lucide-react";
import { Task, TaskStatus } from "@/types/schema";
import { DeleteTask, ToggleTask, UpdateTask } from "@/lib/actions/task";

const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  REVIEW: "Review",
  DONE: "Done",
};

const STATUS_OPTIONS: TaskStatus[] = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];

const PRIORITY_STYLES: Record<string, string> = {
  LOW: "bg-muted text-muted-foreground",
  MEDIUM: "bg-blue-500/10 text-blue-500",
  HIGH: "bg-amber-500/10 text-amber-500",
  URGENT: "bg-destructive/10 text-destructive",
};

function formatDueDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

type TaskTodoProps = {
  task: Task;
  onStatusChange?: (taskId: string, nextStatus: TaskStatus) => void;
  onDeleted?: (taskId: string) => void;
  onEdit?: () => void;
  onClick?: () => void;
  workspaceId: string;
  clientId: string;
  projectId: string;
  userId: string | undefined;
};

export default function TaskTodo({
  task,
  onStatusChange,
  onDeleted,
  onEdit,
  onClick,
  workspaceId,
  clientId,
  userId,
  projectId,
}: TaskTodoProps) {
  const [expanded, setExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isDone = task.status === "DONE";
  const isOverdue = !isDone && !!task.dueDate && new Date(task.dueDate).getTime() < Date.now();

  const handleToggle = async () => {
    const result = await ToggleTask({ workspaceId, taskId: task.id, userId, projectId, clientId });
    if (result.success && result.task) {
      onStatusChange?.(task.id, result.task.status);
    }
  };

  const handleStatusSelect = async (nextStatus: TaskStatus) => {
    const result = await UpdateTask({ workspaceId, taskId: task.id, userId, projectId, clientId, status: nextStatus });
    if (result.success && result.task) {
      onStatusChange?.(task.id, result.task.status);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(`Delete task "${task.title}"? This can't be undone.`);
    if (!confirmed) return;

    setIsDeleting(true);
    const result = await DeleteTask({ workspaceId, taskId: task.id, userId, projectId, clientId });
    setIsDeleting(false);

    if (result.success) {
      onDeleted?.(task.id);
    }
  };

  return (
    <article
      className="group border-b border-border/60 py-2 transition-colors last:border-b-0 hover:bg-muted/20"
      onClick={onClick}
    >
      <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:gap-3">
        <input
          type="checkbox"
          checked={isDone}
          onClick={(event) => event.stopPropagation()}
          onChange={handleToggle}
          className="h-4 w-4 shrink-0 cursor-pointer rounded border-input accent-primary"
          aria-label={isDone ? "Mark task as active" : "Mark task as done"}
        />

        <span
          className={`min-w-0 flex-1 basis-full truncate text-sm transition-all duration-300 sm:basis-auto ${
            isDone ? "text-muted-foreground line-through opacity-50" : "font-medium text-foreground"
          }`}
        >
          {task.title}
        </span>

        <span
          className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
            PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.MEDIUM
          }`}
        >
          {task.priority}
        </span>

        {task.dueDate ? (
          <span
            className={`flex shrink-0 items-center gap-1 text-xs ${
              isOverdue ? "font-medium text-destructive" : "text-muted-foreground"
            }`}
          >
            {isOverdue ? <AlertCircle className="h-3 w-3" /> : null}
            {formatDueDate(task.dueDate)}
          </span>
        ) : null}

        <select
          value={task.status}
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => handleStatusSelect(event.target.value as TaskStatus)}
          className="shrink-0 rounded-md border-none bg-transparent py-1 text-xs text-muted-foreground outline-none transition-opacity hover:text-foreground"
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>

        <div className="flex shrink-0 items-center gap-0.5">
          {onEdit && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onEdit();
              }}
              className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="Edit task"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            type="button"
            disabled={isDeleting}
            onClick={(event) => {
              event.stopPropagation();
              handleDelete();
            }}
            className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground text-red-600 disabled:opacity-50"
            aria-label="Delete task"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {task.description && (
        <p
          onClick={(event) => {
            event.stopPropagation();
            setExpanded((current) => !current);
          }}
          className={`mt-1 cursor-pointer pl-7 text-xs text-muted-foreground transition-opacity ${
            isDone ? "opacity-50" : ""
          } ${expanded ? "whitespace-pre-wrap" : "truncate"}`}
        >
          {task.description}
        </p>
      )}
    </article>
  );
}
