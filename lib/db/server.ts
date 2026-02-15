import postgres from 'postgres';

let client: postgres.Sql | null = null;

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

export function getDb() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is not configured.');
  }

  if (!client) {
    client = postgres(connectionString, {
      prepare: false,
      max: 5
    });
  }

  return client;
}
