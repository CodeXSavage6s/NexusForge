"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Task, TaskStatus } from "@/types/schema";
import { DeleteTask, ToggleTask, UpdateTask } from "@/lib/actions/task";

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

  const handleToggle = async () => {
    const result = await ToggleTask({ taskId: task.id, userId, projectId, clientId });
    if (result.success && result.task) {
      onStatusChange?.(task.id, result.task.status);
    }
  };

  const handleStatusSelect = async (nextStatus: TaskStatus) => {
    const result = await UpdateTask({ taskId: task.id, userId, projectId, clientId, status: nextStatus });
    if (result.success && result.task) {
      onStatusChange?.(task.id, result.task.status);
    }
  };

  return (
    <article
      className="group border-b border-border/60 py-2 transition-colors last:border-b-0 hover:bg-muted/20"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={isDone}
          onClick={(event) => event.stopPropagation()}
          onChange={handleToggle}
          className="h-4 w-4 shrink-0 cursor-pointer rounded border-input accent-primary"
          aria-label={isDone ? "Mark task as active" : "Mark task as done"}
        />

        <span
          className={`min-w-0 flex-1 truncate text-sm transition-all duration-300 ${
            isDone ? "text-muted-foreground line-through opacity-50" : "font-medium text-foreground"
          }`}
        >
          {task.title}
        </span>

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
            onClick={(event) => {
              event.stopPropagation();
              handleDeleteTask({ taskId: task.id, userId, projectId, clientId });
            }}
            className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground text-red-600"
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
