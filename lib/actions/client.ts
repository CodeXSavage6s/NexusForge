"use server";

import db from "@/database";
import { clients, projects } from "@/database/schema/schema";
import { eq, count, and, ne } from "drizzle-orm";
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
    phone?: string;
  };
  clientId?: string;
  client?: typeof clients.$inferSelect;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WEBSITE_RE = /^https?:\/\/./i;
// Accepts an optional leading +, then digits/spaces/dashes/dots/parens,
// requiring at least 7 digits overall (loose international-friendly check).
const PHONE_RE = /^\+?[0-9\s().-]{7,20}$/;

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
      phone?: string;
    } = {};

    if (!name?.trim()) {
      fieldErrors.name = "Client name is required.";
    }

    if (email && !EMAIL_RE.test(email)) {
      fieldErrors.email = "Enter a valid email address.";
    }

    if (website && !WEBSITE_RE.test(website)) {
      fieldErrors.website = "Enter a valid URL (starting with http:// or https://).";
    }

    if (phone && !PHONE_RE.test(phone)) {
      fieldErrors.phone = "Enter a valid phone number.";
    }

    if (Object.keys(fieldErrors).length > 0) {
      return {
        success: false,
        error: "Please fix the errors below.",
        fieldErrors,
      };
    }
    
    const [check] = await db
      .select()
      .from(clients)
      .where(and(eq(clients.workspaceId, workspaceId), eq(clients.name, name)))
    
    if (check) return {
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

export async function GetWorkspaceClient(workspaceId: string) {
  try {
    const client = await db.select().from(clients).where(eq(clients.workspaceId, workspaceId))

    const projectCounts = await db
      .select({ count: count(), clientId: clients.id })
      .from(clients)
      .leftJoin(projects, eq(clients.id, projects.clientId))
      .where(eq(clients.workspaceId, workspaceId))
      .groupBy(clients.id)

    // Map clientId -> project count for O(1) lookup instead of an N+1 query loop
    const countsByClientId = new Map(projectCounts.map((row) => [row.clientId, row.count]))

    // Keep projectCount as its own array, aligned to `client` by clientId,
    // so every client's count is included (not just the first row).
    const projectCount = client.map((c) => ({
      clientId: c.id,
      count: countsByClientId.get(c.id) ?? 0,
    }))

    return {
      success: true,
      client,
      projectCount,
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

export async function GetClientDetails(clientId: string, workspaceId: string | undefined) {
  try {
    const [client] = await db.select().from(clients).where(and(eq(clients.id, clientId), eq(clients.workspaceId, workspaceId)))

    return client
  } catch (err) {
    console.error("Error fetching client details", err)
    throw err
  }
}

export async function UpdateClient(data: {
    id: string;
    workspaceId: string;
    name?: string;
    companyName?: string;
    email?: string;
    phone?: string;
    website?: string;
    industry?: string;
    address?: string;
    notes?: string;
    status?: ClientStatus;
}) {
  const {
    id,
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
  } = data;
  try {
    if (!id) {
      return { success: false, error: "Client ID is required." };
    }
    if (!workspaceId) {
      return { success: false, error: "Could not identify workspace." };
    }

    const [existingClient] = await db
      .select()
      .from(clients)
      .where(
        and(
          eq(clients.workspaceId, workspaceId),
          eq(clients.name, name),
          ne(clients.id, id) 
        )
      );

    if (existingClient) {
      return {
        success: false,
        error: "A client with this name already exists in this workspace.",
      };
    }

    const [updatedClient] = await db
      .update(clients)
      .set({
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
      .where(and(eq(clients.id, id), eq(clients.workspaceId, workspaceId)))
      .returning();

    if (!updatedClient) {
      return { success: false, error: "Client not found or update failed." };
    }

    return {
      success: true,
      message: "Update successful.",
      client: updatedClient,
    };
  } catch (err) {
    console.error("Update Client Error:", err);
    return { success: false, error: "Update failed." };
  }
}

export async function DeleteClient(clientId: string, workspaceId?: string) {
  try {
    // Check for existing projects that reference this client (projects.clientId has onDelete: restrict)
    const projectCountRes = await db.select({ count: count() }).from(projects).where(eq(projects.clientId, clientId));
    const projectCount = projectCountRes[0]?.count ?? 0;
    if (projectCount > 0) {
      return { success: false, error: 'Client has projects. Delete projects first.' };
    }

    const whereClause = workspaceId ? and(eq(clients.id, clientId), eq(clients.workspaceId, workspaceId)) : eq(clients.id, clientId);

    const [deleted] = await db.delete(clients).where(whereClause).returning();

    if (!deleted) return { success: false, error: 'Client not found or not authorized' };

    return { success: true, client: deleted };
  } catch (err) {
    console.error('Failed to delete client', err);
    return { success: false, error: 'Failed to delete client' };
  }
}

export async function ProjectCount(clientId: string): Promise<number> {
  try {
    const [projectCountRes] = await db
      .select({ count: count() })
      .from(projects)
      .where(eq(projects.clientId, clientId));

    return projectCountRes?.count ?? 0;
  } catch (err) {
    console.error("Failed to get clientProject count", err);
    return 0;
  }
}