import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "World Cup Sweepstake",
  description: "Live leaderboard for our World Cup sweepstake.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur">
          <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-lg font-bold tracking-tight">
              ⚽ Sweepstake
            </Link>
            <div className="flex gap-5 text-sm font-medium text-slate-300">
              <Link href="/" className="transition hover:text-emerald-400">
                Leaderboard
              </Link>
              <Link href="/matches" className="transition hover:text-emerald-400">
                Matches
              </Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-4xl px-4 pb-10 pt-4 text-center text-xs text-slate-600">
          3 points for a win · 1 for a draw · ranked by points, then goal difference
        </footer>
      </body>
    </html>
  );
}
