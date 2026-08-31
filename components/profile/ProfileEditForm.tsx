"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateProfile } from "@/lib/actions/profile";
import { cn } from "@/lib/utils";

type Props = {
  name: string;
  image: string | null;
  email: string;
};

const NAME_MAX_LENGTH = 80;
const URL_RE = /^https?:\/\/.+/i;

export default function ProfileEditForm({ name, image, email }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    name,
    image: image ?? "",
  });

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; image?: string }>({});
  const [imageFailedToLoad, setImageFailedToLoad] = useState(false);

  const initials = useMemo(
    () =>
      form.name
        ?.trim()
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase(),
    [form.name]
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const trimmedName = form.name.trim();
    const trimmedImage = form.image.trim();
    const nextFieldErrors: { name?: string; image?: string } = {};

    if (!trimmedName) {
      nextFieldErrors.name = "Name is required.";
    } else if (trimmedName.length > NAME_MAX_LENGTH) {
      nextFieldErrors.name = `Keep it under ${NAME_MAX_LENGTH} characters.`;
    }

    if (trimmedImage && !URL_RE.test(trimmedImage)) {
      nextFieldErrors.image = "Enter a full image URL starting with http:// or https://";
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    setFieldErrors({});

    startTransition(async () => {
      const result = await updateProfile({ name: trimmedName, image: trimmedImage });

      if (!result.success) {
        setError(result.error);
        toast.error(result.error);
        return;
      }

      toast.success("Profile updated.");
      router.push("/settings/profile");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-2xl space-y-5 p-3">
      <div>
        <div className="flex items-center gap-3">
          <Link
            href="/settings/profile"
            aria-label="Back to Profile"
            className="rounded-lg p-2 hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold italic">Edit Profile</h1>
        </div>
        <p className="text-sm text-muted-foreground">Update your personal information.</p>
      </div>

      <section className="rounded-2xl border bg-card p-5">
        <h2 className="text-xl font-semibold">Profile information</h2>

        <div className="mt-5 space-y-5">
          <div className="flex items-center gap-4">
            <Avatar size="lg" className="h-16 w-16">
              {form.image.trim() ? (
                <AvatarImage
                  src={form.image.trim()}
                  alt={form.name || "Profile picture"}
                  onLoadingStatusChange={(status) =>
                    setImageFailedToLoad(status === "error")
                  }
                />
              ) : null}
              <AvatarFallback className="text-lg">{initials || "?"}</AvatarFallback>
            </Avatar>
            {form.image.trim() && imageFailedToLoad ? (
              <p className="text-xs text-destructive">
                Couldn&apos;t load that image — double-check the URL.
              </p>
            ) : null}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label htmlFor="name">Name</Label>
              <span className="text-xs text-muted-foreground">
                {form.name.length}/{NAME_MAX_LENGTH}
              </span>
            </div>
            <Input
              id="name"
              value={form.name}
              onChange={(e) =>
                setForm((current) => ({ ...current, name: e.target.value }))
              }
              maxLength={NAME_MAX_LENGTH}
              required
              disabled={isPending}
              aria-invalid={!!fieldErrors.name}
            />
            {fieldErrors.name ? (
              <p className="mt-1.5 text-sm text-destructive">{fieldErrors.name}</p>
            ) : null}
          </div>

          <div>
            <Label htmlFor="image" className="mb-2 block">
              Profile image URL
            </Label>
            <Input
              id="image"
              type="url"
              value={form.image}
              onChange={(e) => {
                setImageFailedToLoad(false);
                setForm((current) => ({ ...current, image: e.target.value }));
              }}
              placeholder="https://example.com/avatar.png"
              disabled={isPending}
              aria-invalid={!!fieldErrors.image}
            />
            {fieldErrors.image ? (
              <p className="mt-1.5 text-sm text-destructive">{fieldErrors.image}</p>
            ) : (
              <p className="mt-1.5 text-xs text-muted-foreground">
                Paste a link to an image — we&apos;ll show a preview above.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-5">
        <h2 className="text-xl font-semibold">Email</h2>
        <p className="mt-2 break-all text-muted-foreground">{email}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Your email is managed through account settings.
        </p>
      </section>

      {error && (
        <p
          role="alert"
          aria-live="polite"
          className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <Button
          asChild
          variant="outline"
          className={cn(isPending && "pointer-events-none opacity-50")}
        >
          <Link
            href="/settings/profile"
            aria-disabled={isPending}
            tabIndex={isPending ? -1 : undefined}
            onClick={(e) => isPending && e.preventDefault()}
          >
            Cancel
          </Link>
        </Button>

        <Button type="submit" disabled={isPending}>
          <Save className="h-4 w-4" />
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
