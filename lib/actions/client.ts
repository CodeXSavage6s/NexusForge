"use server";

import db from "@/database";
import { clients } from "@/database/schema/schema";
import { eq, count } from "drizzle-orm";
import type { ClientStatus } from "@/lib/constants/client-constants";

export async function ClientCount(workspaceId: string): Promise<number> {
  const result = await db.select({ count: count() }).from(clients).where(eq(clients.workspaceId, workspaceId));
  return result[0]?.count ?? 0;
}

export interface CreateClientState {
  success: boolean;
  error?: string;
  fieldErrors?: {
    name?: string;
    email?: string;
    website?: string;
  };
  clientId?: string;
  client?: typeof clients.$inferSelect;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WEBSITE_RE = /^https?:\/\/.+/i;

export async function CreateClient(
  data: {
    workspaceId: string;
    name: string;
    companyName?: string;
    email?: string;
    phone?: string;
    website?: string;
    industry?: string;
    address?: string;
    notes?: string;
    status?: ClientStatus;
  }
): Promise<CreateClientState> {
  try {
    const {
      workspaceId,
      name,
      companyName,
      email,
      phone,
      website,
      industry,
      address,
      notes,
      status = "PLANNING", // Updated from PENDING to a valid option from your constants file
    } = data;
    
    if (!workspaceId) {
      return {
        success: false,
        error: "Workspace is required.",
      };
    }

    const fieldErrors: {
      name?: string;
      email?: string;
      website?: string;
    } = {};

    if (!name?.trim()) {
      fieldErrors.name = "Client name is required.";
    }

    if (email && !EMAIL_RE.test(email)) {
      fieldErrors.email = "Enter a valid email address.";
    }

   /* if (website && !WEBSITE_RE.test(website)) {
      fieldErrors.website = "Enter a valid URL (starting with http:// or https://).";
    }
*/
    if (Object.keys(fieldErrors).length > 0) {
      return {
        success: false,
        error: "Please fix the errors below.",
        fieldErrors,
      };
    }
    
    const [check] = await db.select().from(clients).where(eq(clients.name, name))
    
    if (check || check.length > 0) return {
      success: false,
      error: "Client name already exist"
    }
    
    const [newClient] = await db
      .insert(clients)
      .values({
        workspaceId,
        name,
        companyName,
        email,
        phone,
        website,
        industry,
        address,
        notes,
        status,
      })
      .returning();

    if (!newClient) {
      return {
        success: false,
        error: "Failed to create client.",
      };
    }

    return {
      success: true,
      clientId: newClient.id,
      client: newClient,
    };
  } catch (error) {
    console.error("Create client failed:", error);

    return {
      success: false,
      error: "Failed to create client.",
    };
  }
}

export async function GetWorkspaceClient(workspaceId) {
  try {
    const client = await db.select().from(clients).where(eq(clients.workspaceId, workspaceId))
    
    return {
      success: true,
      client,
      message: "Success"
    }
  } catch (err) {
    return ({
      success: false,
      error: err,
      message: "Failed to fetch workspace clients"
    })
  }
}