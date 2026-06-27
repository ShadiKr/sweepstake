import { BanterWall } from "@/components/BanterWall";

export default function BanterPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-400/80">
          FIFA World Cup 2026™
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-white">Banter</h1>
        <p className="mt-1 text-sm text-slate-400">
          Talk smack, gloat, and cope — all in one place.
        </p>
      </div>

      <BanterWall />
    </div>
  );
}
