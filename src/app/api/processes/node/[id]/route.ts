import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const db = readDb();
  const { processHierarchy } = db;

  const l1 = processHierarchy.level1.find((n) => n.id === id);
  if (l1) {
    if (body.relevans !== undefined) l1.relevans = body.relevans;
    writeDb(db);
    return NextResponse.json(l1);
  }

  const l2 = processHierarchy.level2.find((n) => n.id === id);
  if (l2) {
    if (body.navn !== undefined) l2.navn = body.navn;
    writeDb(db);
    return NextResponse.json(l2);
  }

  const l3 = processHierarchy.level3.find((n) => n.id === id);
  if (l3) {
    if (body.navn !== undefined) l3.navn = body.navn;
    if (body.delprosess !== undefined) l3.delprosess = body.delprosess;
    if (body.eierOverstyring !== undefined) l3.eierOverstyring = body.eierOverstyring || null;
    writeDb(db);
    return NextResponse.json(l3);
  }

  return NextResponse.json({ error: "Fant ikke prosessnoden" }, { status: 404 });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = readDb();
  const { processHierarchy } = db;

  if (processHierarchy.level1.some((n) => n.id === id)) {
    return NextResponse.json(
      { error: "Nivå 1 er fast (APQC hovedkategorier) og kan ikke slettes" },
      { status: 400 }
    );
  }

  const l2Index = processHierarchy.level2.findIndex((n) => n.id === id);
  if (l2Index !== -1) {
    const childIds = processHierarchy.level3
      .filter((n) => n.level2Id === id)
      .map((n) => n.id);
    const inUse = db.initiatives.some((i) => childIds.includes(i.berortProcessId));
    if (inUse) {
      return NextResponse.json(
        { error: "Kan ikke slette, ett eller flere initiativer er knyttet til underliggende prosesser" },
        { status: 400 }
      );
    }
    processHierarchy.level3 = processHierarchy.level3.filter((n) => n.level2Id !== id);
    processHierarchy.level2.splice(l2Index, 1);
    writeDb(db);
    return NextResponse.json({ ok: true });
  }

  const l3Index = processHierarchy.level3.findIndex((n) => n.id === id);
  if (l3Index !== -1) {
    const inUse = db.initiatives.some((i) => i.berortProcessId === id);
    if (inUse) {
      return NextResponse.json(
        { error: "Kan ikke slette, ett eller flere initiativer er knyttet til denne prosessen" },
        { status: 400 }
      );
    }
    processHierarchy.level3.splice(l3Index, 1);
    writeDb(db);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Fant ikke prosessnoden" }, { status: 404 });
}
