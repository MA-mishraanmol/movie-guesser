// Fixed, ambient backdrop mounted once at the app root — three slow-drifting blurred
// color fields over a near-black base, plus a faint grid for texture. Every screen sits
// on top of this instead of carrying its own background, so it never flickers between views.
export default function AuroraBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#05060a]">
      <div
        className="absolute -top-1/4 -left-1/4 h-[60vw] w-[60vw] rounded-full bg-indigo-600/30 blur-[120px] animate-aurora1"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-1/3 -right-1/4 h-[55vw] w-[55vw] rounded-full bg-fuchsia-600/20 blur-[120px] animate-aurora2"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/3 right-1/4 h-[40vw] w-[40vw] rounded-full bg-cyan-500/20 blur-[120px] animate-aurora3"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#05060a]" />
    </div>
  );
}
