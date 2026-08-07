import React from "react";
import { GetProjectDetails } from "@/lib/actions/project";
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

      const tasks = await GetTask(project)

      const response = await (await GetProjectActivities(proj?.id))

      const activities: Activity[] = response.activities

  if (!proj) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Project not found.</p>
        <Link href={`/${workspace}/clients/${client}/projects`} className="text-blue-600 mt-4 inline-block">Back to projects</Link>
      </div>
    );
  }

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
          <span>Project progress: {proj?.progress ?? 0}%</span>
          <span>{proj?.dueDate ? new Date(proj.dueDate).toLocaleDateString() : "No due date"}</span>
        </div>
      </div>
      <div className="grid lg:grid-cols-2 gap-2 p-4 mb-2 border rounded-md">
        <div>
          <h2 className="text-lg font-semibold mb-2">Project Activities</h2>
          {
            !activities ? <span>No Activities</span> :
            <div className="lg:min-h-[50vh] border rounded-md p-4 mt-4 space-y-2">
              {activities.map((act) => (
                <div key={act.id} className="flex justify-between">
                  <span>{act.message}</span><span>{act.createdAt.toLocaleDateString()}</span>
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
