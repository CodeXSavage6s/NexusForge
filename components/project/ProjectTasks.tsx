"use client";

import { useMemo, useState } from "react";
import { Plus, Search, Filter, ArrowUpDown } from "lucide-react";
import TaskTodo from "@/components/project/TaskTodo";
import { Task, TaskStatus, Priority } from "@/types/schema";
import { CreateTask, UpdateTask } from "@/lib/actions/task";

const STATUS_OPTIONS: (TaskStatus | "ALL")[] = ["ALL", "TODO", "IN_PROGRESS", "REVIEW", "DONE"];
const PRIORITY_OPTIONS: (Priority | "ALL")[] = ["ALL", "LOW", "MEDIUM", "HIGH", "URGENT"];
const PRIORITY_RANK: Record<Priority, number> = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
type SortKey = "dueDate" | "priority" | "status";

function toDateInputValue(date: Date | null | undefined) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

export default function ProjectTasks({
  task,
  workspaceId,
  projectId,
  clientId,
  userId,
}: {
  task: Task[] | undefined;
  workspaceId: string;
  projectId: string;
  clientId: string;
  userId: string | undefined;
}) {
  const [tasks, setTasks] = useState<Task[] | undefined>(task ?? []);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "ALL">("ALL");
  const [filterPriority, setFilterPriority] = useState<Priority | "ALL">("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("dueDate");

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>("MEDIUM");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingStatus, setEditingStatus] = useState<TaskStatus>("TODO");
  const [editingPriority, setEditingPriority] = useState<Priority>("MEDIUM");
  const [editingDueDate, setEditingDueDate] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const filteredTasks = useMemo(() => {
    const list = (tasks ?? []).filter((t) => {
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filterStatus === "ALL" || t.status === filterStatus;
      const matchesPriority = filterPriority === "ALL" || t.priority === filterPriority;
      return matchesSearch && matchesStatus && matchesPriority;
    });

    return [...list].sort((a, b) => {
      if (sortKey === "priority") return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      if (sortKey === "status") return a.status.localeCompare(b.status);
      // dueDate: tasks without a due date sort last
      const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      return aTime - bTime;
    });
  }, [tasks, search, filterStatus, filterPriority, sortKey]);

  const totalCount = tasks?.length ?? 0;
  const completedCount = tasks?.filter((t) => t.status === "DONE").length ?? 0;
  const progressPct = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const addTask = async () => {
    const trimmed = newTaskTitle.trim();
    if (!trimmed || isAdding) return;

    setIsAdding(true);
    try {
      const result = await CreateTask({
        workspaceId,
        projectId,
        title: trimmed,
        description: "",
        priority: newTaskPriority,
        dueDate: newTaskDueDate ? new Date(newTaskDueDate) : null,
      });
      if (result.success && result.task) {
        setTasks((current) => [result.task, ...(current ?? [])]);
        setNewTaskTitle("");
        setNewTaskDueDate("");
        setNewTaskPriority("MEDIUM");
      } else {
        console.error("Failed to add task", result.error);
      }
    } finally {
      setIsAdding(false);
    }
  };

  const startEdit = (t: Task) => {
    setEditingTaskId(t.id);
    setEditingTitle(t.title);
    setEditingDescription(t.description ?? "");
    setEditingStatus(t.status);
    setEditingPriority(t.priority);
    setEditingDueDate(toDateInputValue(t.dueDate));
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditingTitle("");
    setEditingDescription("");
    setEditingStatus("TODO");
    setEditingPriority("MEDIUM");
    setEditingDueDate("");
  };

  const saveEdit = async () => {
    if (!editingTaskId) return;
    const trimmed = editingTitle.trim();
    if (!trimmed || isSavingEdit) return;

    setIsSavingEdit(true);
    try {
      const result = await UpdateTask({
        workspaceId,
        taskId: editingTaskId,
        clientId,
        projectId,
        userId,
        title: trimmed,
        description: editingDescription,
        status: editingStatus,
        priority: editingPriority,
        dueDate: editingDueDate ? new Date(editingDueDate) : null,
      });

      if (result.success && result.task) {
        setTasks((current) =>
          current?.map((t) => (t.id === editingTaskId ? (result.task as Task) : t))
        );
        cancelEdit();
      } else {
        console.error("Failed to save task", result.error);
      }
    } finally {
      setIsSavingEdit(false);
    }
  };

  const updateStatus = (taskId: string, nextStatus: TaskStatus) => {
    setTasks((current) =>
      current?.map((t) => (t.id === taskId ? { ...t, status: nextStatus, updatedAt: new Date() } : t))
    );
  };

  const removeTaskFromState = (taskId: string) => {
    setTasks((current) => current?.filter((t) => t.id !== taskId));
  };

  return (
    <section className="space-y-4 rounded-xl border border-border bg-transparent p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2 sm:flex-none">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-input bg-transparent p-2 sm:flex-none">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tasks"
              className="w-full min-w-0 bg-transparent text-sm outline-none sm:min-w-40"
            />
          </div>

          <div className="flex shrink-0 items-center gap-1 rounded-lg border border-input bg-transparent p-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={filterStatus}
              onChange={(event) => setFilterStatus(event.target.value as TaskStatus | "ALL")}
              className="bg-transparent text-sm outline-none"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status === "ALL" ? "All statuses" : status.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <div className="flex shrink-0 items-center gap-1 rounded-lg border border-input bg-transparent p-2">
            <select
              value={filterPriority}
              onChange={(event) => setFilterPriority(event.target.value as Priority | "ALL")}
              className="bg-transparent text-sm outline-none"
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p === "ALL" ? "All priorities" : p}
                </option>
              ))}
            </select>
          </div>

          <div className="flex shrink-0 items-center gap-1 rounded-lg border border-input bg-transparent p-2">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <select
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value as SortKey)}
              className="bg-transparent text-sm outline-none"
            >
              <option value="dueDate">Due date</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-2 rounded-lg border border-border bg-transparent p-3 text-sm">
        <div className="flex items-center justify-between">
          <span>
            {completedCount} of {totalCount} task{totalCount === 1 ? "" : "s"} complete
          </span>
          <strong className="text-foreground">{progressPct}%</strong>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted">
          <div className="h-1.5 rounded-full bg-primary" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          value={newTaskTitle}
          onChange={(event) => setNewTaskTitle(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && addTask()}
          placeholder="Add a new task"
          className="min-w-40 flex-1 rounded-lg border border-input bg-background p-2 text-sm outline-none"
        />
        <select
          value={newTaskPriority}
          onChange={(event) => setNewTaskPriority(event.target.value as Priority)}
          className="rounded-lg border border-input bg-background p-2 text-sm outline-none"
        >
          {(["LOW", "MEDIUM", "HIGH", "URGENT"] as Priority[]).map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={newTaskDueDate}
          onChange={(event) => setNewTaskDueDate(event.target.value)}
          className="rounded-lg border border-input bg-background p-2 text-sm outline-none"
        />
        <button
          type="button"
          onClick={addTask}
          disabled={isAdding || !newTaskTitle.trim()}
          className="inline-flex w-fit items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add Task
        </button>
      </div>

      <div className="space-y-3 grid md:grid-cols-2">
        {totalCount === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-background p-6 text-center text-sm text-muted-foreground">
            No tasks yet. Add your first task above to start tracking project progress.
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-background p-6 text-center text-sm text-muted-foreground">
            No tasks match your search or filters.
          </div>
        ) : (
          filteredTasks.map((t) =>
            t.id === editingTaskId ? (
              <div key={t.id} className="rounded-lg border border-border bg-transparent p-4">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="min-w-0 flex-1">
                      <label className="text-xs font-medium text-muted-foreground">Title</label>
                      <input
                        value={editingTitle}
                        onChange={(event) => setEditingTitle(event.target.value)}
                        className="mt-1 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none"
                      />
                    </div>
                    <div className="shrink-0">
                      <label className="text-xs font-medium text-muted-foreground">Status</label>
                      <select
                        value={editingStatus}
                        onChange={(event) => setEditingStatus(event.target.value as TaskStatus)}
                        className="mt-1 rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none"
                      >
                        {(["TODO", "IN_PROGRESS", "REVIEW", "DONE"] as TaskStatus[]).map((status) => (
                          <option key={status} value={status}>
                            {status.replace("_", " ")}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="shrink-0">
                      <label className="text-xs font-medium text-muted-foreground">Priority</label>
                      <select
                        value={editingPriority}
                        onChange={(event) => setEditingPriority(event.target.value as Priority)}
                        className="mt-1 rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none"
                      >
                        {(["LOW", "MEDIUM", "HIGH", "URGENT"] as Priority[]).map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="shrink-0">
                      <label className="text-xs font-medium text-muted-foreground">Due date</label>
                      <input
                        type="date"
                        value={editingDueDate}
                        onChange={(event) => setEditingDueDate(event.target.value)}
                        className="mt-1 rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-muted-foreground">Description</label>
                    <textarea
                      value={editingDescription}
                      onChange={(event) => setEditingDescription(event.target.value)}
                      className="min-h-25 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={saveEdit}
                      disabled={isSavingEdit || !editingTitle.trim()}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
                    >
                      {isSavingEdit ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="rounded-lg border border-input bg-background px-4 py-2 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <TaskTodo
                key={t.id}
                task={t}
                onStatusChange={(id, nextStatus) => updateStatus(id, nextStatus)}
                onDeleted={removeTaskFromState}
                onEdit={() => startEdit(t)}
                workspaceId={workspaceId}
                projectId={projectId}
                clientId={clientId}
                userId={userId}
              />
            )
          )
        )}
      </div>
    </section>
  );
}
