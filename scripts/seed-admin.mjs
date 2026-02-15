import bcrypt from 'bcryptjs';
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL');
  process.exit(1);
}

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Missing ADMIN_EMAIL or ADMIN_PASSWORD');
  process.exit(1);
}

const normalizedEmail = ADMIN_EMAIL.trim().toLowerCase();

if (!normalizedEmail.includes('@')) {
  console.error('ADMIN_EMAIL must be a valid email address');
  process.exit(1);
}

if (ADMIN_PASSWORD.length < 12) {
  console.error('ADMIN_PASSWORD must be at least 12 characters');
  process.exit(1);
}

const sql = neon(DATABASE_URL);
const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

await sql`
  insert into public.admin_users (email, password_hash, role, is_active)
  values (${normalizedEmail}, ${passwordHash}, 'admin', true)
  on conflict (email)
  do update set
    password_hash = excluded.password_hash,
    role = excluded.role,
    is_active = true,
    updated_at = now()
`;

console.log(`Seeded admin user: ${normalizedEmail}`);
