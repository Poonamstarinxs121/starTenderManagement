import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Base user schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("user"), // admin, user, manager, etc.
  avatarUrl: text("avatar_url"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
});

export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true, updatedAt: true });

// Documents for KYC, tenders, project milestones, etc.
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // KYC, Bid, Contract, Invoice, Milestone
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size").notNull(),
  fileType: text("file_type").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  relatedToId: integer("related_to_id"), // can be lead/tender/project id
  relatedToType: text("related_to_type"), // lead, tender, project
  uploadedById: integer("uploaded_by_id").notNull(),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
});

export const insertDocumentSchema = createInsertSchema(documents)
  .omit({ id: true, uploadedAt: true, updatedAt: true });

// Leads - potential clients/opportunities
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  company: text("company").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  source: text("source").notNull(), // website, referral, marketing, etc.
  status: text("status").notNull().default("new"), // new, qualified, proposal, negotiation, won, lost
  value: integer("value"), // potential value
  assignedToId: integer("assigned_to_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
});

export const insertLeadSchema = createInsertSchema(leads)
  .omit({ id: true, createdAt: true, updatedAt: true });

// Tenders/Bids
export const tenders = pgTable("tenders", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  reference: text("reference").notNull(), // tender reference number
  client: text("client").notNull(),
  description: text("description"),
  value: integer("value"), // bid value
  deadline: timestamp("deadline").notNull(),
  submissionDate: timestamp("submission_date"),
  status: text("status").notNull().default("draft"), // draft, submitted, evaluation, won, lost
  probability: integer("probability").default(50), // win probability 0-100
  assignedToId: integer("assigned_to_id"),
  notes: text("notes"),
  requirements: jsonb("requirements"), // JSON array of requirement items
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
});

export const insertTenderSchema = createInsertSchema(tenders)
  .omit({ id: true, createdAt: true, updatedAt: true });

// Projects (converted from won tenders)
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  client: text("client").notNull(),
  description: text("description"),
  value: integer("value").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status").notNull().default("planning"), // planning, in_progress, on_hold, completed, cancelled
  progress: integer("progress").default(0), // 0-100
  projectManagerId: integer("project_manager_id").notNull(),
  tenderId: integer("tender_id"), // reference to the winning tender
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
});

export const insertProjectSchema = createInsertSchema(projects)
  .omit({ id: true, createdAt: true, updatedAt: true });

// Project Milestones
export const milestones = pgTable("milestones", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date").notNull(),
  completedDate: timestamp("completed_date"),
  status: text("status").notNull().default("pending"), // pending, completed, delayed
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
});

export const insertMilestoneSchema = createInsertSchema(milestones)
  .omit({ id: true, createdAt: true, updatedAt: true });

// Activities for tracking actions in the system
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // lead, tender, project, document, user
  actionType: text("action_type").notNull(), // create, update, delete, approve, reject, etc.
  performedById: integer("performed_by_id").notNull(),
  relatedToId: integer("related_to_id"),
  relatedToType: text("related_to_type"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const insertActivitySchema = createInsertSchema(activities)
  .omit({ id: true, createdAt: true });

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;

export type Tender = typeof tenders.$inferSelect;
export type InsertTender = z.infer<typeof insertTenderSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Milestone = typeof milestones.$inferSelect;
export type InsertMilestone = z.infer<typeof insertMilestoneSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
