# Prosesslederen

Proof of concept for samlet oversikt over digitaliseringsinitiativer, prosesser og fremdrift
for rollen som prosessleder digitalisering. Bygget i Next.js (App Router), TypeScript og
Tailwind CSS.

Kun ugradert informasjon skal legges inn i applikasjonen.

## Faner

- **Initiativoversikt**: liste over digitaliseringsinitiativer, med filtrering, opprettelse,
  redigering og sletting.
- **Prioriteringsmatrise**: initiativene plassert etter tidsperspektiv og kompleksitet.
- **Admin**: prosesshierarki etter APQC Process Classification Framework, med standard
  prosesseiere per delprosess og mulighet for å overstyre eier per prosess.
- **Fremdrift**: initiativer som pågår eller er i drift, med fremdriftsstatus og RAG.

## Kom i gang

```bash
npm install
npm run dev
```

Åpne [http://localhost:3000](http://localhost:3000).

## Datalagring

I denne POC en lagres data i en lokal JSON fil, `data/db.json`, uten ekstern avhengighet.
Skriving til filen krever et skrivbart filsystem, og fungerer derfor i lokal utvikling, men
ikke i en vanlig serverløs driftsmodus (for eksempel Vercel), der data ville blitt lagret i
en database i en pilotversjon.

## Teknisk

- Next.js (App Router) og React, TypeScript
- Tailwind CSS
- Ingen innlogging eller tilgangsstyring i POC fasen
