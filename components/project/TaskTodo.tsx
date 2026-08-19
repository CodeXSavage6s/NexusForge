"use client";

import { CheckCircle2, Circle, CalendarCheck, Flag, Pencil } from "lucide-react";
import { Task, TaskStatus } from "@/types/schema";
import { Trash2 } from "lucide-react";
import { DeleteTask } from "@/lib/actions/task";

const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  REVIEW: "Review",
  DONE: "Done",  
};

const STATUS_STYLES: Record<TaskStatus, string> = {
  TODO: "bg-slate-100 text-slate-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  REVIEW: "bg-amber-100 text-amber-700",
  DONE: "bg-emerald-100 text-emerald-700",
};

const PRIORITY_LABELS: Record<Task["priority"], string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

const PRIORITY_STYLES: Record<Task["priority"], string> = {
  LOW: "bg-slate-100 text-slate-700",
  MEDIUM: "bg-indigo-100 text-indigo-700",
  HIGH: "bg-orange-100 text-orange-700",
  URGENT: "bg-rose-100 text-rose-700",
};

type TaskTodoProps = {
  task: Task;
  onStatusChange?: (taskId: string, nextStatus: TaskStatus) => void;
  onEdit?: () => void;
  onClick?: () => void;
  clientId: string;
  projectId: string;
  userId: string | undefined
};

function formatDueDate(value: Task["dueDate"]) {
  if (!value) return "No due date";
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

async function handleDeleteTask({taskId, userId, projectId, clientId}: {taskId: string, userId: string | undefined, projectId: string, clientId: string}) {
  const deleted = await DeleteTask({taskId, userId, projectId, clientId})
}

export default function TaskTodo({ task, onStatusChange, onEdit, onClick, clientId, userId, projectId }: TaskTodoProps) {
  const isDone = task.status === "DONE";
  const dueDate = formatDueDate(task.dueDate);

  const handleToggle = () => {
    if (!onStatusChange) return;
    onStatusChange(task.id, isDone ? "TODO" : "DONE");
  };

  return (
    <article
      className="group rounded-3xl border border-border bg-card p-2 shadow-sm transition hover:shadow-md"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            handleToggle();
          }}
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-input bg-background text-slate-600 transition hover:bg-primary/10 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
          aria-label={isDone ? "Mark task as active" : "Mark task as done"}
        >
          {isDone ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="min-w-0 flex-1 truncate text-base font-semibold text-foreground">
              {task.title}
            </h3>
            <span className={`text-[11px] font-semibold ${STATUS_STYLES[task.status]}`}>
              {STATUS_LABELS[task.status]}
            </span>
            <span className={`text-[11px] font-semibold ${PRIORITY_STYLES[task.priority]}`}>
              {PRIORITY_LABELS[task.priority]}
            </span>
            {onEdit && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit();
                }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-input bg-background text-slate-500 transition hover:bg-muted hover:text-foreground"
                aria-label="Edit task"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => handleDeleteTask({taskId: task.id, userId, projectId, clientId})}
              className="flex items-center gap-1 text-red-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <Trash2 className="h-4 w-4" />
              <span className="text-sm">Delete</span>
          </button>
          </div>

          {task.description ? (
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
              {task.description}
            </p>
          ) : (
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              No description provided.
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-1">
              <CalendarCheck className="h-3.5 w-3.5" />
              {dueDate}
            </span>
            {task.assignedTo ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-1">
                <Flag className="h-3.5 w-3.5" />
                {task.assignedTo}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
