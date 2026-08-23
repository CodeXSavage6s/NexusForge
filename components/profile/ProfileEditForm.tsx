"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

import { updateProfile } from "@/lib/actions/profile";

type Props = {
  name: string;
  image: string | null;
  email: string;
};

export default function ProfileEditForm({
  name,
  image,
  email,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    name,
    image: image ?? "",
  });

  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    startTransition(async () => {
      const result = await updateProfile(form);

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.push("/settings/profile");
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-2xl space-y-5 p-3"
    >
      <div className="flex items-center gap-3">
        <Link
          href="/settings/profile"
          className="rounded-lg p-2 hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <div>
          <h1 className="text-2xl font-bold italic">
            Edit Profile
          </h1>

          <p className="text-sm text-muted-foreground">
            Update your personal information.
          </p>
        </div>
      </div>

      <section className="rounded-2xl border bg-card p-5">
        <h2 className="text-xl font-semibold">Profile information</h2>

        <div className="mt-5 space-y-5">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium"
            >
              Name
            </label>

            <input
              id="name"
              value={form.name}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  name: e.target.value,
                }))
              }
              maxLength={80}
              required
              className="w-full rounded-xl border bg-background px-4 py-3 outline-none focus:ring-2"
            />
          </div>

          <div>
            <label
              htmlFor="image"
              className="mb-2 block text-sm font-medium"
            >
              Profile image URL
            </label>

            <input
              id="image"
              type="url"
              value={form.image}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  image: e.target.value,
                }))
              }
              placeholder="https://example.com/avatar.png"
              className="w-full rounded-xl border bg-background px-4 py-3 outline-none focus:ring-2"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-5">
        <h2 className="text-xl font-semibold">Email</h2>

        <p className="mt-2 break-all text-muted-foreground">
          {email}
        </p>

        <p className="mt-2 text-sm text-muted-foreground">
          Your email is managed through account settings.
        </p>
      </section>

      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <Link
          href="/settings/profile"
          className="rounded-xl border px-4 py-2.5 font-medium hover:bg-muted"
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-semibold text-primary-foreground disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}