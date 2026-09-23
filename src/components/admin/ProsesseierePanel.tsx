"use client";

import { cardAccent } from "@/lib/ui";
import EiereRegister from "@/components/admin/EiereRegister";

export default function ProsesseierePanel() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Prosesseiere</h2>
        <p className="mt-1 text-sm text-slate-500">
          Prosesseier er personen i linjen som eier prosessen og initiativet. Registeret under
          brukes som kilde for feltet Prosesseier i fanene Initiativoversikt og Initiativer.
        </p>
      </div>

      <EiereRegister />

      <div className={cardAccent("teal")}>
        <p className="text-sm text-slate-600">
          <span className="font-medium text-slate-900">Ole Mjelde</span>, prosessleder digitalisering, har ansvar
          for prosessutvikling innenfor GJENNOMFØRING. Dette er en rolle knyttet til utvikling av prosessen, ikke
          et eierskap i linjen, og påvirker derfor ikke prosesseierne over.
        </p>
      </div>
    </div>
  );
}
