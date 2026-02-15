"use client";

import Link from 'next/link';
import { type FormEvent, useState } from 'react';

/** Multi-select options for help_needed and help_offered fields (mirrors data model) */
const HELP_OPTIONS = ['Hiring', 'Mentoring', 'Partnering', 'Investing', 'Learning', 'Selling', 'Other'];

function normalizeOptionalText(value: FormDataEntryValue | null) {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toStringArray(values: FormDataEntryValue[]) {
  return values.filter((value): value is string => typeof value === 'string');
}

export default function SignupPage() {
  const [status, setStatus] = useState<{ type: 'idle' | 'submitting' | 'success' | 'error'; message?: string }>({
    type: 'idle'
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const honeypot = typeof formData.get('honeypot') === 'string' ? String(formData.get('honeypot')).trim() : '';

    if (honeypot.length > 0) {
      setStatus({
        type: 'success',
        message: 'Thanks for joining. Your signup has been received.'
      });
      form.reset();
      return;
    }

    const payload = {
      name: String(formData.get('name') ?? '').trim(),
      email: String(formData.get('email') ?? '').trim(),
      linkedin_url: normalizeOptionalText(formData.get('linkedin_url')),
      title: normalizeOptionalText(formData.get('title')),
      company: normalizeOptionalText(formData.get('company')),
      display_title_company: formData.get('display_title_company') === 'on',
      ai_comfort_level: Number(formData.get('ai_comfort_level') ?? 3),
      help_needed: toStringArray(formData.getAll('help_needed')),
      help_offered: toStringArray(formData.getAll('help_offered')),
      honeypot: '',
      other_help_needed: null,
      other_help_offered: null
    };

    setStatus({ type: 'submitting' });

    try {
      const response = await fetch('/api/attendees/signup', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setStatus({
          type: 'error',
          message: result.error ?? 'Signup failed. Please try again in a moment.'
        });
        return;
      }

      setStatus({
        type: 'success',
        message: 'Signup complete. You should appear on the room board shortly.'
      });
      form.reset();
    } catch {
      setStatus({
        type: 'error',
        message: 'Signup failed. Please try again in a moment.'
      });
    }
  }

  return (
    <section className="pageCard stack">
      <h2 className="pageTitle">Attendee signup</h2>
      <p className="muted">Complete this form to appear on the room board with public-safe fields.</p>
      <form className="stack" onSubmit={handleSubmit}>
        {/* Honeypot field – hidden from users, must remain empty to pass validation */}
        <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }}>
          <label htmlFor="website">Website</label>
          <input id="website" name="honeypot" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="gridTwo">
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" type="text" placeholder="Your name" required />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="you@company.com" required />
            <p className="helper">Email stays private and is never displayed publicly on the room board.</p>
          </div>
        </div>

        <div className="gridTwo">
          <div className="field">
            <label htmlFor="comfort">AI comfort level (1-5)</label>
            <select id="comfort" name="ai_comfort_level" defaultValue="3" required>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="linkedin">LinkedIn URL (optional)</label>
            <input id="linkedin" name="linkedin_url" type="url" placeholder="https://linkedin.com/in/..." />
          </div>
        </div>

        <div className="gridTwo">
          <fieldset className="field">
            <legend>What help do you need?</legend>
            {HELP_OPTIONS.map((opt) => (
              <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                <input type="checkbox" name="help_needed" value={opt} />
                {opt}
              </label>
            ))}
          </fieldset>
          <fieldset className="field">
            <legend>What help can you offer?</legend>
            {HELP_OPTIONS.map((opt) => (
              <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                <input type="checkbox" name="help_offered" value={opt} />
                {opt}
              </label>
            ))}
          </fieldset>
        </div>

        <div className="gridTwo">
          <div className="field">
            <label htmlFor="title">Title (optional)</label>
            <input id="title" name="title" type="text" placeholder="Your job title" />
          </div>
          <div className="field">
            <label htmlFor="company">Company (optional)</label>
            <input id="company" name="company" type="text" placeholder="Your company" />
          </div>
        </div>

        <div className="field">
          <label htmlFor="displayTitleCompany">
            <input
              id="displayTitleCompany"
              name="display_title_company"
              type="checkbox"
              defaultChecked={false}
              style={{ marginRight: 8 }}
            />
            Display my title and company on the public room board.
          </label>
        </div>

        {status.type !== 'idle' ? (
          <p className="helper" role={status.type === 'error' ? 'alert' : 'status'}>
            {status.type === 'submitting' ? 'Submitting...' : status.message}
          </p>
        ) : null}

        <div className="ctaRow">
          <button className="button" type="submit" disabled={status.type === 'submitting'}>
            {status.type === 'submitting' ? 'Submitting...' : 'Submit signup'}
          </button>
          <Link className="buttonSecondary" href="/room">
            View the room
          </Link>
        </div>
      </form>
    </section>
  );
}
