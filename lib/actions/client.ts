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
  };
  clientId?: string;
  client?: typeof clients.$inferSelect;
}

//const EMAIL_RE =
const WEBSITE_RE = /^https?:\/\/./i;

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

    //if (email && !EMAIL_RE.test(email)) {
    //  fieldErrors.email = "Enter a valid email address.";
   // }

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
    console.log("client from server", client)
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

export async function GetClientDetails(clientId: string, workspaceId: string | undefined) {
  try {
    console.log("Fetching client details for clientId:", clientId, "in workspaceId:", workspaceId);
    const [client] = await db.select().from(clients).where(and(eq(clients.id, clientId), eq(clients.workspaceId, workspaceId)))
    
    console.log("client from server", client)
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