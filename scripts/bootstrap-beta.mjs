import { neon } from '@neondatabase/serverless';

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    fail(`Missing required env var ${name}`);
  }

  return value;
}

function optionalEnv(name) {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : null;
}

const DATABASE_URL = requireEnv('DATABASE_URL');
const SESSION_SECRET = requireEnv('SESSION_SECRET');
const ADMIN_EMAIL = requireEnv('ADMIN_EMAIL');
const ADMIN_PASSWORD = requireEnv('ADMIN_PASSWORD');

if (SESSION_SECRET.length < 32) {
  fail('SESSION_SECRET must be at least 32 characters.');
}

if (ADMIN_PASSWORD.length < 12) {
  fail('ADMIN_PASSWORD must be at least 12 characters.');
}

const attendeeAuthRequired = optionalEnv('NEXT_PUBLIC_ATTENDEE_AUTH_REQUIRED') === 'true';
if (attendeeAuthRequired) {
  requireEnv('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
  requireEnv('CLERK_SECRET_KEY');
}

const sql = neon(DATABASE_URL);

async function verifyTables() {
  const expectedTables = [
    'admin_users',
    'events',
    'attendee_matches',
    'attendee_identities',
    'auth_magic_links',
    'attendee_sessions',
  ];

  const rows = await sql`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_name = any(${expectedTables}::text[])
  `;

  const found = new Set(rows.map((row) => row.table_name));
  const missing = expectedTables.filter((table) => !found.has(table));

  if (missing.length > 0) {
    fail(`Missing required tables: ${missing.join(', ')}. Run migrations first.`);
  }
}

async function verifyAdminSeed() {
  const rows = await sql`
    select count(*)::int as count
    from public.admin_users
    where email = ${ADMIN_EMAIL.toLowerCase()}
      and is_active = true
  `;

  const count = rows[0]?.count ?? 0;
  if (count < 1) {
    fail(`No active admin user found for ${ADMIN_EMAIL}. Run npm run seed:admin.`);
  }
}

async function main() {
  await sql`select now()`;
  await verifyTables();
  await verifyAdminSeed();

  console.log('Bootstrap checks passed: env, DB connectivity, table readiness, admin seed readiness.');
  console.log('Next smoke checks:');
  console.log('1) npm run dev');
  console.log('2) Open /sign-in (if attendee auth required), /signup, /room, /admin');
  console.log('3) npm run typecheck && npm test && npm run build');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
