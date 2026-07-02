import db from "@/database";
import { verification } from "@/database/schema/auth-schema";
import { randomUUID } from "crypto";

export async function GET() {
  try {
    await db.insert(verification).values({
      id: randomUUID(),
      identifier: "test",
      value: "test",
      expiresAt: new Date(Date.now() + 60000),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return Response.json({ success: true });
  } catch (e) {
    console.error(e);
    return Response.json(e);
  }
}