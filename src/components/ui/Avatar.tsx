/* eslint-disable @next/next/no-img-element */
export function Avatar({ src, name, size = 36 }: { src?: string | null; name?: string | null; size?: number }) {
  const initials = (name || "?").trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  if (src) return <img src={src} alt="" width={size} height={size} className="shrink-0 rounded-full object-cover ring-1 ring-border" style={{ width: size, height: size }} />;
  return (
    <span className="grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent to-accent2 font-semibold text-white"
      style={{ width: size, height: size, fontSize: size * 0.38 }} aria-hidden="true">
      {initials}
    </span>
  );
}
