import { faseLabels, faseOptions, fremdriftLabels, fremdriftOptions, ragColor, ragLabels, ragOptions } from "@/lib/labels";
import { cardAccent } from "@/lib/ui";
import type { Initiativ } from "@/lib/types";

function tell<T>(initiatives: Initiativ[], velger: (i: Initiativ) => T, verdi: T) {
  return initiatives.filter((i) => velger(i) === verdi).length;
}

function Fordeling({
  title,
  rows,
  total,
}: {
  title: string;
  rows: { label: string; count: number; dot?: string }[];
  total: number;
}) {
  return (
    <div className={cardAccent("indigo")}>
      <h3 className="font-medium text-slate-900">{title}</h3>
      <div className="mt-3 space-y-2">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-3">
            <span className="flex w-40 items-center gap-1.5 text-sm text-slate-600">
              {r.dot && <span className={`h-2 w-2 rounded-full ${r.dot}`} />}
              {r.label}
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-indigo-500"
                style={{ width: total ? `${(r.count / total) * 100}%` : "0%" }}
              />
            </div>
            <span className="w-6 text-right text-sm font-medium text-slate-700">{r.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StatusPanel({ initiatives }: { initiatives: Initiativ[] }) {
  const total = initiatives.length;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Status</h2>
        <p className="mt-1 text-sm text-slate-500">
          Rask oversikt over hvordan initiativene fordeler seg, til bruk som et administrativt bilde av porteføljen.
        </p>
      </div>

      <div className={cardAccent("teal")}>
        <p className="text-sm text-slate-600">
          Totalt <span className="font-semibold text-slate-900">{total}</span> initiativer registrert.
        </p>
      </div>

      <Fordeling
        title="Fordeling per fase"
        total={total}
        rows={faseOptions.map((s) => ({ label: faseLabels[s], count: tell(initiatives, (i) => i.fase, s) }))}
      />

      <Fordeling
        title="Fordeling per RAG-status"
        total={total}
        rows={ragOptions.map((r) => ({
          label: ragLabels[r],
          count: tell(initiatives, (i) => i.ragStatus, r),
          dot: ragColor[r],
        }))}
      />

      <Fordeling
        title="Fordeling per fremdriftsstatus"
        total={total}
        rows={fremdriftOptions.map((f) => ({
          label: fremdriftLabels[f],
          count: tell(initiatives, (i) => i.fremdriftsstatus, f),
        }))}
      />
    </div>
  );
}
