import { Loader2 } from "lucide-react";

export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return <Loader2 className={`animate-spin ${className}`} aria-label="Loading" />;
}

export function EmptyState({ icon, title, body, action }: { icon?: React.ReactNode; title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border px-6 py-12 text-center">
      {icon && <div className="mb-3 text-muted">{icon}</div>}
      <p className="font-medium">{title}</p>
      {body && <p className="mt-1 max-w-sm text-sm text-muted">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-elevated ${className}`} />;
}

export function Notice({ kind = "info", title, children }: { kind?: "info" | "warn" | "error" | "success"; title?: string; children: React.ReactNode }) {
  const tone = { info: "border-accent/30 bg-accent/5", warn: "border-warn/40 bg-warn/10", error: "border-danger/40 bg-danger/10", success: "border-success/40 bg-success/10" }[kind];
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${tone}`} role={kind === "error" ? "alert" : "status"}>
      {title && <p className="mb-0.5 font-semibold">{title}</p>}
      <div className="text-fg/90">{children}</div>
    </div>
  );
}
