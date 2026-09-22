import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const db = readDb();

  db.processHierarchy.defaultOwners = {
    PLAN: body.PLAN ?? db.processHierarchy.defaultOwners.PLAN,
    GJENNOMFØRING: body.GJENNOMFØRING ?? db.processHierarchy.defaultOwners.GJENNOMFØRING,
    STYRING: body.STYRING ?? db.processHierarchy.defaultOwners.STYRING,
  };

  writeDb(db);
  return NextResponse.json(db.processHierarchy.defaultOwners);
}
