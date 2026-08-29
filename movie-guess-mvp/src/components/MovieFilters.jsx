import { ORIGIN_OPTIONS, ERA_OPTIONS } from "../lib/movieFilters";

function FilterPill({ active, onClick, emoji, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs sm:text-sm font-medium transition-all duration-300 ${
        active
          ? "bg-gradient-to-r from-indigo-500 to-fuchsia-500 border-transparent text-white shadow-[0_0_16px_-2px_rgba(139,92,246,0.7)]"
          : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200"
      }`}
    >
      <span>{emoji}</span>
      {label}
    </button>
  );
}

// Pill-based filter bar for narrowing the movie pool by origin (Desi vs Firangi) and
// era (VHS Vibes vs Y2K+). Selecting nothing in a group means "no filter" on that group.
export default function MovieFilters({
  origins,
  eras,
  onToggleOrigin,
  onToggleEra,
  matchCount,
}) {
  return (
    <div className="mt-4 sm:mt-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
          Filters
        </p>
        {typeof matchCount === "number" && (
          <span className="text-xs text-slate-500 tabular-nums">
            {matchCount} {matchCount === 1 ? "movie" : "movies"}
          </span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {ORIGIN_OPTIONS.map((opt) => (
          <FilterPill
            key={opt.value}
            emoji={opt.emoji}
            label={opt.label}
            active={origins.includes(opt.value)}
            onClick={() => onToggleOrigin(opt.value)}
          />
        ))}

        <span className="w-px self-stretch bg-white/10 mx-0.5 hidden sm:block" />

        {ERA_OPTIONS.map((opt) => (
          <FilterPill
            key={opt.value}
            emoji={opt.emoji}
            label={opt.label}
            active={eras.includes(opt.value)}
            onClick={() => onToggleEra(opt.value)}
          />
        ))}
      </div>
    </div>
  );
}
