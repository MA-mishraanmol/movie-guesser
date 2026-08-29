import { ORIGIN_OPTIONS, ERA_OPTIONS } from "../lib/movieFilters";

function FilterPill({ active, onClick, emoji, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs sm:text-sm font-medium transition ${
        active
          ? "bg-indigo-600 border-indigo-600 text-white"
          : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50 active:bg-slate-100"
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
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Filters
        </p>
        {typeof matchCount === "number" && (
          <span className="text-xs text-slate-400">
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

        <span className="w-px self-stretch bg-slate-200 mx-0.5 hidden sm:block" />

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
