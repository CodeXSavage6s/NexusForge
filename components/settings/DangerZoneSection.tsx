"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteAccount } from "@/lib/actions/auth";

export default function DangerZoneSection({ userEmail }: { userEmail: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const canDelete = confirmText.trim().toLowerCase() === userEmail.toLowerCase();

  const handleDelete = async () => {
    if (!canDelete || pending) return;

    setPending(true);
    setError("");

    try {
      const response = await deleteAccount();
      if (!response.success) {
        setError(response.error ?? "Failed to delete account.");
        toast.error(response.error ?? "Failed to delete account.");
        return;
      }

      toast.success("Account deleted.");
      router.push("/sign-in");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-3">
      <div>
        <h4 className="font-semibold text-destructive">Danger zone</h4>
        <p className="text-sm text-muted-foreground">
          Permanently delete your account. This can&apos;t be undone.
        </p>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive">Delete account</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              This permanently deletes your account and sign-in access. Workspaces you own
              are not automatically deleted — remove them first if you want a clean slate.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2 py-2">
            <Label htmlFor="confirm-delete">
              Type <span className="font-semibold">{userEmail}</span> to confirm
            </Label>
            <Input
              id="confirm-delete"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={userEmail}
              autoComplete="off"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <DialogFooter>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={!canDelete || pending}
            >
              {pending ? "Deleting..." : "Permanently delete account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
