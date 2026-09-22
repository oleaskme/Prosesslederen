import { NextRequest, NextResponse } from "next/server";
import { generateId, readDb, writeDb } from "@/lib/db";
import type { ProsessEier } from "@/lib/types";

export async function GET() {
  const db = readDb();
  return NextResponse.json(db.eiere);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const db = readDb();

  const eier: ProsessEier = {
    id: generateId("eier"),
    navn: body.navn ?? "",
    avdeling: body.avdeling ?? "",
    tittel: body.tittel ?? "",
  };

  db.eiere.push(eier);
  writeDb(db);

  return NextResponse.json(eier, { status: 201 });
}
