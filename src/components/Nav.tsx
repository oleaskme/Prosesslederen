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
    <header className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="h-7 w-7 rounded-lg bg-gradient-to-br from-sky-400 to-indigo-500 shadow-inner" />
          <span className="text-lg font-semibold tracking-tight text-white">Prosesslederen</span>
          <span className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-xs font-medium text-indigo-100">
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
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-white text-indigo-900 shadow-sm"
                    : "text-indigo-100 hover:bg-white/10 hover:text-white"
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
