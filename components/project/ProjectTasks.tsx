"use client";

import { useMemo, useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import TaskTodo from "@/components/project/TaskTodo";
import { Task, TaskStatus } from "@/types/schema";
import { CreateTask } from "@/lib/actions/task";

const STATUS_OPTIONS: (TaskStatus | "ALL")[] = ["ALL", "TODO", "IN_PROGRESS", "REVIEW", "DONE"];

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function ProjectTasks({ task, projectId, clientId, userId }: { task: Task[] | undefined; projectId: string, clientId: string, userId: string | undefined }) {
  const [tasks, setTasks] = useState<Task[] | undefined>(task ?? []);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "ALL">("ALL");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingStatus, setEditingStatus] = useState<TaskStatus>("TODO");

  const filteredTasks = useMemo(() => {
    return tasks?.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filterStatus === "ALL" || task.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [tasks, search, filterStatus]);

  const completedCount = tasks?.filter((task) => task.status === "DONE").length;

  const addTask = async () => {
    const trimmed = newTaskTitle.trim();
    if (!trimmed) return;

    const nextTask = {
      projectId,
      title: trimmed,
      description: "",
    };

    try {
      const result = await CreateTask(nextTask);
      if (result.success && result.task) {
        setTasks((current) => [result.task, ...current]);
      } else {
        console.error("Failed to add task", result.error );
      }
    } catch (error) {
      console.error("Failed to add task", error);
    } finally {
      setNewTaskTitle("");
    }
  };

  const startEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
    setEditingDescription(task.description ?? "");
    setEditingStatus(task.status);
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditingTitle("");
    setEditingDescription("");
    setEditingStatus("TODO");
  };

  const saveEdit = () => {
    if (!editingTaskId) return;
    const trimmed = editingTitle.trim();
    if (!trimmed) return;

    setTasks((current) =>
      current?.map((task) =>
        task.id === editingTaskId
          ? {
              ...task,
              title: trimmed,
              description: editingDescription,
              status: editingStatus,
              updatedAt: new Date(),
            }
          : task
      )
    );

    cancelEdit();
  };

  const updateStatus = (taskId: string, nextStatus: TaskStatus) => {
    setTasks((current) =>
      current?.map((task) =>
        task.id === taskId ? { ...task, status: nextStatus, updatedAt: new Date() } : task
      )
    );
  };

  return (
    <section className="space-y-4 rounded-xl border border-border bg-transparent p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">

        <div className="flex flex-1 items-center gap-2 sm:flex-none">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-input bg-transparent p-2 sm:flex-none">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tasks"
              className="w-full min-w-0 bg-transparent text-sm outline-none sm:min-w-45"
            />
          </div>

          <div className="flex shrink-0 items-center gap-2 rounded-lg border border-input bg-transparent p-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={filterStatus}
              onChange={(event) => setFilterStatus(event.target.value as TaskStatus | "ALL")}
              className="bg-transparent text-sm outline-none"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status === "ALL" ? "All" : status.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-3 rounded-lg border border-border bg-muted p-3 text-sm text-transparent">
        <div className="flex items-center justify-between">
          <span>Total tasks</span>
          <strong className="text-foreground">{tasks?.length}</strong>
        </div>
        <div className="flex items-center justify-between">
          <span>Completed</span>
          <strong className="text-foreground">{completedCount}</strong>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          value={newTaskTitle}
          onChange={(event) => setNewTaskTitle(event.target.value)}
          placeholder="Add a new task"
          className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none"
        />
        <button
          type="button"
          onClick={addTask}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Task
        </button>
      </div>

      <div className="space-y-3">
        {filteredTasks?.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-background p-6 text-center text-sm text-muted-foreground">
            No tasks match your search or filter.
          </div>
        ) : (
          filteredTasks?.map((task) =>
            task.id === editingTaskId ? (
              <div key={task.id} className="rounded-lg border border-border bg-transparent p-4 ">
                <div className="flex flex-col gap-3">
                  <div className="flex items-end gap-3">
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
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                    >
                      Save
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
                key={task.id}
                task={task}
                onStatusChange={(id, nextStatus) => updateStatus(id, nextStatus)}
                onEdit={() => startEdit(task)}
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
