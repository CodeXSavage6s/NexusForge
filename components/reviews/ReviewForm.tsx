"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import StarRatingInput from "@/components/reviews/StarRatingInput";
import { CreateOrUpdateReview, DeleteReview } from "@/lib/actions/review";
import type { Review } from "@/types/review";

export default function ReviewForm({ existingReview }: { existingReview: Review | null }) {
  const router = useRouter();
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    const result = await CreateOrUpdateReview({ rating, comment });
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error ?? "Failed to save your review.");
      setFieldErrors(result.fieldErrors ?? {});
      return;
    }

    toast.success(existingReview ? "Review updated." : "Thanks for the review!");
    router.refresh();
  }

  async function handleDelete() {
    const confirmed = window.confirm("Delete your review? This can't be undone.");
    if (!confirmed) return;

    setIsDeleting(true);
    const result = await DeleteReview();
    setIsDeleting(false);

    if (!result.success) {
      toast.error(result.error ?? "Failed to delete your review.");
      return;
    }

    setRating(0);
    setComment("");
    toast.success("Review deleted.");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
    >
      <h2 className="text-sm font-semibold">
        {existingReview ? "Edit your review" : "Share your thoughts"}
      </h2>

      <StarRatingInput value={rating} onChange={setRating} />
      {fieldErrors.rating ? <p className="text-sm text-destructive">{fieldErrors.rating}</p> : null}

      <Textarea
        placeholder="What's your experience with NexusForge been like?"
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        aria-invalid={!!fieldErrors.comment}
      />
      {fieldErrors.comment ? (
        <p className="text-sm text-destructive">{fieldErrors.comment}</p>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex justify-end gap-2">
        {existingReview ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleDelete}
            disabled={isDeleting || isSubmitting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        ) : null}
        <Button type="submit" className="blue-btn" disabled={isSubmitting || isDeleting}>
          {isSubmitting ? "Saving..." : existingReview ? "Save Changes" : "Post Review"}
        </Button>
      </div>
    </form>
  );
}
