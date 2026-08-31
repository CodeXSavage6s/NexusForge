import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StarRatingDisplay({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md";
}) {
  const dimension = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={cn(
            dimension,
            value <= rating ? "fill-blue-500 text-blue-500" : "fill-none text-muted-foreground"
          )}
        />
      ))}
    </div>
  );
}
