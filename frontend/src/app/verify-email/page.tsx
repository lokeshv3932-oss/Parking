"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiGet, ApiError } from "@/lib/api";
import type { MessageResponse } from "@/lib/types";

function VerifyEmailContent() {
  const params = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }
    apiGet<MessageResponse>(`/api/customer/verify-email?token=${encodeURIComponent(token)}`)
      .then((res) => {
        setStatus("success");
        setMessage(res.message);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err instanceof ApiError ? err.message : "Verification failed.");
      });
  }, [token]);

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      {status === "loading" && <h1 className="text-2xl font-black">Verifying...</h1>}
      {status === "success" && (
        <>
          <h1 className="text-3xl font-black">Email Verified!</h1>
          <p className="mt-4 text-gray-600 dark:text-white/70">{message}</p>
          <Link href="/login" className="mt-6 inline-block text-brand-red hover:underline">
            Go to login
          </Link>
        </>
      )}
      {status === "error" && (
        <>
          <h1 className="text-3xl font-black">Verification Failed</h1>
          <p className="mt-4 text-gray-600 dark:text-white/70">{message}</p>
          <Link href="/login" className="mt-6 inline-block text-brand-red hover:underline">
            Go to login
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
