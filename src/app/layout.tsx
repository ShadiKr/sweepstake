import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import "flag-icons/css/flag-icons.min.css";

export const metadata: Metadata = {
  title: "World Cup 2026 Sweepstake",
  description: "Live leaderboard for our FIFA World Cup 2026 sweepstake.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen text-slate-100 antialiased">
        <header className="relative border-b border-amber-500/20 bg-gradient-to-r from-[#020a22] via-[#071640] to-[#020a22]">
          {/* Gold shimmer line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
          <nav className="relative mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex flex-col leading-tight">
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-400/80">
                FIFA World Cup 2026™
              </span>
              <span className="text-xl font-black tracking-tight text-white">
                Beer Sweepstake
              </span>
            </Link>

            <div className="hidden items-center gap-1.5 sm:flex">
              <span className="fi fi-us rounded-sm text-xl shadow-sm" aria-label="USA" />
              <span className="text-xs text-slate-600">·</span>
              <span className="fi fi-ca rounded-sm text-xl shadow-sm" aria-label="Canada" />
              <span className="text-xs text-slate-600">·</span>
              <span className="fi fi-mx rounded-sm text-xl shadow-sm" aria-label="Mexico" />
            </div>

            <div className="flex gap-5 text-sm font-semibold">
              <Link
                href="/"
                className="text-slate-300 transition-colors hover:text-amber-400"
              >
                Leaderboard
              </Link>
              <Link
                href="/matches"
                className="text-slate-300 transition-colors hover:text-amber-400"
              >
                Matches
              </Link>
            </div>
          </nav>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>

        <footer className="mx-auto max-w-5xl px-4 pb-10 pt-4 text-center text-xs text-slate-600">
          3 pts for a win · 1 for a draw · ranked by points, then goal difference
        </footer>
      </body>
    </html>
  );
}
