"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ConfirmationContent() {
  const params = useSearchParams();
  const bookingId = params.get("bookingId");
  const redirectStatus = params.get("redirect_status");

  const succeeded = redirectStatus === "succeeded";
  const processing = redirectStatus === "processing";

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      {succeeded && (
        <>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">Booking Confirmed!</h1>
          <p className="mt-4 text-gray-600 dark:text-white/70">
            Your payment was successful and your spot is reserved. A confirmation email will follow shortly.
          </p>
        </>
      )}
      {processing && (
        <>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">Payment Processing</h1>
          <p className="mt-4 text-gray-600 dark:text-white/70">
            We&apos;re confirming your payment now &mdash; this can take a moment. You&apos;ll receive an
            email once it&apos;s finalized.
          </p>
        </>
      )}
      {!succeeded && !processing && (
        <>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">Payment Not Completed</h1>
          <p className="mt-4 text-gray-600 dark:text-white/70">
            Something interrupted your payment. Your spot hold will release automatically if payment
            isn&apos;t completed &mdash; feel free to try booking again.
          </p>
        </>
      )}
      {bookingId && <p className="mt-4 text-sm text-gray-400 dark:text-white/40">Reference #{bookingId}</p>}
      <Link href="/" className="mt-8 inline-block text-brand-red hover:underline">
        Return home
      </Link>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmationContent />
    </Suspense>
  );
}
