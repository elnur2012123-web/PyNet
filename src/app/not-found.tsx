import { T } from "@/components/i18n/T";
import Link from "next/link";
import { LogoMark } from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <main id="main" className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <LogoMark size={44} />
      <p className="mt-6 font-mono text-sm text-danger"><T k="NameError: name 'page' is not defined" /></p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight"><T k="Page not found" /></h1>
      <p className="mt-2 max-w-md text-muted"><T k="The page you're looking for doesn't exist or has moved." /></p>
      <div className="mt-6 flex gap-3"><Link href="/" className="btn-secondary"><T k="Home" /></Link><Link href="/learn" className="btn-primary"><T k="Go to the course" /></Link></div>
    </main>
  );
}
