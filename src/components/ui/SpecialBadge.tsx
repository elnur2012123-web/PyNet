/** Unique badge for special accounts (e.g. the Founder). Granted only from the database. */
export function SpecialBadge({ title, size = 36, showLabel = false }: { title: string; size?: number; showLabel?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2" title={title}>
      <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
        <defs>
          <linearGradient id="sp-g" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffe08a" /><stop offset=".5" stopColor="#f5b301" /><stop offset="1" stopColor="#b06ab3" />
          </linearGradient>
        </defs>
        <path d="M20 2l15 6v11c0 9.5-6.4 16.4-15 19C11.4 35.4 5 28.5 5 19V8l15-6z" fill="url(#sp-g)" />
        <path d="M11 24l2-10 5 5 2-7 2 7 5-5 2 10H11z" fill="white" />
        <rect x="11" y="25.5" width="18" height="2.6" rx="1.3" fill="white" />
      </svg>
      {showLabel && <span className="bg-gradient-to-r from-[#f5b301] to-[#b06ab3] bg-clip-text text-sm font-bold text-transparent">{title}</span>}
    </span>
  );
}

export function SpecialChip({ title }: { title: string }) {
  return (
    <span className="inline-flex items-center rounded-md bg-gradient-to-r from-[#f5b301] to-[#b06ab3] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">{title}</span>
  );
}
