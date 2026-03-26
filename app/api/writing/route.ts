import { NextRequest, NextResponse } from "next/server";
import { aiWriterService } from "@/lib/services/ai-writer-service";

export async function POST(req: NextRequest) {
  const body = await req.json();
  return NextResponse.json(await aiWriterService.generate(body));
}
