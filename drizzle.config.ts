import 'dotenv/config.js';

import { defineConfig } from 'drizzle-kit';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "[DATABASE] Missing DATABASE_URL. Make sure it's set in your environment or .env file."
  );
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/models/*.ts',
  out: './drizzle',
  dbCredentials: {
    url: connectionString,
  },
});
