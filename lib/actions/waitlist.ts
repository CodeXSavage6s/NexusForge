"use server";

import db from "@/database";
import { waitlistEntries } from "@/database/schema/schema";
import { eq, count } from "drizzle-orm";
import { sendWaitlistConfirmationEmail } from "@/lib/actions/mails";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface JoinWaitlistState {
  success: boolean;
  error?: string;
  alreadyOnList?: boolean;
}

export async function JoinWaitlist(input: {
  email: string;
  name?: string;
  source?: string;
}): Promise<JoinWaitlistState> {
  try {
    const email = input.email?.trim().toLowerCase();
    const name = input.name?.trim() || undefined;

    if (!email || !EMAIL_RE.test(email)) {
      return { success: false, error: "Enter a valid email address." };
    }

    const [existing] = await db
      .select({ id: waitlistEntries.id })
      .from(waitlistEntries)
      .where(eq(waitlistEntries.email, email));

    if (existing) {
      return { success: true, alreadyOnList: true };
    }

    await db.insert(waitlistEntries).values({
      email,
      name: name ?? null,
      source: input.source?.trim() || null,
    });

    // Best-effort — a missing SMTP config or a flaky send shouldn't block
    // someone from successfully joining the waitlist.
    try {
      await sendWaitlistConfirmationEmail({ to: email, name });
    } catch (err) {
      console.error("Failed to send waitlist confirmation email:", err);
    }

    return { success: true };
  } catch (err) {
    console.error("Failed to join waitlist:", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

/** Total signups — handy for a "N people already joined" line, admin view, etc. */
export async function WaitlistCount(): Promise<number> {
  const result = await db.select({ count: count() }).from(waitlistEntries);
  return result[0]?.count ?? 0;
}
