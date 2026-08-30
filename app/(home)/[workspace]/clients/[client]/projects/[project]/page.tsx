import React from "react";
import { GetProjectDetails, getTaskCompletionProgress } from "@/lib/actions/project";
import Link from "next/link";
import ProjectTasks from "@/components/project/ProjectTasks";
import { GetTask } from "@/lib/actions/task";
import { GetProjectActivities } from "@/lib/actions/activity";
import { Activity } from "@/types/schema";
import { user } from "@/database/schema/auth-schema";
import { auth } from "@/lib/better-auth/auth"
import { headers } from "next/headers"

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



function progressColor(progress: number) {
  if (progress < 20) return "text-red-500"
  if (progress < 50) return "text-yellow-500"
  return "text-green-500"
}



export default async function Page({ params }: Props) {
    const { workspace, client, project } = await params;
    
    const session = await auth.api.getSession({ headers: await headers() });
    
    const user = session?.user
    
    const res = await GetProjectDetails(project, client);
    const proj = res.success && Array.isArray(res.project) && res.project.length > 0 ? res.project[0] : null;
    const STATUS_OPTIONS: ({
        value: "ACTIVE";
        label: string;
        dot: string;
      } | {
        value: "PLANNING";
        label: string;
        dot: string;
      } | {
        value: "REVIEW";
        label: string;
        dot: string;
      } | {
        value: "CANCELLED";
        label: string;
        dot: string;
      })[] = [
        { value: "ACTIVE", label: "Active", dot: "bg-green-500" },
        { value: "PLANNING", label: "Inactive", dot: "bg-gray-400" },
        { value: "REVIEW", label: "Lead", dot: "bg-yellow-400" },
        { value: "CANCELLED", label: "Archived", dot: "bg-red-500" },
      ]
    
      const statusOption = STATUS_OPTIONS.find(s => s.value === proj?.status)

  if (!proj) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Project not found.</p>
        <Link href={`/${workspace}/clients/${client}/projects`} className="text-blue-600 mt-4 inline-block">Back to projects</Link>
      </div>
    );
  }

      const tasks = await GetTask(project)

      // Derive progress from the tasks we already fetched, rather than
      // the stored proj.progress column, which only updates when
      // syncProjectProgress() happens to be called elsewhere.
      const taskList = tasks.tasks ?? []
      const completedTaskCount = taskList.filter((t) => t.status === "DONE").length
      const progress = await getTaskCompletionProgress(taskList.length, completedTaskCount)

      const response = await GetProjectActivities(proj.id)

      const activities: Activity[] = response.success ? response.activities : []

  return (
    <div className="">
      
      <div className="p-6 flex flex-row justify-between items-center gap-4 border rounded-md">
        <div className="flex gap-2 flex-col">
            
            <span className="text-2xl font-bold mb-2">{proj.name}</span>
            {proj.description ? <p className="text-sm text-muted-foreground">{proj.description}</p> : <p className="text-sm text-muted-foreground">No description available.</p>}
        </div>
        <div className="flex gap-2 flex-col items-end">
          <div className="flex gap-2 items-center">
            <span className={`h-4 w-4 ${statusOption?.dot ?? 'bg-gray-400'} rounded-full`}></span>
            <p>{statusOption?.label ?? proj?.status}</p>
            <div>Priority: <span>{proj?.priority}</span></div>
          </div>
          <span className={progressColor(progress)}>Project progress: {progress}%</span>
          <span>{proj?.dueDate ? new Date(proj.dueDate).toLocaleDateString() : "No due date"}</span>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-2 p-1 mb-2 rounded-md">
        <div>
          <h2 className="text-lg font-semibold mb-2">Project Activities</h2>
          {
            activities.length === 0 ? <span>No Activities</span> :
            <div className="lg:min-h-[50vh] border rounded-md p-4 mt-4 space-y-2">
              {activities.map((act) => (
                <div key={act.id} className="flex flex-col ">
                  <span>{act.message}</span><span className="text-gray-400">{formatOrdinalDate(act.createdAt)}</span>
                </div>
              ))}
            </div>
          }
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Project Tasks</h2>
         <ProjectTasks task={tasks.tasks} projectId={proj.id} clientId={client} userId={user?.id} />
        </div>
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-2">Documents And Others</h2>
        <div className="min-h-50 border rounded-md p-4 mt-4">
        </div>
      </div>
    </div>
  );
}
