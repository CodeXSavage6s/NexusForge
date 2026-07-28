"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button"
import { UpdateClient } from '@/lib/actions/client'

export default function MarkdownEditor({
  initialValue: Client,
}) {
  const [content, setContent] = useState(initialValue);
  const [mode, setMode] = useState<"edit" | "preview">("preview");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    console.log("Save hit", content)

    setSaving(true);

    try {
      console.log("Save hit 2", content)
      const response = await UpdateClient(content)
      console.log("Response", response)
      
    } catch {
      setError("Couldn't save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-3xl rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-card">
        <Button
          type="Button"
          onClick={() => setMode(mode === "edit" ? "preview" : "edit")}
          className="text-sm px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors"
        >
          {mode === "edit" ? "Preview" : "Edit"}
        </Button>

        <Button
          type="Button"
          onClick={handleSave}
          className="text-sm px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      {/* Content area */}
      <div className="min-h-[300px]">
        {mode === "edit" ? (
          <textarea
            value={content.notes}
            onChange={(e) => {
              setContent((prev) => ({
                ...prev,
                notes: e.target.value
              }))
            }}
            placeholder="Write details on client..."
            className="w-full h-[300px] p-4 text-sm resize-none outline-none markdown text-400"
          />
        ) : (
          <div className="prose prose-sm max-w-none p-4">
            <ReactMarkdown>{content.notes}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
