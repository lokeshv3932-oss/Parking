"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPatch, ApiError } from "@/lib/api";
import type { SpotDto, SpotType } from "@/lib/types";

const TYPE_FILTERS: { value: SpotType | ""; label: string }[] = [
  { value: "", label: "All types" },
  { value: "TRUCK", label: "Truck" },
  { value: "TRAILER", label: "Trailer" },
  { value: "FLEET_VEHICLE", label: "Fleet Vehicle" },
];

export default function AdminSpotsPage() {
  const [spots, setSpots] = useState<SpotDto[]>([]);
  const [typeFilter, setTypeFilter] = useState<SpotType | "">("");
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  function load() {
    apiGet<SpotDto[]>("/api/admin/spots", true)
      .then(setSpots)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load spots."));
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleActive(spot: SpotDto) {
    setUpdatingId(spot.id);
    try {
      await apiPatch(`/api/admin/spots/${spot.id}`, { active: !spot.active }, true);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update spot.");
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered = useMemo(
    () => (typeFilter ? spots.filter((s) => s.spotType === typeFilter) : spots),
    [spots, typeFilter]
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">Spots ({spots.length})</h1>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as SpotType | "")}
          className="input w-56"
        >
          {TYPE_FILTERS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="mt-4 text-sm text-brand-red">{error}</p>}

      <div className="mt-6 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-10">
        {filtered.map((spot) => (
          <button
            key={spot.id}
            disabled={updatingId === spot.id}
            onClick={() => toggleActive(spot)}
            title={`${spot.spotType} - click to ${spot.active ? "mark maintenance" : "reactivate"}`}
            className={`rounded-md border p-2 text-center text-xs font-semibold transition-colors disabled:opacity-50 ${
              spot.active
                ? "border-black/10 bg-gray-50 hover:border-brand-red dark:border-white/10 dark:bg-brand-charcoal"
                : "border-yellow-500/40 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
            }`}
          >
            {spot.spotNumber}
          </button>
        ))}
      </div>
      <p className="mt-4 text-xs text-gray-400 dark:text-white/40">
        Click a spot to toggle between active and maintenance mode. Yellow = maintenance (excluded from
        availability).
      </p>
    </div>
  );
}
