import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = readDb();
  const initiativ = db.initiatives.find((i) => i.id === id);
  if (!initiativ) {
    return NextResponse.json({ error: "Fant ikke initiativet" }, { status: 404 });
  }
  return NextResponse.json(initiativ);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const db = readDb();
  const index = db.initiatives.findIndex((i) => i.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Fant ikke initiativet" }, { status: 404 });
  }

  const existing = db.initiatives[index];
  db.initiatives[index] = {
    ...existing,
    ...body,
    id: existing.id,
    opprettet: existing.opprettet,
    oppdatert: new Date().toISOString(),
  };

  writeDb(db);
  return NextResponse.json(db.initiatives[index]);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = readDb();
  const index = db.initiatives.findIndex((i) => i.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Fant ikke initiativet" }, { status: 404 });
  }

  db.initiatives.splice(index, 1);
  writeDb(db);
  return NextResponse.json({ ok: true });
}
