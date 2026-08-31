"use client"

import { Trash2 } from "lucide-react";
import { DeleteProject } from "@/lib/actions/project";

export default function DeleteBtn({ projectId }: { projectId: string }) {
    function handleDeleteProject(projectId: string) {
        const confirmed = window.confirm("Are you sure you want to delete this project? This action cannot be undone.");
        if (confirmed) {
            DeleteProject(projectId);
        }
    }
  return (
    <button
      onClick={(e) => {e.stopPropagation(); handleDeleteProject(projectId)}}
      className="flex items-center gap-1 text-red-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
    >
      <Trash2 className="h-4 w-4" />
      <span className="text-sm">Delete</span>
    </button>
  );
}