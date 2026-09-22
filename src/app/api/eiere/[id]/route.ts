import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const db = readDb();
  const index = db.eiere.findIndex((e) => e.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Fant ikke eieren" }, { status: 404 });
  }

  db.eiere[index] = {
    ...db.eiere[index],
    navn: body.navn ?? db.eiere[index].navn,
    avdeling: body.avdeling ?? db.eiere[index].avdeling,
    tittel: body.tittel ?? db.eiere[index].tittel,
  };

  writeDb(db);
  return NextResponse.json(db.eiere[index]);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = readDb();
  const index = db.eiere.findIndex((e) => e.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Fant ikke eieren" }, { status: 404 });
  }

  db.eiere.splice(index, 1);
  writeDb(db);
  return NextResponse.json({ ok: true });
}
