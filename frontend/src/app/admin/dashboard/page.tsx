"use client";

import { useEffect, useState } from "react";
import { apiGet, ApiError } from "@/lib/api";
import type { DashboardSummary } from "@/lib/types";

const TILES: { key: keyof DashboardSummary; label: string }[] = [
  { key: "totalSpots", label: "Total Spots" },
  { key: "occupiedSpots", label: "Occupied Today" },
  { key: "availableSpots", label: "Available Today" },
  { key: "confirmedBookings", label: "Confirmed Bookings" },
  { key: "pendingPaymentBookings", label: "Awaiting Payment" },
  { key: "pendingMechanicRequests", label: "Pending Mechanic Requests" },
];

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<DashboardSummary>("/api/admin/dashboard/summary", true)
      .then(setSummary)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load dashboard."));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-black">Dashboard</h1>
      {error && <p className="mt-4 text-sm text-brand-red">{error}</p>}
      {summary && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TILES.map((tile) => (
            <div key={tile.key} className="rounded-lg border border-white/10 bg-brand-charcoal p-5">
              <p className="text-xs uppercase tracking-wide text-white/50">{tile.label}</p>
              <p className="mt-2 text-3xl font-black text-brand-red">{summary[tile.key]}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
