import StarRatingDisplay from "@/components/reviews/StarRatingDisplay";
import type { ReviewWithAuthor } from "@/types/review";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join("");
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function ReviewCard({ review }: { review: ReviewWithAuthor }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {review.author.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={review.author.image}
              alt={review.author.name}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-semibold">
              {getInitials(review.author.name)}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold">{review.author.name}</p>
            <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
          </div>
        </div>
        <StarRatingDisplay rating={review.rating} />
      </div>

      <p className="whitespace-pre-wrap text-sm text-muted-foreground">{review.comment}</p>
    </div>
  );
}
