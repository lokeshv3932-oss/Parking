import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="border-b border-white/10 bg-brand-black/95 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex flex-col leading-tight">
          <span className="text-xl font-black tracking-wide text-white">
            SYMMES <span className="text-brand-red">FLEET</span>
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/50">
            Parking &amp; Repair — Fairfield, OH
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-semibold">
          <Link href="/book" className="hover:text-brand-red transition-colors">
            Book Parking
          </Link>
          <Link href="/mechanic-request" className="hover:text-brand-red transition-colors">
            Request a Mechanic
          </Link>
          <a
            href="tel:5133752022"
            className="rounded-md bg-brand-red px-4 py-2 text-white hover:bg-brand-red-dark transition-colors"
          >
            513-375-2022
          </a>
        </nav>
      </div>
    </header>
  );
}
