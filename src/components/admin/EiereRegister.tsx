"use client";

import { useEffect, useState } from "react";
import { buttonDanger, buttonGhost, buttonPrimary, cardAccent, inputClass } from "@/lib/ui";
import type { Delprosess, ProsessEier } from "@/lib/types";

type Utkast = { navn: string; avdeling: string; seksjon: Delprosess; tittel: string };

const tomtUtkast: Utkast = { navn: "", avdeling: "", seksjon: "GJENNOMFØRING", tittel: "" };

const seksjonOptions: Delprosess[] = ["PLAN", "GJENNOMFØRING", "STYRING"];

export default function EiereRegister() {
  const [eiere, setEiere] = useState<ProsessEier[] | null>(null);
  const [redigerer, setRedigerer] = useState<Set<string>>(new Set());
  const [utkast, setUtkast] = useState<Record<string, Utkast>>({});
  const [nyEier, setNyEier] = useState<Utkast | null>(null);
  const [lagrer, setLagrer] = useState(false);

  async function hent() {
    const res = await fetch("/api/eiere", { cache: "no-store" });
    setEiere(await res.json());
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    hent();
  }, []);

  function startRediger(e: ProsessEier) {
    setUtkast((u) => ({ ...u, [e.id]: { navn: e.navn, avdeling: e.avdeling, seksjon: e.seksjon, tittel: e.tittel } }));
    setRedigerer((s) => new Set(s).add(e.id));
  }

  function avbrytRadRediger(id: string) {
    setRedigerer((s) => {
      const ny = new Set(s);
      ny.delete(id);
      return ny;
    });
    setUtkast((u) => {
      const kopi = { ...u };
      delete kopi[id];
      return kopi;
    });
  }

  function redigerListe() {
    if (!eiere) return;
    const nyttUtkast: Record<string, Utkast> = {};
    eiere.forEach((e) => {
      nyttUtkast[e.id] = { navn: e.navn, avdeling: e.avdeling, seksjon: e.seksjon, tittel: e.tittel };
    });
    setUtkast(nyttUtkast);
    setRedigerer(new Set(eiere.map((e) => e.id)));
  }

  function avbrytListe() {
    setRedigerer(new Set());
    setUtkast({});
  }

  async function lagreRad(id: string) {
    const data = utkast[id];
    if (!data) return;
    setLagrer(true);
    try {
      await fetch(`/api/eiere/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await hent();
      avbrytRadRediger(id);
    } finally {
      setLagrer(false);
    }
  }

  async function lagreListe() {
    setLagrer(true);
    try {
      await Promise.all(
        Object.entries(utkast).map(([id, data]) =>
          fetch(`/api/eiere/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          })
        )
      );
      await hent();
      avbrytListe();
    } finally {
      setLagrer(false);
    }
  }

  async function slett(id: string) {
    const navn = eiere?.find((e) => e.id === id)?.navn ?? "denne eieren";
    if (!confirm(`Slette ${navn} fra eierregisteret?`)) return;
    await fetch(`/api/eiere/${id}`, { method: "DELETE" });
    avbrytRadRediger(id);
    await hent();
  }

  async function leggTil() {
    if (!nyEier || !nyEier.navn.trim()) return;
    await fetch("/api/eiere", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nyEier),
    });
    setNyEier(null);
    await hent();
  }

  if (!eiere) {
    return <p className="text-sm text-slate-500">Laster eiere...</p>;
  }

  const bulkModus = eiere.length > 0 && eiere.every((e) => redigerer.has(e.id));

  function felt(id: string, nokkel: "navn" | "avdeling" | "tittel", placeholder: string) {
    const rad = utkast[id] ?? tomtUtkast;
    return (
      <input
        className={inputClass}
        placeholder={placeholder}
        value={rad[nokkel]}
        onChange={(ev) =>
          setUtkast((u) => ({ ...u, [id]: { ...(u[id] ?? tomtUtkast), [nokkel]: ev.target.value } }))
        }
      />
    );
  }

  function seksjonSelect(id: string) {
    const rad = utkast[id] ?? tomtUtkast;
    return (
      <select
        className={inputClass}
        value={rad.seksjon}
        onChange={(ev) =>
          setUtkast((u) => ({ ...u, [id]: { ...(u[id] ?? tomtUtkast), seksjon: ev.target.value as Delprosess } }))
        }
      >
        {seksjonOptions.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className={cardAccent("indigo")}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-medium text-slate-900">Eiere</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Register over personer som kan settes som prosesseier, med avdeling, seksjon og tittel.
          </p>
        </div>
        {bulkModus ? (
          <div className="flex gap-2">
            <button onClick={lagreListe} disabled={lagrer} className={buttonPrimary}>
              Lagre alle
            </button>
            <button onClick={avbrytListe} className={buttonGhost}>
              Avbryt
            </button>
          </div>
        ) : (
          <button onClick={redigerListe} disabled={eiere.length === 0} className={buttonGhost}>
            Rediger liste
          </button>
        )}
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="py-2 pr-3">Navn</th>
              <th className="py-2 pr-3">Avdeling</th>
              <th className="py-2 pr-3">Seksjon</th>
              <th className="py-2 pr-3">Tittel</th>
              <th className="py-2 pr-1 text-right">Handling</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {eiere.map((e) => {
              const rediger = redigerer.has(e.id);
              return (
                <tr key={e.id}>
                  <td className="py-2 pr-3">
                    {rediger ? felt(e.id, "navn", "Navn") : <span className="font-medium text-slate-900">{e.navn}</span>}
                  </td>
                  <td className="py-2 pr-3">
                    {rediger ? felt(e.id, "avdeling", "Avdeling") : <span className="text-slate-600">{e.avdeling}</span>}
                  </td>
                  <td className="py-2 pr-3">
                    {rediger ? seksjonSelect(e.id) : <span className="text-slate-600">{e.seksjon}</span>}
                  </td>
                  <td className="py-2 pr-3">
                    {rediger ? felt(e.id, "tittel", "Tittel") : <span className="text-slate-600">{e.tittel}</span>}
                  </td>
                  <td className="py-2 pr-1">
                    {rediger ? (
                      bulkModus ? null : (
                        <div className="flex justify-end gap-1">
                          <button onClick={() => lagreRad(e.id)} disabled={lagrer} className={buttonPrimary}>
                            Lagre
                          </button>
                          <button onClick={() => avbrytRadRediger(e.id)} className={buttonGhost}>
                            Avbryt
                          </button>
                        </div>
                      )
                    ) : (
                      <div className="flex justify-end gap-1">
                        <button onClick={() => startRediger(e)} className={buttonGhost}>
                          Rediger
                        </button>
                        <button onClick={() => slett(e.id)} className={buttonDanger}>
                          Slett
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {eiere.length === 0 && (
              <tr>
                <td colSpan={5} className="py-4 text-center text-slate-400">
                  Ingen eiere registrert ennå.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3">
        {nyEier ? (
          <div className="grid gap-2 sm:grid-cols-5">
            <input
              className={inputClass}
              placeholder="Navn"
              value={nyEier.navn}
              onChange={(e) => setNyEier({ ...nyEier, navn: e.target.value })}
            />
            <input
              className={inputClass}
              placeholder="Avdeling"
              value={nyEier.avdeling}
              onChange={(e) => setNyEier({ ...nyEier, avdeling: e.target.value })}
            />
            <select
              className={inputClass}
              value={nyEier.seksjon}
              onChange={(e) => setNyEier({ ...nyEier, seksjon: e.target.value as Delprosess })}
            >
              {seksjonOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <input
              className={inputClass}
              placeholder="Tittel"
              value={nyEier.tittel}
              onChange={(e) => setNyEier({ ...nyEier, tittel: e.target.value })}
            />
            <div className="flex gap-2">
              <button onClick={leggTil} className={buttonPrimary}>
                Lagre
              </button>
              <button onClick={() => setNyEier(null)} className={buttonGhost}>
                Avbryt
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setNyEier({ ...tomtUtkast })} className={buttonGhost}>
            + Ny eier
          </button>
        )}
      </div>
    </div>
  );
}
