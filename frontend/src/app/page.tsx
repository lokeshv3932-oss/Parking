import Link from "next/link";

const FEATURES = [
  { title: "Fully Gated Property", desc: "Controlled access keeps your equipment secure around the clock." },
  { title: "24/7 Surveillance", desc: "Continuous camera coverage across the entire lot." },
  { title: "Fully Secured Parking", desc: "Dedicated spots for trucks, trailers, and fleet vehicles." },
  { title: "Mechanic Available", desc: "On-site repair services so downtime stays short." },
  { title: "Spacious Truck & Trailer Parking", desc: "300 spots built for heavy-duty vehicles." },
];

export default function HomePage() {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-brand-red">
          Fairfield, OH
        </p>
        <h1 className="text-4xl font-black leading-tight sm:text-6xl">
          Truck &amp; Trailer <span className="text-brand-red">Parking Available</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-white/70">
          Secure monthly parking for trucks, trailers, and fleet vehicles &mdash; premium full-concrete
          surface, no gravel.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/book"
            className="rounded-md bg-brand-red px-8 py-4 text-lg font-bold text-white hover:bg-brand-red-dark transition-colors"
          >
            Book Parking Online
          </Link>
          <Link
            href="/mechanic-request"
            className="rounded-md border border-black/20 px-8 py-4 text-lg font-bold text-gray-900 hover:border-brand-red hover:text-brand-red transition-colors dark:border-white/20 dark:text-white"
          >
            Request a Mechanic
          </Link>
        </div>
      </section>

      <section className="border-y border-black/10 bg-gray-50 py-16 dark:border-white/10 dark:bg-brand-charcoal">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:grid-cols-2 lg:grid-cols-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-lg border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-black/40"
            >
              <h3 className="mb-2 font-bold text-brand-red">{f.title}</h3>
              <p className="text-sm text-gray-600 dark:text-white/70">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h2 className="text-2xl font-bold">Premium Full-Concrete Parking Surface</h2>
        <p className="mx-auto mt-3 max-w-xl text-gray-600 dark:text-white/70">
          Built for cleaner, more reliable heavy-duty parking &mdash; no gravel, ever.
        </p>
        <div className="mt-8 rounded-lg border border-brand-red/40 bg-brand-red/10 p-6">
          <p className="text-lg font-semibold">Call today for availability</p>
          <a href="tel:5133752022" className="mt-2 block text-3xl font-black text-brand-red">
            513-375-2022
          </a>
          <p className="mt-2 text-sm text-gray-500 dark:text-white/60">4444 Symmes Rd, Fairfield, OH</p>
        </div>
      </section>
    </div>
  );
}
