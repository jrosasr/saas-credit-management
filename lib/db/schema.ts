import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { decimal, pgEnum } from "drizzle-orm/pg-core";

export const statusEnum = pgEnum("status", ["active", "inactive"]);
export const paymentEnum = pgEnum("payment", [
  "pending",
  "in-progress",
  "complete",
]);
export const timeBetweenPaymentsEnum = pgEnum("timeBetweenPayments", [
  "every-day",
  "every-week",
  "every-two-weeks",
  "every-month",
]);

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  address: varchar("address", { length: 250 }),
  phone: varchar("phone", { length: 20 }),
  dniType: varchar("dni_type", { length: 20 }),
  dni: varchar("dni", { length: 20 }),
  status: statusEnum().default("active"),
  comment: text("comment"),
});

export const advisers = pgTable("advisers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  address: varchar("address", { length: 250 }),
  phone: varchar("phone", { length: 20 }),
  dniType: varchar("dni_type", { length: 20 }),
  dni: varchar("dni", { length: 20 }),
  status: statusEnum().default("active"),
  comment: text("comment"),
});

export const credits = pgTable("credits", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id),
  adviserId: integer("adviser_id").references(() => advisers.id),
  status: paymentEnum().default("pending"),

  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  creditAmount: decimal("credit_amount").notNull(),
  percentage: decimal("percentage").notNull(),
  quotas: integer("quotas").notNull(),
  baseAmount: decimal("base_amount").notNull(),
  interestAmount: decimal("interest_amount").notNull(),
  feeAmount: decimal("fee_amount").notNull(),
  totalInterest: decimal("total_interest").notNull(),
  total: decimal("total").notNull(),
  timeBetweenPayments: timeBetweenPaymentsEnum()
    .notNull()
    .default("every-week"),
});

export const creditPayments = pgTable("credit_payments", {
  id: serial("id").primaryKey(),
  creditId: integer("credit_id").references(() => credits.id),
  status: paymentEnum().default("pending"),

  nro: integer("nro").notNull(),
  paymentDate: timestamp("payment_date").notNull(), // Fecha de pago
  datePaid: timestamp("date_paid"), // Fecha en la que pago
  baseAmount: decimal("base_amount").notNull(),
  interestAmount: decimal("interest_amount").notNull(),
  totalInterest: decimal("total_interest").notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 20 }).notNull().default("member"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  stripeCustomerId: text("stripe_customer_id").unique(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  stripeProductId: text("stripe_product_id"),
  planName: varchar("plan_name", { length: 50 }),
  subscriptionStatus: varchar("subscription_status", { length: 20 }),
});

export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id),
  role: varchar("role", { length: 50 }).notNull(),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  ipAddress: varchar("ip_address", { length: 45 }),
});

export const invitations = pgTable("invitations", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id),
  email: varchar("email", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull(),
  invitedBy: integer("invited_by")
    .notNull()
    .references(() => users.id),
  invitedAt: timestamp("invited_at").notNull().defaultNow(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
});

export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
}));

export const usersRelations = relations(users, ({ many }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  invitedBy: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  team: one(teams, {
    fields: [activityLogs.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, "id" | "name" | "email">;
  })[];
};

export enum ActivityType {
  SIGN_UP = "SIGN_UP",
  SIGN_IN = "SIGN_IN",
  SIGN_OUT = "SIGN_OUT",
  UPDATE_PASSWORD = "UPDATE_PASSWORD",
  DELETE_ACCOUNT = "DELETE_ACCOUNT",
  UPDATE_ACCOUNT = "UPDATE_ACCOUNT",
  CREATE_TEAM = "CREATE_TEAM",
  REMOVE_TEAM_MEMBER = "REMOVE_TEAM_MEMBER",
  INVITE_TEAM_MEMBER = "INVITE_TEAM_MEMBER",
  ACCEPT_INVITATION = "ACCEPT_INVITATION",
}
