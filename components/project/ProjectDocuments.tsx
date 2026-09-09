"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { FileText, Plus, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreateDocument, UpdateDocument, DeleteDocument } from "@/lib/actions/document";

interface DocumentItem {
  id: string;
  title: string;
  content: string;
  updatedAt: Date | string;
}

function formatUpdated(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ProjectDocuments({
  workspaceId,
  projectId,
  userId,
  initialDocuments,
}: {
  workspaceId: string;
  projectId: string;
  userId: string;
  initialDocuments: DocumentItem[];
}) {
  const router = useRouter();
  const [documents, setDocuments] = useState(initialDocuments);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const selected = documents.find((d) => d.id === selectedId) ?? null;

  function startCreate() {
    setSelectedId(null);
    setIsCreating(true);
    setIsEditing(false);
    setTitle("");
    setContent("");
  }

  function startEdit(doc: DocumentItem) {
    setSelectedId(doc.id);
    setIsCreating(false);
    setIsEditing(true);
    setTitle(doc.title);
    setContent(doc.content);
  }

  function cancelEditing() {
    setIsCreating(false);
    setIsEditing(false);
  }

  async function handleSave() {
    if (!title.trim()) {
      toast.error("Title is required.");
      return;
    }

    setIsSaving(true);
    if (isCreating) {
      const result = await CreateDocument(workspaceId, projectId, userId, { title, content });
      setIsSaving(false);
      if (!result.success || !result.document) {
        toast.error(result.error ?? "Failed to create note.");
        return;
      }
      setDocuments((prev) => [
        { id: result.document!.id, title: result.document!.title, content: result.document!.content, updatedAt: result.document!.updatedAt },
        ...prev,
      ]);
      setSelectedId(result.document.id);
      setIsCreating(false);
      toast.success("Note created.");
    } else if (isEditing && selectedId) {
      const result = await UpdateDocument(workspaceId, selectedId, userId, { title, content });
      setIsSaving(false);
      if (!result.success || !result.document) {
        toast.error(result.error ?? "Failed to save note.");
        return;
      }
      setDocuments((prev) =>
        prev.map((d) => (d.id === selectedId ? { ...d, title, content, updatedAt: result.document!.updatedAt } : d))
      );
      setIsEditing(false);
      toast.success("Note saved.");
    }
    router.refresh();
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Delete this note? This can't be undone.");
    if (!confirmed) return;

    const result = await DeleteDocument(workspaceId, id);
    if (!result.success) {
      toast.error(result.error ?? "Failed to delete note.");
      return;
    }
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    if (selectedId === id) setSelectedId(null);
    toast.success("Note deleted.");
    router.refresh();
  }

  const isComposing = isCreating || isEditing;

  return (
    <div className="rounded-md border">
      {isComposing ? (
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title"
              className="max-w-sm"
            />
            <Button type="button" variant="ghost" size="icon" onClick={cancelEditing}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write in Markdown..."
            className="min-h-40 w-full resize-y rounded-md border border-border bg-background p-3 text-sm outline-none"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={cancelEditing}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save note"}
            </Button>
          </div>
        </div>
      ) : selected ? (
        <div className="p-4">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold">{selected.title}</h3>
              <p className="text-xs text-muted-foreground">
                Updated {formatUpdated(selected.updatedAt)}
              </p>
            </div>
            <div className="flex gap-1">
              <Button type="button" variant="ghost" size="icon" onClick={() => startEdit(selected)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(selected.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
              <Button type="button" variant="ghost" size="icon" onClick={() => setSelectedId(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {selected.content ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{selected.content}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">This note is empty.</p>
          )}
        </div>
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center gap-2 p-8 text-center">
          <FileText className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm font-medium">No notes yet</p>
          <p className="max-w-xs text-xs text-muted-foreground">
            Use notes to keep project briefs, meeting notes, or anything else worth remembering —
            written in Markdown.
          </p>
          <Button type="button" size="sm" onClick={startCreate} className="mt-2">
            <Plus className="mr-1.5 h-4 w-4" />
            New note
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-border">
          <div className="flex justify-end p-2">
            <Button type="button" size="sm" variant="outline" onClick={startCreate}>
              <Plus className="mr-1.5 h-4 w-4" />
              New note
            </Button>
          </div>
          {documents.map((doc) => (
            <button
              key={doc.id}
              type="button"
              onClick={() => setSelectedId(doc.id)}
              className="flex w-full items-center justify-between gap-2 p-3 text-left text-sm hover:bg-muted/50"
            >
              <span className="flex items-center gap-2 truncate">
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate font-medium">{doc.title}</span>
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatUpdated(doc.updatedAt)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
