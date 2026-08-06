import React from "react";
import { GetProjectDetails } from "@/lib/actions/project";
import Link from "next/link";
import ProjectTasks from "@/components/project/ProjectTasks";
import { GetTask } from "@/lib/actions/task";

type Props = {
  params: Promise<{
    workspace: string;
    client: string;
    project: string;
  }>;
};



export default async function Page({ params }: Props) {
    const { workspace, client, project } = await params;
    
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
      <div className="mt-6">
         <ProjectTasks task={tasks.tasks} projectId={proj.id} />
      </div>
    </div>
  );
}
