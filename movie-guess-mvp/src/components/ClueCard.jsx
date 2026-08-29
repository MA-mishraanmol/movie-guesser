// Shared clue-reveal UI: progress-dot bar + the current tier's clue text.
// `children` (optional) renders between the dots and the clue box — used by multiplayer
// to inject a live countdown bar without duplicating this layout.
export default function ClueCard({ summaries, tierIndex, children }) {
  const totalTiers = summaries.length;
  const currentClue = summaries[tierIndex];

  return (
    <>
      <div className="mt-5 sm:mt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
            Clue {tierIndex + 1} of {totalTiers}
          </span>
        </div>
        <div className="flex gap-1.5">
          {summaries.map((s, i) => (
            <span
              key={s.tier}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                i <= tierIndex
                  ? "bg-gradient-to-r from-indigo-400 to-fuchsia-400 shadow-[0_0_8px_rgba(139,92,246,0.7)]"
                  : "bg-white/10"
              }`}
            />
          ))}
        </div>
      </div>

      {children}

      <div
        key={tierIndex}
        className="clue-fade-in mt-4 sm:mt-5 rounded-2xl bg-white/[0.03] border border-white/10 p-4 sm:p-6"
      >
        <p className="text-base sm:text-lg leading-relaxed text-slate-100 break-words">
          {currentClue.text}
        </p>
      </div>
    </>
  );
}
