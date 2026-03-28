import { NextResponse } from "next/server";
import { schedulerService } from "@/lib/services/scheduler-service";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    return NextResponse.json(await schedulerService.runTaskNow(id));
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 404 });
  }
}
