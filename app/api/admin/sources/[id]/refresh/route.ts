import { NextResponse } from "next/server";
import { isAdminSignedIn } from "@/lib/admin-auth";
import { runIntakeForSourceId } from "@/lib/intake";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminSignedIn())) {
    return NextResponse.json({ error: "Admin access required." }, { status: 401 });
  }

  const { id } = await params;

  try {
    const result = await runIntakeForSourceId(id);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Force refresh failed." },
      { status: 400 }
    );
  }
}
