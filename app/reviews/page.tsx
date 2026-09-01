import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/theme-toggle";
import StarRatingDisplay from "@/components/reviews/StarRatingDisplay";
import ReviewForm from "@/components/reviews/ReviewForm";
import ReviewCard from "@/components/reviews/ReviewCard";
import { GetReviews, GetReviewStats, GetMyReview } from "@/lib/actions/review";

export const metadata = {
  title: "Reviews — NexusForge",
  description: "See what freelancers are saying about NexusForge.",
};

export default async function ReviewsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  const [reviews, stats, myReview] = await Promise.all([
    GetReviews(),
    GetReviewStats(),
    session?.user ? GetMyReview() : Promise.resolve(null),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="header flex items-center justify-between border-b px-4 py-3">
        <Link href="/home" className="flex items-center">
          <Image src="/assets/logo.svg" width={200} height={250} alt="NexusForge" />
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {!session?.user ? (
            <Button asChild>
              <Link href="/sign-in">
                Sign In
              </Link>
            </Button>
          ) : null}
        </div>
      </header>

      <section className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
        <div className="text-center">
          <h1 className="h1">
            What freelancers are <span className="text-blue-500">saying</span>
          </h1>

          {stats.count > 0 ? (
            <div className="mt-3 flex flex-col items-center gap-1">
              <StarRatingDisplay rating={Math.round(stats.average)} size="md" />
              <p className="text-sm text-gray-500">
                {stats.average.toFixed(1)} out of 5 · {stats.count} review{stats.count === 1 ? "" : "s"}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-gray-500">
              No reviews yet — be the first to share your thoughts.
            </p>
          )}
        </div>

        <div className="mt-8">
          {session?.user ? (
            <ReviewForm existingReview={myReview} />
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-6 text-center">
              <p className="text-sm text-muted-foreground">Sign in to leave a review.</p>
              <Link href="/sign-in">
                <Button className="blue-btn btn-press">Sign In</Button>
              </Link>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-4">
          {reviews.length === 0 ? null : reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </section>
    </div>
  );
}
