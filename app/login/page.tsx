"use client";

import Image from 'next/image';
import Link from 'next/link';
import { type FormEvent, useEffect, useState } from 'react';

function resolveNextPath(search: string) {
  const params = new URLSearchParams(search);
  const value = params.get('next');

  if (!value || !value.startsWith('/')) {
    return '/admin';
  }

  return value;
}

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [authConfigured, setAuthConfigured] = useState<boolean>(true);

  useEffect(() => {
    let active = true;

    async function loadSessionState() {
      try {
        const response = await fetch('/api/auth/session', { cache: 'no-store' });
        const payload = (await response.json().catch(() => ({}))) as { configured?: boolean };

        if (!active) {
          return;
        }

        setAuthConfigured(payload.configured !== false);
      } catch {
        if (active) {
          setAuthConfigured(true);
        }
      }
    }

    void loadSessionState();

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!authConfigured) {
      setError('Auth setup is incomplete. Add SESSION_SECRET and seed an admin account first.');
      return;
    }

    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const payload = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? 'Invalid credentials.');
        setLoading(false);
        return;
      }

      const nextPath = resolveNextPath(window.location.search);
      window.location.href = nextPath;
    } catch {
      setError('Login failed. Please try again.');
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-sm flex-col items-center justify-center px-5 py-10">
      <div className="mb-8 flex flex-col items-center gap-4 text-center">
        <Image
          src="/brand/dallas-ai-logo-white.png"
          alt="Dallas AI Direct"
          width={120}
          height={32}
          unoptimized
          className="h-8 w-auto"
        />
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Admin Login</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to manage Dallas AI Direct operations.</p>
        </div>
      </div>

      {!authConfigured ? (
        <p className="mb-4 w-full rounded-xl border border-border bg-card px-4 py-3 text-xs text-muted-foreground">
          Admin auth is not configured yet. Set `SESSION_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`, then run
          `npm run seed:admin`.
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
        {error ? (
          <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <label className="field">
          <span>Email</span>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="admin@dallas-ai.org"
            className="form-input"
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="Enter your password"
            className="form-input"
          />
        </label>

        <button type="submit" disabled={loading || !authConfigured} className="btn btn-primary mt-2 w-full">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        <Link href="/" className="focus-ring rounded-sm underline underline-offset-2 hover:text-foreground">
          Back to Dallas AI Direct
        </Link>
      </p>
    </section>
  );
}
