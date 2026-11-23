import Link from "next/link";

/** PyNest mark: a nest (two woven arcs) cradling a glowing egg. */
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="pn-g" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="rgb(var(--accent))" />
          <stop offset="1" stopColor="rgb(var(--accent2))" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#pn-g)" />
      <ellipse cx="16" cy="13.2" rx="4.3" ry="5.2" fill="white" />
      <path d="M6.5 16.5c2.2 5.6 6.2 8 9.5 8s7.3-2.4 9.5-8" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M8.5 20.2c2.6 1.6 4.9 2.2 7.5 2.2s4.9-.6 7.5-2.2" stroke="white" strokeOpacity=".6" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 font-semibold tracking-tight" aria-label="PyNest home">
      <LogoMark />
      <span className="text-[17px]">
        Py<span className="text-accent">Nest</span>
      </span>
    </Link>
  );
}
