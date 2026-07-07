"use client";

import { useCallback, useEffect, useState } from "react";
import { apiGet, apiPatch, ApiError } from "@/lib/api";
import type { BookingDto, BookingStatus, PageResponse } from "@/lib/types";

const STATUS_OPTIONS: { value: BookingStatus | ""; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "PENDING_PAYMENT", label: "Pending Payment" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "EXPIRED", label: "Expired" },
];

function formatMoney(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function AdminBookingsPage() {
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "">("");
  const [page, setPage] = useState<PageResponse<BookingDto> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const load = useCallback(() => {
    const params = new URLSearchParams({ page: "0", size: "50" });
    if (statusFilter) params.set("status", statusFilter);
    apiGet<PageResponse<BookingDto>>(`/api/admin/bookings?${params.toString()}`, true)
      .then(setPage)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load bookings."));
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(id: number, status: BookingStatus) {
    setUpdatingId(id);
    try {
      await apiPatch(`/api/admin/bookings/${id}`, { status }, true);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update booking.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">Bookings</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as BookingStatus | "")}
          className="input w-56"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="mt-4 text-sm text-brand-red">{error}</p>}

      <div className="mt-6 overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 dark:bg-brand-charcoal dark:text-white/60">
            <tr>
              <th className="px-4 py-3">Spot</th>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {page?.content.map((booking) => (
              <tr key={booking.id} className="border-t border-black/10 dark:border-white/10">
                <td className="px-4 py-3 font-semibold">{booking.spotNumber}</td>
                <td className="px-4 py-3">
                  {booking.startDate} &rarr; {booking.endDate}
                </td>
                <td className="px-4 py-3">
                  <div>{booking.customerName}</div>
                  <div className="text-gray-400 dark:text-white/40">{booking.customerEmail}</div>
                </td>
                <td className="px-4 py-3">{formatMoney(booking.amountCents)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={booking.status} />
                </td>
                <td className="px-4 py-3">
                  {booking.status !== "CANCELLED" && (
                    <button
                      disabled={updatingId === booking.id}
                      onClick={() => updateStatus(booking.id, "CANCELLED")}
                      className="text-xs font-semibold text-brand-red hover:underline disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {page?.content.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500 dark:text-white/50">
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const colors: Record<BookingStatus, string> = {
    PENDING_PAYMENT: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400",
    CONFIRMED: "bg-green-500/20 text-green-700 dark:text-green-400",
    CANCELLED: "bg-black/5 text-gray-500 dark:bg-white/10 dark:text-white/50",
    EXPIRED: "bg-black/5 text-gray-400 dark:bg-white/10 dark:text-white/40",
  };
  return (
    <span className={`rounded px-2 py-1 text-xs font-semibold ${colors[status]}`}>
      {status.replace("_", " ")}
    </span>
  );
}
