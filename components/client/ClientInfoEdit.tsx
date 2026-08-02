"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UpdateClient } from '@/lib/actions/client'
import { Client } from "@/types/client";

export type ClientStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "LEAD"
  | "ARCHIVED";


const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active", dot: "bg-green-500" },
  { value: "INACTIVE", label: "Inactive", dot: "bg-gray-500" },
  { value: "LEAD", label: "Lead", dot: "bg-yellow-500" },
  { value: "ARCHIVED", label: "Archived", dot: "bg-red-500" },
] satisfies {
  value: ClientStatus;
  label: string;
  dot: string;
}[];

export default function ClientInfoEdit({
  client,
}: Client) {
  const [data, setData] = useState(client);
  const [form, setForm] = useState(client);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDirty = JSON.stringify(form) !== JSON.stringify(data);


  const handleSave = async () => {
    console.log("Save hit", form)

    setSaving(true);

    try {
      console.log("Save hit 2", form)
      const response = await UpdateClient(form)
      console.log("Response", response)
      
      //setData(form);
    } catch {
      setError("Couldn't save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-3 editContainer">
      <div className="flex items-start justify-between gap-3">
        <label className="editLabel">Name: </label>
        <input
          value={form.name}
          onChange={(e) => {
              setForm((prev) => ({
                ...prev,
                name: e.target.value
              }))
            }}
          placeholder="Client name"
          className="text-lg editInput"
        />

        {isDirty && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1 text-xs text-indigo-400"
          >
            <Check className="h-3.5 w-3.5" />
            {saving ? "Saving..." : "Save"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="editLabel">Company</label>

          <input
            value={form.companyName ?? ""}
            onChange={(e) => {
              setForm((prev) => ({
                ...prev,
                companyName: e.target.value
              }))
            }}
            className="editInput"
          />
        </div>

        <div>
          <label className="editLabel">Industry</label>

          <input
            value={form.industry ?? ""}
            onChange={(e) => {
              setForm((prev) => ({
                ...prev,
                industry: e.target.value
              }))
            }}
            className="editInput"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <label className="editLabel">Status</label>

        <Select
          value={form.status}
          onValueChange={(e) => {
              setForm((prev) => ({
                ...prev,
                status: e
              }))
            }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            {STATUS_OPTIONS.map((status) => (
              <SelectItem
                key={status.value}
                value={status.value}
              >
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}