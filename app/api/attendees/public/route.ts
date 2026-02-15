import { NextResponse } from 'next/server';
import { getDb, hasDatabaseUrl } from '../../../../lib/db/server';
import { resolveEventSessionForRequest } from '../../../../lib/event-session';

type PublicAttendeeRow = {
  name: string | null;
  title: string | null;
  company: string | null;
  linkedin_url: string | null;
  ai_comfort_level: number | null;
  help_offered: string[] | null;
  created_at: string | null;
};

export async function GET(request: Request) {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  try {
    const db = getDb();
    const url = new URL(request.url);
    const eventSlug = url.searchParams.get('event');

    const activeEvent = await resolveEventSessionForRequest(db, eventSlug);

    const rows = activeEvent
      ? await db<PublicAttendeeRow[]>`
          select
            name,
            title,
            company,
            linkedin_url,
            ai_comfort_level,
            help_offered,
            created_at
          from attendees_public
          where event_id = ${activeEvent.id}
             or event_id is null
          order by created_at desc
          limit 200
        `
      : await db<PublicAttendeeRow[]>`
          select
            name,
            title,
            company,
            linkedin_url,
            ai_comfort_level,
            help_offered,
            created_at
          from attendees_public
          where event_id is null
          order by created_at desc
          limit 200
        `;

    const data = rows.map((row) => ({
      name: typeof row.name === 'string' && row.name.trim().length > 0 ? row.name : 'Attendee',
      title: typeof row.title === 'string' ? row.title : undefined,
      company: typeof row.company === 'string' ? row.company : undefined,
      linkedin_url: typeof row.linkedin_url === 'string' ? row.linkedin_url : undefined,
      ai_comfort_level:
        typeof row.ai_comfort_level === 'number' && Number.isFinite(row.ai_comfort_level)
          ? Math.min(5, Math.max(1, row.ai_comfort_level))
          : 1,
      help_offered: Array.isArray(row.help_offered)
        ? row.help_offered.filter((value): value is string => typeof value === 'string')
        : [],
      created_at: typeof row.created_at === 'string' ? row.created_at : new Date().toISOString()
    }));

    const attendeeCount = data.length;
    const averageComfort =
      attendeeCount > 0
        ? Number((data.reduce((sum, attendee) => sum + attendee.ai_comfort_level, 0) / attendeeCount).toFixed(1))
        : 0;
    const highComfortPct =
      attendeeCount > 0
        ? Math.round((data.filter((attendee) => attendee.ai_comfort_level >= 4).length / attendeeCount) * 100)
        : 0;

    return NextResponse.json({
      data,
      event: activeEvent ? { id: activeEvent.id, slug: activeEvent.slug, name: activeEvent.name } : null,
      aggregates: {
        attendeeCount,
        averageComfort,
        highComfortPct
      }
    });
  } catch {
    return NextResponse.json({ error: 'Live room data unavailable' }, { status: 500 });
  }
}
