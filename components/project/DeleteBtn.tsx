"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { DeleteProject } from "@/lib/actions/project";

export default function DeleteBtn({
  projectId,
  workspaceId,
  clientId,
}: {
  projectId: string;
  workspaceId: string;
  clientId: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDeleteProject() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project? This action cannot be undone."
    );
    if (!confirmed) return;

    setIsDeleting(true);
    const result = await DeleteProject(projectId, workspaceId, clientId);
    setIsDeleting(false);

    if (!result.success) {
      toast.error(result.error ?? "Failed to delete project.");
      return;
    }

    toast.success("Project deleted.");
    router.refresh();
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleDeleteProject();
      }}
      disabled={isDeleting}
      className="flex items-center gap-1 text-red-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" />
      <span className="text-sm">{isDeleting ? "Deleting..." : "Delete"}</span>
    </button>
  );
}
