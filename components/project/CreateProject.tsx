"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { CreateProject } from "@/lib/actions/project";
import { PROJECT_PRIORITY, PROJECT_STATUS } from "@/lib/constants/client-constants";

type CreateProjectDialogProps = {
  clientId: string;
  clientName: string;
  workspaceId?: string;
  trigger?: React.ReactElement;
  onSubmit?: () => void;
  children?: React.ReactElement;
};

type ProjectFormData = {
  name: string;
  description: string;
  status: PROJECT_STATUS;
  priority: PROJECT_PRIORITY;
  budget: number;
  currency: string;
  dueDate: string;
  startDate: string;
};

const initialData: ProjectFormData = {
  name: "",
  description: "",
  status: "ACTIVE",
  priority: "MEDIUM",
  budget: 0,
  currency: "USD",
  dueDate: "",
  startDate: "",
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function CreateProjectDialog({
  clientId,
  clientName,
  workspaceId,
  trigger,
  onSubmit,
  children,
}: CreateProjectDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setForm(initialData);
    setError(null);
  };

  const handleSubmit = async () => {
    const name = form.name.trim();
    if (!name) {
      setError("Project name is required.");
      return;
    }

    const slug = slugify(name);
    if (!slug) {
      setError("Project name must contain letters or numbers.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        clientId,
        workspaceId,
        name,
        slug,
        description: form.description || undefined,
        status: form.status,
        priority: form.priority,
        budget: form.budget || undefined,
        currency: form.currency,
        dueDate: form.dueDate ? new Date(form.dueDate) : undefined,
        startDate: form.startDate ? new Date(form.startDate) : undefined,
      };

      const result = await CreateProject(payload);

      if (!result?.success) {
        const message = result?.message ?? "Failed to create project.";
        setError(typeof message === "string" ? message : "Failed to create project.");
        return;
        console.log("CreateProjectDialog error:", result?.error);
      }

      console.log("Project created successfully:", result.project);
      resetForm();
      setOpen(false);
      if (onSubmit) onSubmit();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project.");
      console.error("CreateProjectDialog error:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) resetForm();
      }}
    >
      {children ?? trigger ? (
        <DialogTrigger asChild>
          {children ?? trigger}
        </DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-106.25 w-full">
        <DialogHeader>
          <DialogTitle>Create project</DialogTitle>
          <DialogDescription>
            Add a new project for this client.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="client">Client</Label>
            <Input id="client" value={clientName} disabled className="text-muted-foreground" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">Project name</Label>
            <Input
              id="name"
              placeholder="Website redesign"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              autoFocus
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What's this project about?"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    priority: value as PROJECT_PRIORITY,
                  }))
                }
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due date</Label>
              <Input
                id="dueDate"
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
          </div>
        </div>
        {error ? <p className="text-sm text-red-500">{error}</p> : null}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!form.name.trim() || isSubmitting}>
            {isSubmitting ? "Creating..." : "Create project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
