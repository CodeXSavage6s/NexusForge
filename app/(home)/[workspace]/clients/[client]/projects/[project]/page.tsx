import React from "react";
import { GetProjectDetails, getTaskCompletionProgress } from "@/lib/actions/project";
import { GetProjectDocuments } from "@/lib/actions/document";
import { GetActiveTimeEntry, GetProjectTimeEntries } from "@/lib/actions/time-entry";
import Link from "next/link";
import { ArrowLeft, Calendar, AlertCircle } from "lucide-react";
import ProjectTasks from "@/components/project/ProjectTasks";
import ProjectDocuments from "@/components/project/ProjectDocuments";
import ProjectTimeTracker from "@/components/project/ProjectTimeTracker";
import { GetTask } from "@/lib/actions/task";
import { GetProjectActivities } from "@/lib/actions/activity";
import { getWorkspace } from "@/lib/actions/workspace";
import { Activity } from "@/types/schema";
import { auth } from "@/lib/better-auth/auth"
import { headers } from "next/headers"
import { redirect, notFound } from "next/navigation";
import { PROJECT_STATUS_OPTIONS, PROJECT_PRIORITY_STYLES } from "@/lib/constants/client-constants";

type Props = {
  params: Promise<{
    workspace: string;
    client: string;
    project: string;
  }>;
};

function formatOrdinalDate(date: Date) {
  const day = date.getDate()
  const suffix =
    day % 10 === 1 && day !== 11 ? "st" :
    day % 10 === 2 && day !== 12 ? "nd" :
    day % 10 === 3 && day !== 13 ? "rd" : "th"
  const month = date.toLocaleDateString("en-US", { month: "long" })
  const year = date.getFullYear()
  return `${day}${suffix}, ${month} ${year}`
}

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
}

function progressColor(progress: number) {
  if (progress < 20) return "text-red-500"
  if (progress < 50) return "text-yellow-500"
  return "text-green-500"
}

export default async function Page({ params }: Props) {
  const { workspace: workspaceSlug, client, project: projectId } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");
  const userId = session.user.id;

  const workspace = await getWorkspace(workspaceSlug, userId);
  if (!workspace) notFound();

  const res = await GetProjectDetails(projectId, client, workspace.id);
  const proj = res.success ? res.project : null;

  if (!proj) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Project not found.</p>
        <Link href={`/${workspaceSlug}/clients/${client}/projects`} className="text-blue-600 mt-4 inline-block">
          Back to projects
        </Link>
      </div>
    );
  }

  const statusOption = PROJECT_STATUS_OPTIONS.find((s) => s.value === proj.status);
  const isProjectOverdue =
    proj.status !== "COMPLETED" &&
    proj.status !== "CANCELLED" &&
    !!proj.dueDate &&
    new Date(proj.dueDate).getTime() < Date.now();

  const [taskRes, activityRes, documentsRes, activeTimerRes, timeEntriesRes] = await Promise.all([
    GetTask(workspace.id, proj.id),
    GetProjectActivities(proj.id),
    GetProjectDocuments(workspace.id, proj.id),
    GetActiveTimeEntry(workspace.id, proj.id, userId),
    GetProjectTimeEntries(workspace.id, proj.id),
  ]);

  const taskList = taskRes.tasks ?? [];
  const completedTaskCount = taskList.filter((t) => t.status === "DONE").length;
  const progress = await getTaskCompletionProgress(taskList.length, completedTaskCount);
  const activities: Activity[] = activityRes.success ? activityRes.activities : [];

  return (
    <div className="space-y-4 ">
      <Link
        href={`/${workspaceSlug}/clients/${client}`}
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to client
      </Link>

      <div className="flex flex-col gap-4  p-4 sm:p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div className="flex flex-col gap-1">
            <span className="text-xl font-bold sm:text-2xl">{proj.name}</span>
            <p className="text-sm text-muted-foreground">
              {proj.description || "No description available."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${statusOption?.dot ?? "bg-gray-400"}`} />
              <span className="text-sm font-medium">{statusOption?.label ?? proj.status}</span>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${PROJECT_PRIORITY_STYLES[proj.priority]}`}
            >
              {proj.priority}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-border pt-3 text-sm sm:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Progress</p>
            <p className={`font-medium ${progressColor(progress)}`}>
              {completedTaskCount} of {taskList.length} tasks · {progress}%
            </p>
          </div>
          {proj.budget != null ? (
            <div>
              <p className="text-xs text-muted-foreground">Budget</p>
              <p className="font-medium">{formatMoney(Number(proj.budget), proj.currency || "USD")}</p>
            </div>
          ) : null}
          {proj.startDate ? (
            <div>
              <p className="text-xs text-muted-foreground">Start Date</p>
              <p className="font-medium">{formatOrdinalDate(new Date(proj.startDate))}</p>
            </div>
          ) : null}
          <div>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" /> Due Date
            </p>
            <p className={`flex items-center gap-1 font-medium ${isProjectOverdue ? "text-destructive" : ""}`}>
              {isProjectOverdue ? <AlertCircle className="h-3.5 w-3.5" /> : null}
              {proj.dueDate ? formatOrdinalDate(new Date(proj.dueDate)) : "No due date"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <h2 className="mb-2 text-lg font-semibold">Project Tasks</h2>
          <ProjectTasks
            task={taskList}
            workspaceId={workspace.id}
            projectId={proj.id}
            clientId={client}
            userId={userId}
          />
        </div>
        <div>
          <h2 className="mb-2 text-lg font-semibold">Project Activity</h2>
          {activities.length === 0 ? (
            <div className="rounded-md border p-4 text-sm text-muted-foreground">No activity yet.</div>
          ) : (
            <div className="space-y-2 rounded-md border p-4 lg:min-h-[20vh]">
              {activities.map((act) => (
                <div key={act.id} className="flex flex-col">
                  <span className="text-sm">{act.message}</span>
                  <span className="text-xs text-muted-foreground">{formatOrdinalDate(act.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-lg font-semibold">Time Tracking</h2>
        <ProjectTimeTracker
          workspaceId={workspace.id}
          projectId={proj.id}
          userId={userId}
          initialActiveEntry={activeTimerRes}
          initialEntries={timeEntriesRes.entries}
          initialTotalSeconds={timeEntriesRes.totalSeconds}
        />
      </div>

      <div>
        <h2 className="mb-2 text-lg font-semibold">Notes &amp; Documents</h2>
        <ProjectDocuments
          workspaceId={workspace.id}
          projectId={proj.id}
          userId={userId}
          initialDocuments={documentsRes.documents}
        />
      </div>
    </div>
  );
}
