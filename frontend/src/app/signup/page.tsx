"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { apiPost, ApiError } from "@/lib/api";
import type { CustomerSignupRequest, MessageResponse } from "@/lib/types";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const payload: CustomerSignupRequest = { email, password };
      await apiPost<MessageResponse>("/api/customer/signup", payload);
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 text-center">
        <h1 className="text-2xl font-black">Check Your Email</h1>
        <p className="mt-4 text-gray-600 dark:text-white/70">
          We sent a verification link to <strong>{email}</strong>. Click it to activate your
          account, then come back and log in.
        </p>
        <Link href="/login" className="mt-6 text-brand-red hover:underline">
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4">
      <h1 className="text-2xl font-black">Create an Account</h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-white/70">
        Optional &mdash; you can still book parking or request a mechanic as a guest without an
        account.
      </p>
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
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-gray-700 dark:text-white/80">
            Confirm password
          </span>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input"
          />
        </label>
        {error && <p className="text-sm text-brand-red">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-brand-red py-3 font-bold text-white hover:bg-brand-red-dark disabled:opacity-50 transition-colors"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-500 dark:text-white/50">
        Already have an account?{" "}
        <Link href="/login" className="text-brand-red hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
