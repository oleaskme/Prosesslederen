import { NextRequest, NextResponse } from "next/server";
import { readDb } from "@/lib/db";
import { faseLabels, statusLabels } from "@/lib/labels";

const MODEL = "claude-sonnet-5";

interface ChatMelding {
  role: "user" | "assistant";
  content: string;
}

function byggPortefoljekontekst(): string {
  const db = readDb();
  return db.initiatives
    .map((i) => {
      return [
        `Navn: ${i.navn}`,
        `Fase: ${faseLabels[i.fase]}`,
        `Status: ${statusLabels[i.status]}`,
        `RAG-status: ${i.ragStatus}`,
        `Risiko: sannsynlighet ${i.risikoSannsynlighet}, konsekvens ${i.risikoKonsekvens}`,
        `Kompleksitet: ${i.kompleksitet}`,
        `Tidsperspektiv: ${i.tidsperspektiv}`,
        `Effekt forventet: ${i.effektForventet || "(ikke oppgitt)"}`,
        `Effektmåling: ${i.effektMaaling || "(ikke oppgitt)"}`,
      ].join(", ");
    })
    .join("\n");
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      svar:
        "KI-assistenten er ikke koblet til en språkmodell ennå. Legg ANTHROPIC_API_KEY i en .env.local-fil på maskinen som kjører appen, og start den på nytt.",
    });
  }

  const body = await request.json();
  const meldinger = (body.meldinger ?? []) as ChatMelding[];

  const systemPrompt = [
    "Du er KI-assistenten i Prosesslederen, et verktøy for å følge opp digitaliseringsinitiativer i",
    "Økonomi- og styringsavdelingen i Forsvarsstaben. Svar kort, konkret og på norsk bokmål.",
    "Bruk aldri tankestrek. Grunnlaget ditt er denne porteføljen av initiativer:",
    "",
    byggPortefoljekontekst(),
  ].join("\n");

  const respons = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: meldinger.map((m) => ({ role: m.role, content: m.content })),
    }),
  });

  if (!respons.ok) {
    return NextResponse.json({
      svar: `Fikk en feil fra språkmodellen (status ${respons.status}). Sjekk at ANTHROPIC_API_KEY er gyldig.`,
    });
  }

  const data = await respons.json();
  const svar = data.content?.[0]?.text ?? "Fikk ikke noe svar fra språkmodellen.";
  return NextResponse.json({ svar });
}
