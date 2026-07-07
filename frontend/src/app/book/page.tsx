"use client";

import { useState, FormEvent } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { apiGet, apiPost, ApiError } from "@/lib/api";
import { getStripe } from "@/lib/stripe";
import type { CreateBookingRequest, CreateBookingResponse, SpotDto, SpotType } from "@/lib/types";
import CheckoutForm from "@/components/CheckoutForm";
import DateRangeCalendar from "@/components/DateRangeCalendar";

const SPOT_TYPES: { value: SpotType | ""; label: string }[] = [
  { value: "", label: "Any type" },
  { value: "TRUCK", label: "Truck" },
  { value: "TRAILER", label: "Trailer" },
  { value: "FLEET_VEHICLE", label: "Fleet Vehicle" },
];

function formatMoney(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

type Step = "search" | "select" | "details" | "pay";

export default function BookPage() {
  const [step, setStep] = useState<Step>("search");
  const [typeFilter, setTypeFilter] = useState<SpotType | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [spots, setSpots] = useState<SpotDto[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<SpotDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [vehicleInfo, setVehicleInfo] = useState("");

  const [booking, setBooking] = useState<CreateBookingResponse | null>(null);

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ start: startDate, end: endDate });
      const results = await apiGet<SpotDto[]>(`/api/spots/availability?${params.toString()}`);
      setSpots(results);
      setTypeFilter("");
      setStep("select");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to search availability.");
    } finally {
      setLoading(false);
    }
  }

  function selectSpot(spot: SpotDto) {
    setSelectedSpot(spot);
    setStep("details");
  }

  async function handleCreateBooking(e: FormEvent) {
    e.preventDefault();
    if (!selectedSpot) return;
    setLoading(true);
    setError(null);
    try {
      const payload: CreateBookingRequest = {
        spotId: selectedSpot.id,
        startDate,
        endDate,
        customerName,
        customerEmail,
        customerPhone: customerPhone || undefined,
        vehicleInfo: vehicleInfo || undefined,
      };
      const created = await apiPost<CreateBookingResponse>("/api/bookings", payload);
      setBooking(created);
      setStep("pay");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Unable to start booking. Please try a different spot or dates."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-black">Book Parking</h1>
      <p className="mt-2 text-gray-600 dark:text-white/70">Reserve a spot online and pay securely to confirm instantly.</p>

      <StepIndicator step={step} />

      {step === "search" && (
        <form onSubmit={handleSearch} className="mx-auto mt-8 max-w-xl space-y-5">
          <div>
            <span className="mb-1 block text-sm font-semibold text-gray-700 dark:text-white/80">Select your dates</span>
            <DateRangeCalendar
              startDate={startDate}
              endDate={endDate}
              onChange={(start, end) => {
                setStartDate(start);
                setEndDate(end);
              }}
            />
          </div>
          {error && <p className="text-sm text-brand-red">{error}</p>}
          <button
            type="submit"
            disabled={loading || !startDate || !endDate}
            className="w-full rounded-md bg-brand-red py-3 font-bold text-white hover:bg-brand-red-dark disabled:opacity-50 transition-colors"
          >
            {loading ? "Searching..." : "Check Availability"}
          </button>
        </form>
      )}

      {step === "select" && (
        <div className="mt-8">
          <button onClick={() => setStep("search")} className="mb-4 text-sm text-gray-500 hover:text-brand-red dark:text-white/60">
            &larr; Change dates
          </button>

          <label className="mb-4 block max-w-xs">
            <span className="mb-1 block text-sm font-semibold text-gray-700 dark:text-white/80">Filter by vehicle type</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as SpotType | "")}
              className="input"
            >
              {SPOT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>

          {(() => {
            const filteredSpots = typeFilter ? spots.filter((s) => s.spotType === typeFilter) : spots;
            if (spots.length === 0) {
              return <p className="text-gray-600 dark:text-white/70">No spots available for those dates. Try a different range.</p>;
            }
            if (filteredSpots.length === 0) {
              return <p className="text-gray-600 dark:text-white/70">No {typeFilter.replace("_", " ").toLowerCase()} spots available for those dates.</p>;
            }
            return (
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
                {filteredSpots.map((spot) => (
                  <button
                    key={spot.id}
                    onClick={() => selectSpot(spot)}
                    title={`${spot.spotType.replace("_", " ")} · ${formatMoney(spot.dailyRateCents)}/day`}
                    className="rounded-md border border-black/10 bg-gray-50 p-2 text-center hover:border-brand-red dark:border-white/10 dark:bg-brand-charcoal transition-colors"
                  >
                    <p className="text-sm font-bold">{spot.spotNumber}</p>
                    <p className="text-[10px] font-semibold text-brand-red">{formatMoney(spot.dailyRateCents)}</p>
                  </button>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {step === "details" && selectedSpot && (
        <form onSubmit={handleCreateBooking} className="mx-auto mt-8 max-w-xl space-y-5">
          <button
            type="button"
            onClick={() => setStep("select")}
            className="mb-2 text-sm text-gray-500 hover:text-brand-red dark:text-white/60"
          >
            &larr; Choose a different spot
          </button>
          <div className="rounded-lg border border-brand-red/40 bg-brand-red/10 p-4 text-sm">
            Spot <strong>{selectedSpot.spotNumber}</strong> &middot; {startDate} to {endDate}
          </div>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-gray-700 dark:text-white/80">Full name</span>
            <input required value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="input" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-gray-700 dark:text-white/80">Email</span>
            <input
              type="email"
              required
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="input"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-gray-700 dark:text-white/80">Phone</span>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="input"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-gray-700 dark:text-white/80">Vehicle (make/model/plate)</span>
            <input value={vehicleInfo} onChange={(e) => setVehicleInfo(e.target.value)} className="input" />
          </label>
          {error && <p className="text-sm text-brand-red">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-brand-red py-3 font-bold text-white hover:bg-brand-red-dark disabled:opacity-50 transition-colors"
          >
            {loading ? "Preparing checkout..." : "Continue to Payment"}
          </button>
        </form>
      )}

      {step === "pay" && booking && (
        <div className="mx-auto mt-8 max-w-xl">
          <p className="mb-4 rounded-lg border border-brand-red/40 bg-brand-red/10 p-4 text-sm">
            Total due: <strong>{formatMoney(booking.amountCents)}</strong> &mdash; your spot is held for 15
            minutes while you complete payment.
          </p>
          <Elements stripe={getStripe()} options={{ clientSecret: booking.clientSecret }}>
            <CheckoutForm bookingId={booking.bookingId} />
          </Elements>
        </div>
      )}
    </div>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: "search", label: "Dates" },
    { key: "select", label: "Spot" },
    { key: "details", label: "Details" },
    { key: "pay", label: "Payment" },
  ];
  const activeIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="mt-6 flex gap-2 text-xs font-semibold uppercase tracking-wide">
      {steps.map((s, i) => (
        <span key={s.key} className={i <= activeIndex ? "text-brand-red" : "text-gray-300 dark:text-white/30"}>
          {s.label}
          {i < steps.length - 1 && <span className="mx-2 text-gray-200 dark:text-white/20">/</span>}
        </span>
      ))}
    </div>
  );
}
