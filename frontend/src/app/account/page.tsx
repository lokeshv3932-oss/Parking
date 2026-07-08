"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet, ApiError } from "@/lib/api";
import { clearCustomerSession, getCustomerEmail, isCustomerLoggedIn } from "@/lib/customerAuth";
import type { BookingDto, BookingStatus, MechanicRequestDto } from "@/lib/types";

function formatMoney(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

const STATUS_COLORS: Record<BookingStatus, string> = {
  PENDING_PAYMENT: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400",
  CONFIRMED: "bg-green-500/20 text-green-700 dark:text-green-400",
  CANCELLED: "bg-black/5 text-gray-500 dark:bg-white/10 dark:text-white/50",
  EXPIRED: "bg-black/5 text-gray-400 dark:bg-white/10 dark:text-white/40",
};

export default function AccountPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [bookings, setBookings] = useState<BookingDto[] | null>(null);
  const [requests, setRequests] = useState<MechanicRequestDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isCustomerLoggedIn()) {
      router.replace("/login");
      return;
    }
    setChecked(true);

    apiGet<BookingDto[]>("/api/customer/me/bookings", "customer")
      .then(setBookings)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load bookings."));

    apiGet<MechanicRequestDto[]>("/api/customer/me/mechanic-requests", "customer")
      .then(setRequests)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load requests."));
  }, [router]);

  function handleLogout() {
    clearCustomerSession();
    router.replace("/");
  }

  if (!checked) {
    return null;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">My Account</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-white/50">{getCustomerEmail()}</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm font-semibold text-gray-500 hover:text-brand-red dark:text-white/60"
        >
          Log out
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-brand-red">{error}</p>}

      <section className="mt-10">
        <h2 className="text-xl font-bold">My Bookings</h2>
        <div className="mt-4 space-y-3">
          {bookings?.map((b) => (
            <div
              key={b.id}
              className="rounded-lg border border-black/10 bg-gray-50 p-4 dark:border-white/10 dark:bg-brand-charcoal"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold">
                    Spot {b.spotNumber} &middot; {b.spotType.replace("_", " ")}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-white/60">
                    {b.startDate} &rarr; {b.endDate}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`rounded px-2 py-1 text-xs font-semibold ${STATUS_COLORS[b.status]}`}>
                    {b.status.replace("_", " ")}
                  </span>
                  <span className="font-semibold text-brand-red">{formatMoney(b.amountCents)}</span>
                </div>
              </div>
            </div>
          ))}
          {bookings?.length === 0 && (
            <p className="text-gray-500 dark:text-white/50">No bookings yet.</p>
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold">My Mechanic Requests</h2>
        <div className="mt-4 space-y-3">
          {requests?.map((r) => (
            <div
              key={r.id}
              className="rounded-lg border border-black/10 bg-gray-50 p-4 dark:border-white/10 dark:bg-brand-charcoal"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold">{r.vehicleInfo}</p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-white/70">{r.issueDescription}</p>
                </div>
                <span className="rounded bg-black/5 px-2 py-1 text-xs font-semibold dark:bg-white/10">
                  {r.status.replace("_", " ")}
                </span>
              </div>
            </div>
          ))}
          {requests?.length === 0 && (
            <p className="text-gray-500 dark:text-white/50">No mechanic requests yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
