import { sql } from "drizzle-orm";
import {
  index,
  pgTableCreator,
  serial,
  timestamp,
  varchar,
  integer,
  text,
  boolean,
  doublePrecision,
  pgEnum,
} from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `rora_${name}`);

export const submissionStatusEnum = pgEnum("submission_status", [
  "pending",
  "approved",
  "rejected",
]);

export const users = createTable(
  "user",
  {
    id: varchar("id").primaryKey(),
    email: varchar("email", { length: 256 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
    notificationPreference: boolean("notification_preference").default(false),
  },
  (user) => ({
    emailIndex: index("email_idx").on(user.email),
  }),
);

export const submissions = createTable(
  "submission",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
    latitude: doublePrecision("latitude").notNull(),
    longitude: doublePrecision("longitude").notNull(),
    location: text("location").notNull(),
    imageUrl: text("image_url").notNull(),
    status: submissionStatusEnum("status").default("pending").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (submission) => ({
    userIdIndex: index("user_id_idx").on(submission.userId),
    locationIndex: index("location_idx").on(
      submission.latitude,
      submission.longitude,
    ),
  }),
);

export const stats = createTable(
  "statistics",
  {
    id: serial("id").primaryKey(),
    date: timestamp("date", { withTimezone: true }).notNull(),
    kpIndex: integer("kp_index"),
    solarWindSpeed: integer("solar_wind_speed"),
    density: doublePrecision("density"),
    bz: doublePrecision("bz"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (stat) => ({
    dateIndex: index("date_idx").on(stat.date),
  }),
);
