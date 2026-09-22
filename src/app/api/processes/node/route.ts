import { NextRequest, NextResponse } from "next/server";
import { generateId, readDb, writeDb } from "@/lib/db";
import type { ProcessLevel2, ProcessLevel3 } from "@/lib/types";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const db = readDb();

  if (body.type === "level2") {
    if (!body.level1Id || !db.processHierarchy.level1.some((l) => l.id === body.level1Id)) {
      return NextResponse.json({ error: "Ugyldig level1Id" }, { status: 400 });
    }
    const node: ProcessLevel2 = {
      id: generateId("l2"),
      level1Id: body.level1Id,
      navn: body.navn ?? "",
    };
    db.processHierarchy.level2.push(node);
    writeDb(db);
    return NextResponse.json(node, { status: 201 });
  }

  if (body.type === "level3") {
    if (!body.level2Id || !db.processHierarchy.level2.some((l) => l.id === body.level2Id)) {
      return NextResponse.json({ error: "Ugyldig level2Id" }, { status: 400 });
    }
    const node: ProcessLevel3 = {
      id: generateId("l3"),
      level2Id: body.level2Id,
      navn: body.navn ?? "",
      delprosess: body.delprosess ?? "GJENNOMFØRING",
      eierOverstyring: body.eierOverstyring ?? null,
    };
    db.processHierarchy.level3.push(node);
    writeDb(db);
    return NextResponse.json(node, { status: 201 });
  }

  return NextResponse.json({ error: "Ukjent type, forventet level2 eller level3" }, { status: 400 });
}
