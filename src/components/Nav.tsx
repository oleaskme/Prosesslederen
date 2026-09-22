"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const faner = [
  { href: "/initiativer", label: "Initiativoversikt" },
  { href: "/prioriteringsmatrise", label: "Prioriteringsmatrise" },
  { href: "/admin", label: "Admin" },
  { href: "/fremdrift", label: "Fremdrift" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-semibold text-slate-900">Prosesslederen</span>
          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
            POC · kun ugradert informasjon
          </span>
        </div>
        <nav className="flex flex-1 flex-wrap gap-1">
          {faner.map((fane) => {
            const active = pathname === fane.href || pathname?.startsWith(fane.href + "/");
            return (
              <Link
                key={fane.href}
                href={fane.href}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {fane.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
