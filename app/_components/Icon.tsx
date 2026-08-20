// Xətti ikon dəsti — reference/prototype.html ilə eyni yol məlumatları.
// Feather/Lucide üslubunda, 24×24 viewBox, currentColor stroke.

export type IconName =
  | "scale"
  | "sheet"
  | "bank"
  | "receipt"
  | "file"
  | "users"
  | "building"
  | "shieldOk"
  | "shieldQ"
  | "shieldA"
  | "warn"
  | "ok"
  | "check"
  | "scan"
  | "chev";

const PATHS: Record<IconName, string> = {
  scale:
    "M16 16l3-8 3 8c-2 1.5-4 1.5-6 0 M2 16l3-8 3 8c-2 1.5-4 1.5-6 0 M7 21h10 M12 3v18 M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2",
  sheet: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M8 13h8M8 17h8M8 9h2",
  bank: "M3 21h18 M5 21V10l7-5 7 5v11 M9 21v-6h6v6",
  receipt: "M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z M8 7h8M8 11h8M8 15h5",
  file: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6",
  users:
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  building: "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z M9 6h6M9 10h6M9 14h6M9 18h6",
  shieldOk: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10 M9 12l2 2 4-4",
  shieldQ: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10 M9.5 9a2.5 2.5 0 1 1 3 2.4c-.6.2-1 .8-1 1.6 M12 16h.01",
  shieldA: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10 M12 8v4M12 15h.01",
  warn: "M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z M12 9v4M12 17h.01",
  ok: "M22 11.1V12a10 10 0 1 1-5.9-9.1 M9 11l3 3L22 4",
  check: "M20 6 9 17l-5-5",
  scan: "M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2 M7 12h10",
  chev: "m9 18 6-6-6-6",
};

// Çoxlu alt-yol olan ikonları ayırıb <path> kimi veririk ki, stroke düzgün işləsin.
function segments(d: string): string[] {
  return d.split(/\s(?=M)/);
}

export function Icon({
  name,
  size = 16,
  color = "currentColor",
  strokeWidth = 2,
}: {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {segments(PATHS[name]).map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
