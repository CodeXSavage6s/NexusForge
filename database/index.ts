import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema/schema';
import * as authSchema from './schema/auth-schema';

// `schema` must be passed here for `db.query.*` (relational queries) to
// work at all — authz.ts, notifications.ts, and the invoice actions all
// rely on it.
const db = drizzle(process.env.DATABASE_URL!, {
  schema: { ...schema, ...authSchema },
});

export default db