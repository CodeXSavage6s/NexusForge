import { NextRequest, NextResponse } from "next/server";
import { CreateTask } from "@/lib/actions/task";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { projectId, title, description } = data;

    if (!projectId || !title) {
      return NextResponse.json({ success: false, error: "Missing projectId or title" }, { status: 400 });
    }

    const result = await CreateTask({ projectId, title, description });
    return NextResponse.json(result);
  } catch (error) {
    console.error("API task create error", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Failed to create task" }, { status: 500 });
  }
}
