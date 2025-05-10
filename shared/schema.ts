import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("student"),
  fullName: text("full_name").notNull(),
  phoneNumber: text("phone_number"),
  profilePicture: text("profile_picture"),
});

// Announcement schema
export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: integer("author_id").references(() => users.id).notNull(),
  targetGroup: text("target_group").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Assignment schema
export const assignments = pgTable("assignments", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  fileUrl: text("file_url").notNull(),
  dueDate: timestamp("due_date").notNull(),
  authorId: integer("author_id").references(() => users.id).notNull(),
  targetGroup: text("target_group").notNull(),
  isPublished: boolean("is_published").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Assignment submission schema
export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  assignmentId: integer("assignment_id").references(() => assignments.id).notNull(),
  studentId: integer("student_id").references(() => users.id).notNull(),
  fileUrl: text("file_url").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  grade: integer("grade"),
  feedback: text("feedback"),
});

// Study material schema
export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  authorId: integer("author_id").references(() => users.id).notNull(),
  targetGroup: text("target_group").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Results schema
export const results = pgTable("results", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  score: integer("score").notNull(),
  maxScore: integer("max_score").notNull(),
  authorId: integer("author_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insertion schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertAnnouncementSchema = createInsertSchema(announcements).omit({ id: true, createdAt: true });
export const insertAssignmentSchema = createInsertSchema(assignments).omit({ id: true, createdAt: true });
export const insertSubmissionSchema = createInsertSchema(submissions).omit({ id: true, submittedAt: true });
export const insertMaterialSchema = createInsertSchema(materials).omit({ id: true, createdAt: true });
export const insertResultSchema = createInsertSchema(results).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;

export type Assignment = typeof assignments.$inferSelect;
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;

export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;

export type Material = typeof materials.$inferSelect;
export type InsertMaterial = z.infer<typeof insertMaterialSchema>;

export type Result = typeof results.$inferSelect;
export type InsertResult = z.infer<typeof insertResultSchema>;

// Chat Messages schema
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  isRead: boolean("is_read").notNull().default(false),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, timestamp: true });
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  type: text("type").notNull(), // "announcement", "assignment", "result", "material", "chat", "system"
  title: text("title").notNull(),
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  link: text("link"),
  itemId: integer("item_id"),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, timestamp: true });
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Feedback table
export const feedbacks = pgTable("feedbacks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  type: text("type").notNull(), // "bug", "feature", "feedback"
  title: text("title").notNull(),
  description: text("description").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  status: text("status").default("pending").notNull(), // "pending", "in-progress", "resolved", "rejected"
});

export const insertFeedbackSchema = createInsertSchema(feedbacks).omit({ id: true, timestamp: true });
export type Feedback = typeof feedbacks.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
