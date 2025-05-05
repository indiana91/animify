import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  generationsRemaining: integer("generations_remaining").default(10).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

// Animation projects table
export const animations = pgTable("animations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  prompt: text("prompt").notNull(),
  title: text("title").notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  script: text("script"),
  manimCode: text("manim_code"),
  videoUrl: text("video_url"),
  aiModel: text("ai_model").notNull(),
  duration: integer("duration").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAnimationSchema = createInsertSchema(animations).pick({
  userId: true,
  prompt: true,
  title: true,
  aiModel: true,
  duration: true,
});

// Generation tasks table
export const generationTasks = pgTable("generation_tasks", {
  id: serial("id").primaryKey(),
  animationId: integer("animation_id").notNull(),
  taskType: text("task_type").notNull(), // script_generation, code_generation, rendering
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  error: text("error"),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
});

export const insertGenerationTaskSchema = createInsertSchema(generationTasks).pick({
  animationId: true,
  taskType: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Animation = typeof animations.$inferSelect;
export type InsertAnimation = z.infer<typeof insertAnimationSchema>;

export type GenerationTask = typeof generationTasks.$inferSelect;
export type InsertGenerationTask = z.infer<typeof insertGenerationTaskSchema>;
