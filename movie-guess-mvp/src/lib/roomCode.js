// Excludes visually ambiguous characters (0/O, 1/I/L) so codes are easy to read and type on a phone.
const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateRoomCode(length = 4) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

export function normalizeRoomCode(code) {
  return code.trim().toUpperCase();
}

// Fixed palette assigned to players in join order, no avatar assets required.
export const PLAYER_COLORS = [
  { name: "indigo", bg: "bg-indigo-600", text: "text-indigo-700", light: "bg-indigo-50" },
  { name: "rose", bg: "bg-rose-600", text: "text-rose-700", light: "bg-rose-50" },
  { name: "emerald", bg: "bg-emerald-600", text: "text-emerald-700", light: "bg-emerald-50" },
  { name: "amber", bg: "bg-amber-600", text: "text-amber-700", light: "bg-amber-50" },
  { name: "sky", bg: "bg-sky-600", text: "text-sky-700", light: "bg-sky-50" },
  { name: "fuchsia", bg: "bg-fuchsia-600", text: "text-fuchsia-700", light: "bg-fuchsia-50" },
  { name: "orange", bg: "bg-orange-600", text: "text-orange-700", light: "bg-orange-50" },
  { name: "teal", bg: "bg-teal-600", text: "text-teal-700", light: "bg-teal-50" },
];

export function colorForIndex(index) {
  return PLAYER_COLORS[index % PLAYER_COLORS.length];
}
