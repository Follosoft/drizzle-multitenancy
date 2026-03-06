import { pgTable, text, timestamp, jsonb } from 'drizzle-orm/pg-core'

export const tenants = pgTable('tenants', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  subdomain: text('subdomain').notNull().unique(),
  databaseUrl: text('database_url').notNull(),
  locale: text('locale').notNull().default('en'),
  status: text('status', { enum: ['active', 'suspended', 'trial'] }).notNull().default('active'),
  config: jsonb('config').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
