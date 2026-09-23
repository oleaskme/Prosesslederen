import { NextRequest, NextResponse } from "next/server";
import { generateId, readDb, writeDb } from "@/lib/db";
import type { Initiativ } from "@/lib/types";

export async function GET() {
  const db = readDb();
  return NextResponse.json(db.initiatives);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const db = readDb();

  const now = new Date().toISOString();
  const initiativ: Initiativ = {
    id: generateId("init"),
    navn: body.navn ?? "",
    beskrivelse: body.beskrivelse ?? "",
    berortProcessId: body.berortProcessId ?? "",
    effektForventet: body.effektForventet ?? "",
    effektMaaling: body.effektMaaling ?? "",
    prosesseierId: body.prosesseierId ?? "",
    subjectMatterExpertId: body.subjectMatterExpertId ?? "",
    fase: body.fase ?? "idéfase",
    fremdriftsstatus: body.fremdriftsstatus ?? "ikke påbegynt",
    ragStatus: body.ragStatus ?? "green",
    tidsperspektiv: body.tidsperspektiv ?? "na",
    kompleksitet: body.kompleksitet ?? "lav",
    avhengighetTeknologi: body.avhengighetTeknologi ?? "",
    avhengighetProsess: body.avhengighetProsess ?? "",
    avhengighetKompetanse: body.avhengighetKompetanse ?? "",
    risikoSannsynlighet: body.risikoSannsynlighet ?? 1,
    risikoKonsekvens: body.risikoKonsekvens ?? 1,
    opprettet: now,
    oppdatert: now,
  };

  db.initiatives.push(initiativ);
  writeDb(db);

  return NextResponse.json(initiativ, { status: 201 });
}
