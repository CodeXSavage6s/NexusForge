"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { UpdateClient } from '@/lib/actions/client'
import type { Client } from "@/types/client";

interface ClientContactEditProps {
  client: Client;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ClientContactEdit({
  client
}: ClientContactEditProps) {
  const [data, setData] = useState<Client>(client);
  const [form, setForm] = useState<Client>(client);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDirty = JSON.stringify(form) !== JSON.stringify(data);


  const handleSave = async () => {
    console.log("Save hit", form)
    
    setSaving(true);

    try {
      console.log("Save hit 2", form)
      const response = await UpdateClient({
        id: form.id,
        workspaceId: form.workspaceId,
        email: form.email ?? undefined,
        phone: form.phone ?? undefined,
        website: form.website ?? undefined,
        address: form.address ?? undefined,
      })
      console.log("Response", response)
      
    } catch {
      setError("Couldn't save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-3 editContainer">
      <div className="flex items-center justify-between">
        <label className="editLabel">Contact</label>

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
          <label className="editLabel">Phone</label>

          <input
            type="tel"
            value={form.phone ?? ""}
            onChange={(e) => {
              setForm((prev) => ({
                ...prev,
                phone: e.target.value
              }))
            }}
            placeholder="Phone number"
            className="editInput"
          />
        </div>

        <div>
          <label className="editLabel">Email</label>

          <input
            type="email"
            value={form.email ?? ""}
            onChange={(e) => {
              setForm((prev) => ({
                ...prev,
                email: e.target.value
              }))
            }}
            placeholder="Email address"
            className="editInput"
          />
        </div>

        <div>
          <label className="editLabel">Website</label>

          <input
            type="url"
            value={form.website ?? ""}
            onChange={(e) => {
              setForm((prev) => ({
                ...prev,
                website: e.target.value
              }))
            }}
            placeholder="Website"
            className="editInput"
          />
        </div>

        <div>
          <label className="editLabel">Address</label>

          <input
            type="text"
            value={form.address ?? ""}
            onChange={(e) => {
              setForm((prev) => ({
                ...prev,
                address: e.target.value
              }))
            }}
            placeholder="Address"
            className="editInput"
          />
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
