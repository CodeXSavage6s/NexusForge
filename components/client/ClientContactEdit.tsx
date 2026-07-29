"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { UpdateClient } from '@/lib/actions/client'

export interface ClientContactInfo {
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
}

interface ClientContactEditProps {
  client: ClientContactInfo;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ClientContactEdit({
  client
}) {
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
