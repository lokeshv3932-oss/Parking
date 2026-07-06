"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { clearToken, isLoggedIn } from "@/lib/auth";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/mechanic-requests", label: "Mechanic Requests" },
  { href: "/admin/spots", label: "Spots" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setChecked(true);
      return;
    }
    if (!isLoggedIn()) {
      router.replace("/admin/login");
      return;
    }
    setChecked(true);
  }, [isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!checked) {
    return null;
  }

  function handleLogout() {
    clearToken();
    router.replace("/admin/login");
  }

  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-4 py-10">
      <aside className="w-48 shrink-0">
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                pathname === item.href
                  ? "bg-brand-red text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="mt-4 block w-full rounded-md px-3 py-2 text-left text-sm font-semibold text-white/50 hover:bg-white/5 hover:text-brand-red"
          >
            Log out
          </button>
        </nav>
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  );
}
