"use client";

import { useState } from "react";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function toDateString(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseDateString(s: string): Date | null {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isSameDay(a: Date | null, b: Date | null) {
  return !!a && !!b && a.getTime() === b.getTime();
}

interface DateRangeCalendarProps {
  startDate: string;
  endDate: string;
  onChange: (startDate: string, endDate: string) => void;
}

export default function DateRangeCalendar({ startDate, endDate, onChange }: DateRangeCalendarProps) {
  const today = startOfDay(new Date());
  const start = parseDateString(startDate);
  const end = parseDateString(endDate);
  const [viewMonth, setViewMonth] = useState(() => {
    const base = start ?? today;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  function isInRange(d: Date) {
    if (!start || !end) return false;
    return d.getTime() > start.getTime() && d.getTime() < end.getTime();
  }

  function handleDayClick(d: Date) {
    if (d.getTime() < today.getTime()) return;
    if (!start || end) {
      onChange(toDateString(d), "");
    } else if (d.getTime() <= start.getTime()) {
      onChange(toDateString(d), "");
    } else {
      onChange(toDateString(start), toDateString(d));
    }
  }

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, month, day));

  return (
    <div className="rounded-lg border border-black/10 bg-gray-50 p-4 dark:border-white/10 dark:bg-brand-charcoal">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setViewMonth(new Date(year, month - 1, 1))}
          className="rounded px-2 py-1 text-gray-500 hover:bg-black/5 hover:text-brand-red dark:text-white/60 dark:hover:bg-white/10"
          aria-label="Previous month"
        >
          &larr;
        </button>
        <span className="font-semibold">
          {viewMonth.toLocaleString("default", { month: "long", year: "numeric" })}
        </span>
        <button
          type="button"
          onClick={() => setViewMonth(new Date(year, month + 1, 1))}
          className="rounded px-2 py-1 text-gray-500 hover:bg-black/5 hover:text-brand-red dark:text-white/60 dark:hover:bg-white/10"
          aria-label="Next month"
        >
          &rarr;
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-xs text-gray-400 dark:text-white/40">
        {WEEKDAYS.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={`empty-${i}`} />;
          const disabled = d.getTime() < today.getTime();
          const selected = isSameDay(d, start) || isSameDay(d, end);
          const inRange = isInRange(d);
          return (
            <button
              type="button"
              key={d.getTime()}
              disabled={disabled}
              onClick={() => handleDayClick(d)}
              className={[
                "aspect-square rounded text-sm transition-colors",
                disabled
                  ? "cursor-not-allowed text-gray-300 dark:text-white/20"
                  : selected
                    ? "bg-brand-red font-semibold text-white"
                    : inRange
                      ? "bg-brand-red/20 text-gray-900 dark:text-white"
                      : "text-gray-700 hover:bg-black/5 dark:text-white/80 dark:hover:bg-white/10",
              ].join(" ")}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex justify-between text-xs text-gray-500 dark:text-white/50">
        <span>Start: {startDate || "—"}</span>
        <span>End: {endDate || "—"}</span>
      </div>
      {start && !end && <p className="mt-1 text-xs text-brand-red">Now pick an end date.</p>}
    </div>
  );
}
