"use client";

import { useState, FormEvent } from "react";
import { apiPost, ApiError } from "@/lib/api";
import type { MechanicRequestCreateRequest, MechanicRequestDto } from "@/lib/types";

const initialForm: MechanicRequestCreateRequest = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  vehicleInfo: "",
  issueDescription: "",
  preferredDate: "",
};

export default function MechanicRequestPage() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MechanicRequestDto | null>(null);

  function update<K extends keyof MechanicRequestCreateRequest>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload: MechanicRequestCreateRequest = {
        ...form,
        preferredDate: form.preferredDate ? form.preferredDate : undefined,
      };
      const created = await apiPost<MechanicRequestDto>("/api/mechanic-requests", payload, "customer");
      setResult(created);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-3xl font-black">Request Received</h1>
        <p className="mt-4 text-gray-600 dark:text-white/70">
          Thanks, {result.customerName}. Our team will reach out at {result.customerPhone} to schedule
          your mechanic visit.
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-white/50">Reference #{result.id}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="text-3xl font-black">Request a Mechanic</h1>
      <p className="mt-2 text-gray-600 dark:text-white/70">
        Tell us about the issue and we&apos;ll get back to you to schedule a visit.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <Field label="Full name" required>
          <input
            required
            value={form.customerName}
            onChange={(e) => update("customerName", e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Email" required>
          <input
            type="email"
            required
            value={form.customerEmail}
            onChange={(e) => update("customerEmail", e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Phone" required>
          <input
            type="tel"
            required
            value={form.customerPhone}
            onChange={(e) => update("customerPhone", e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Vehicle (make/model/plate)" required>
          <input
            required
            value={form.vehicleInfo}
            onChange={(e) => update("vehicleInfo", e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Describe the issue" required>
          <textarea
            required
            rows={4}
            value={form.issueDescription}
            onChange={(e) => update("issueDescription", e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Preferred date (optional)">
          <input
            type="date"
            value={form.preferredDate}
            onChange={(e) => update("preferredDate", e.target.value)}
            className="input"
          />
        </Field>

        {error && <p className="text-sm text-brand-red">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-brand-red py-3 font-bold text-white hover:bg-brand-red-dark disabled:opacity-50 transition-colors"
        >
          {submitting ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-gray-700 dark:text-white/80">
        {label}
        {required && <span className="text-brand-red"> *</span>}
      </span>
      {children}
    </label>
  );
}
