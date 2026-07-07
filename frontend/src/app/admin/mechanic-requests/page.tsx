"use client";

import { useCallback, useEffect, useState } from "react";
import { apiGet, apiPatch, ApiError } from "@/lib/api";
import type { MechanicRequestDto, MechanicRequestStatus, PageResponse } from "@/lib/types";

const STATUS_OPTIONS: { value: MechanicRequestStatus | ""; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
];

const NEXT_STATUS: Record<MechanicRequestStatus, MechanicRequestStatus | null> = {
  PENDING: "SCHEDULED",
  SCHEDULED: "IN_PROGRESS",
  IN_PROGRESS: "COMPLETED",
  COMPLETED: null,
};

export default function AdminMechanicRequestsPage() {
  const [statusFilter, setStatusFilter] = useState<MechanicRequestStatus | "">("");
  const [page, setPage] = useState<PageResponse<MechanicRequestDto> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const load = useCallback(() => {
    const params = new URLSearchParams({ page: "0", size: "50" });
    if (statusFilter) params.set("status", statusFilter);
    apiGet<PageResponse<MechanicRequestDto>>(`/api/admin/mechanic-requests?${params.toString()}`, true)
      .then(setPage)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load requests."));
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function advance(id: number, next: MechanicRequestStatus) {
    setUpdatingId(id);
    try {
      await apiPatch(`/api/admin/mechanic-requests/${id}`, { status: next }, true);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update request.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">Mechanic Requests</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as MechanicRequestStatus | "")}
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

      <div className="mt-6 space-y-3">
        {page?.content.map((req) => {
          const next = NEXT_STATUS[req.status];
          return (
            <div key={req.id} className="rounded-lg border border-black/10 bg-gray-50 p-4 dark:border-white/10 dark:bg-brand-charcoal">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold">
                    {req.customerName} &middot; {req.vehicleInfo}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-white/60">
                    {req.customerPhone} &middot; {req.customerEmail}
                  </p>
                  <p className="mt-2 text-sm text-gray-700 dark:text-white/80">{req.issueDescription}</p>
                  {req.preferredDate && (
                    <p className="mt-1 text-xs text-gray-400 dark:text-white/40">Preferred: {req.preferredDate}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="rounded bg-black/5 px-2 py-1 text-xs font-semibold dark:bg-white/10">
                    {req.status.replace("_", " ")}
                  </span>
                  {next && (
                    <button
                      disabled={updatingId === req.id}
                      onClick={() => advance(req.id, next)}
                      className="text-xs font-semibold text-brand-red hover:underline disabled:opacity-50"
                    >
                      Mark {next.replace("_", " ")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {page?.content.length === 0 && <p className="text-gray-500 dark:text-white/50">No mechanic requests found.</p>}
      </div>
    </div>
  );
}
