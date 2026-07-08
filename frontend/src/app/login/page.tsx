"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiPost, ApiError } from "@/lib/api";
import { saveCustomerSession } from "@/lib/customerAuth";
import type { CustomerAuthResponse, CustomerLoginRequest } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload: CustomerLoginRequest = { email, password };
      const res = await apiPost<CustomerAuthResponse>("/api/customer/login", payload);
      saveCustomerSession(res.token, res.email);
      router.push("/account");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4">
      <h1 className="text-2xl font-black">Log In</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-gray-700 dark:text-white/80">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-gray-700 dark:text-white/80">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
        </label>
        {error && <p className="text-sm text-brand-red">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-brand-red py-3 font-bold text-white hover:bg-brand-red-dark disabled:opacity-50 transition-colors"
        >
          {loading ? "Signing in..." : "Log In"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-500 dark:text-white/50">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-brand-red hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
