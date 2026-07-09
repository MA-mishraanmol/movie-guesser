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
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Clue {tierIndex + 1} of {totalTiers}
          </span>
        </div>
        <div className="flex gap-1.5">
          {summaries.map((s, i) => (
            <span
              key={s.tier}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= tierIndex ? "bg-indigo-600" : "bg-slate-200"
              }`}
            />
          ))}
        </div>
      </div>

      {children}

      <div
        key={tierIndex}
        className="clue-fade-in mt-4 sm:mt-5 rounded-xl bg-slate-50 border border-slate-200 p-4 sm:p-6"
      >
        <p className="text-base sm:text-lg leading-relaxed text-slate-800 break-words">
          {currentClue.text}
        </p>
      </div>
    </>
  );
}
