"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

/**
 * Admin login form.
 */
export default function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";

  const [email, setEmail] = useState("admin@nirvanayogaschoolindia.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setError(body.error ?? "Login failed");
      setLoading(false);
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <div
      className="admin-card"
      style={{ maxWidth: "28rem", margin: "4rem auto" }}
    >
      <h1 className="admin-title">Admin login</h1>
      <p className="admin-subtitle">Sign in to manage website content.</p>

      <form onSubmit={onSubmit}>
        <div className="admin-field">
          <label className="admin-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="admin-input"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div className="admin-field">
          <label className="admin-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            className="admin-input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        {error ? <p className="admin-error">{error}</p> : null}
        <button className="admin-btn" type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
