"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { isCustomerLoggedIn } from "@/lib/customerAuth";

export default function SiteHeader() {
  const [mounted, setMounted] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLoggedIn(isCustomerLoggedIn());
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-white/95 backdrop-blur dark:border-white/10 dark:bg-brand-black/95">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex flex-col leading-tight">
          <span className="text-xl font-black tracking-wide text-gray-900 dark:text-white">
            SYMMES <span className="text-brand-red">FLEET</span>
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 dark:text-white/50">
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
          {mounted && (
            <Link href={loggedIn ? "/account" : "/login"} className="hover:text-brand-red transition-colors">
              {loggedIn ? "My Account" : "Log In"}
            </Link>
          )}
          <a
            href="tel:5133752022"
            className="rounded-md bg-brand-red px-4 py-2 text-white hover:bg-brand-red-dark transition-colors"
          >
            513-375-2022
          </a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
