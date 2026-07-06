export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-brand-black py-8 text-sm text-white/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 text-center">
        <p className="font-semibold text-white">Symmes Fleet Parking &amp; Repair</p>
        <p>4444 Symmes Rd, Fairfield, OH</p>
        <p>
          <a href="tel:5133752022" className="hover:text-brand-red">
            513-375-2022
          </a>
        </p>
        <p className="mt-2 text-xs text-white/40">
          &copy; {new Date().getFullYear()} Symmes Fleet Parking &amp; Repair. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
