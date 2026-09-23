"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { analyserPortefolje } from "@/lib/kiAnalyse";
import { getProcessLabel } from "@/lib/processHelpers";
import { buttonPrimary, cardAccent, inputClass } from "@/lib/ui";

const LAGRINGSNOKKEL = "ki-assistent-traader";

interface ChatMelding {
  role: "user" | "assistant";
  content: string;
}

interface ChatTraad {
  id: string;
  tittel: string;
  meldinger: ChatMelding[];
}

function nyTraad(): ChatTraad {
  return { id: `traad-${Date.now().toString(36)}`, tittel: "Nytt spørsmål", meldinger: [] };
}

function lastLagredeTraader(): ChatTraad[] {
  if (typeof window === "undefined") return [nyTraad()];
  try {
    const lagret = localStorage.getItem(LAGRINGSNOKKEL);
    if (lagret) {
      const parsed = JSON.parse(lagret) as ChatTraad[];
      if (parsed.length > 0) return parsed;
    }
  } catch {
    // Ignorerer feil ved lesing av lagret chat-historikk (f.eks. privat nettleservindu).
  }
  return [nyTraad()];
}

export default function KiAssistentPage() {
  const { initiatives, hierarchy, loading } = useAppData();
  const [traader, setTraader] = useState<ChatTraad[]>(lastLagredeTraader);
  const [aktivId, setAktivId] = useState<string>(() => traader[0].id);
  const [tekst, setTekst] = useState("");
  const [sender, setSender] = useState(false);
  const bunnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(LAGRINGSNOKKEL, JSON.stringify(traader));
    } catch {
      // Ignorerer feil ved lagring av chat-historikk.
    }
  }, [traader]);

  useEffect(() => {
    bunnRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [traader, aktivId]);

  const analyse = useMemo(() => (initiatives ? analyserPortefolje(initiatives) : null), [initiatives]);
  const aktivTraad = traader.find((t) => t.id === aktivId) ?? traader[0];

  function startNyTraad() {
    const t = nyTraad();
    setTraader((prev) => [t, ...prev]);
    setAktivId(t.id);
  }

  async function sendMelding() {
    const innhold = tekst.trim();
    if (!innhold || sender) return;
    setTekst("");
    setSender(true);

    const brukerMelding: ChatMelding = { role: "user", content: innhold };
    const oppdatertMeldinger = [...aktivTraad.meldinger, brukerMelding];
    const nyTittel = aktivTraad.meldinger.length === 0 ? innhold.slice(0, 48) : aktivTraad.tittel;

    setTraader((prev) =>
      prev.map((t) => (t.id === aktivTraad.id ? { ...t, meldinger: oppdatertMeldinger, tittel: nyTittel } : t))
    );

    try {
      const res = await fetch("/api/assistent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meldinger: oppdatertMeldinger }),
      });
      const data = await res.json();
      const assistentMelding: ChatMelding = { role: "assistant", content: data.svar };
      setTraader((prev) =>
        prev.map((t) =>
          t.id === aktivTraad.id ? { ...t, meldinger: [...oppdatertMeldinger, assistentMelding] } : t
        )
      );
    } catch {
      const feilMelding: ChatMelding = {
        role: "assistant",
        content: "Klarte ikke å nå KI-tjenesten. Prøv igjen.",
      };
      setTraader((prev) =>
        prev.map((t) =>
          t.id === aktivTraad.id ? { ...t, meldinger: [...oppdatertMeldinger, feilMelding] } : t
        )
      );
    } finally {
      setSender(false);
    }
  }

  if (loading || !hierarchy || !initiatives || !analyse) {
    return <p className="text-sm text-slate-500">Laster KI-assistent...</p>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">KI Assistent</h1>
        <p className="text-sm text-slate-500">
          Automatisk porteføljeanalyse og risikovarsling til venstre, og en chat om porteføljen til høyre.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1.4fr]">
        <div className="space-y-4">
          <div className={cardAccent("rose")}>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Risikovarsler</h2>
            {analyse.risikovarsler.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">Ingen initiativer peker seg ut med høy risiko akkurat nå.</p>
            ) : (
              <ul className="mt-2 space-y-1.5 text-sm">
                {analyse.risikovarsler.map((i) => (
                  <li key={i.id} className="text-slate-700">
                    <span className="font-medium">{i.navn}</span>
                    <span className="text-slate-400"> · RAG {i.ragStatus}, risiko {i.risikoSannsynlighet}×
                      {i.risikoKonsekvens}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={cardAccent("amber")}>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Svak effektmåling</h2>
            {analyse.svakEffektmaaling.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">Alle initiativer har en beskrevet effektmåling.</p>
            ) : (
              <ul className="mt-2 space-y-1.5 text-sm">
                {analyse.svakEffektmaaling.map((i) => (
                  <li key={i.id} className="text-slate-700">
                    <span className="font-medium">{i.navn}</span>
                    <span className="text-slate-400"> · effektmåling bør konkretiseres</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={cardAccent("sky")}>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Mulig overlapp</h2>
            {analyse.muligOverlapp.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">Ingen initiativer deler samme (del)prosess i dag.</p>
            ) : (
              <ul className="mt-2 space-y-2 text-sm">
                {analyse.muligOverlapp.map((gruppe) => (
                  <li key={gruppe.berortProcessId} className="text-slate-700">
                    <span className="font-medium">{getProcessLabel(hierarchy, gruppe.berortProcessId)}</span>
                    <ul className="ml-3 list-disc text-slate-500">
                      {gruppe.initiativer.map((i) => (
                        <li key={i.id}>{i.navn}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={cardAccent("indigo")}>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Foreslått prioritet</h2>
            <p className="mt-1 text-xs text-slate-400">Basert på høyest risiko og kompleksitet, blant initiativer som ikke er avsluttet.</p>
            <ol className="mt-2 space-y-1.5 text-sm">
              {analyse.anbefaltPrioritet.map((i, idx) => (
                <li key={i.id} className="text-slate-700">
                  <span className="font-medium">{idx + 1}. {i.navn}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-56 shrink-0 space-y-2">
            <button onClick={startNyTraad} className={`${buttonPrimary} w-full`}>
              + Nytt spørsmål
            </button>
            <div className="space-y-1 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
              {traader.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setAktivId(t.id)}
                  className={`block w-full truncate rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                    t.id === aktivId ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-indigo-50"
                  }`}
                  title={t.tittel}
                >
                  {t.tittel}
                </button>
              ))}
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex-1 space-y-3 overflow-y-auto p-4" style={{ maxHeight: "560px" }}>
              {aktivTraad.meldinger.length === 0 && (
                <p className="text-sm text-slate-400">
                  Still et spørsmål om porteføljen, for eksempel «hvilke initiativer har rød RAG-status?».
                </p>
              )}
              {aktivTraad.meldinger.map((m, idx) => (
                <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                      m.role === "user" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {sender && <p className="text-xs text-slate-400">Tenker...</p>}
              <div ref={bunnRef} />
            </div>
            <div className="flex items-end gap-2 border-t border-slate-200 p-3">
              <textarea
                className={`${inputClass} resize-none`}
                rows={2}
                value={tekst}
                onChange={(e) => setTekst(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMelding();
                  }
                }}
                placeholder="Skriv et spørsmål om porteføljen..."
              />
              <button onClick={sendMelding} disabled={sender || !tekst.trim()} className={buttonPrimary}>
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
