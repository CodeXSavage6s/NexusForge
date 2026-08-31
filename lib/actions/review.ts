"use server";

import db from "@/database";
import { reviews } from "@/database/schema/schema";
import { user } from "@/database/schema/auth-schema";
import { eq, desc, sql } from "drizzle-orm";
import { requireSession } from "@/lib/authz";
import type { Review, ReviewActionResult, ReviewStats, ReviewWithAuthor } from "@/types/review";

const MIN_COMMENT_LENGTH = 3;
const MAX_COMMENT_LENGTH = 1000;

function validateReviewInput(rating: number, comment: string): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    fieldErrors.rating = "Choose a rating from 1 to 5 stars.";
  }

  const trimmed = comment?.trim() ?? "";
  if (trimmed.length < MIN_COMMENT_LENGTH) {
    fieldErrors.comment = "Tell us a bit more — a few words at least.";
  } else if (trimmed.length > MAX_COMMENT_LENGTH) {
    fieldErrors.comment = `Keep it under ${MAX_COMMENT_LENGTH} characters.`;
  }

  return fieldErrors;
}

/** Creates the signed-in user's review, or updates it if they already left one. */
export async function CreateOrUpdateReview(input: {
  rating: number;
  comment: string;
}): Promise<ReviewActionResult> {
  try {
    const session = await requireSession();

    const fieldErrors = validateReviewInput(input.rating, input.comment);
    if (Object.keys(fieldErrors).length > 0) {
      return { success: false, error: "Please fix the errors below.", fieldErrors };
    }

    const comment = input.comment.trim();

    const [existing] = await db
      .select({ id: reviews.id })
      .from(reviews)
      .where(eq(reviews.userId, session.user.id));

    const [saved] = existing
      ? await db
          .update(reviews)
          .set({ rating: input.rating, comment, updatedAt: new Date() })
          .where(eq(reviews.userId, session.user.id))
          .returning()
      : await db
          .insert(reviews)
          .values({ userId: session.user.id, rating: input.rating, comment })
          .returning();

    return { success: true, review: saved };
  } catch (err) {
    console.error("Failed to save review:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save your review.",
    };
  }
}

/** Removes the signed-in user's own review. */
export async function DeleteReview(): Promise<ReviewActionResult> {
  try {
    const session = await requireSession();

    await db.delete(reviews).where(eq(reviews.userId, session.user.id));

    return { success: true };
  } catch (err) {
    console.error("Failed to delete review:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete your review.",
    };
  }
}

/** The signed-in user's own review, if they've left one — used to pre-fill the form. */
export async function GetMyReview(): Promise<Review | null> {
  try {
    const session = await requireSession();

    const [existing] = await db
      .select()
      .from(reviews)
      .where(eq(reviews.userId, session.user.id));

    return existing ?? null;
  } catch {
    return null;
  }
}

/** Public — every review, newest first, with the author's display name/avatar. */
export async function GetReviews(): Promise<ReviewWithAuthor[]> {
  const rows = await db
    .select({
      id: reviews.id,
      userId: reviews.userId,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
      updatedAt: reviews.updatedAt,
      authorName: user.name,
      authorImage: user.image,
    })
    .from(reviews)
    .innerJoin(user, eq(reviews.userId, user.id))
    .orderBy(desc(reviews.createdAt));

  return rows.map((row) => ({
    id: row.id,
    userId: row.userId,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    author: { name: row.authorName, image: row.authorImage },
  }));
}

/** Public — average rating + total count, e.g. for a landing page summary. */
export async function GetReviewStats(): Promise<ReviewStats> {
  const [row] = await db
    .select({
      count: sql<number>`count(*)`.mapWith(Number),
      average: sql<number>`coalesce(avg(${reviews.rating}), 0)`.mapWith(Number),
    })
    .from(reviews);

  return {
    count: row?.count ?? 0,
    average: row ? Math.round(row.average * 10) / 10 : 0,
  };
}
