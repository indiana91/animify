import { eq, and, desc } from "drizzle-orm";
import { db } from "./db";
import { 
  users, animations, generationTasks, 
  type User, type InsertUser, 
  type Animation, type InsertAnimation,
  type GenerationTask, type InsertGenerationTask 
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  decrementUserGenerations(userId: number): Promise<User | undefined>;
  
  // User settings operations
  getUserSettings(userId: number): Promise<UserSettings | undefined>;
  createUserSettings(settings: InsertUserSettings): Promise<UserSettings>;
  updateUserSettings(userId: number, settings: Partial<InsertUserSettings>): Promise<UserSettings | undefined>;
  
  // Animation operations
  createAnimation(animation: InsertAnimation): Promise<Animation>;
  getAnimation(id: number): Promise<Animation | undefined>;
  getUserAnimations(userId: number): Promise<Animation[]>;
  updateAnimationStatus(id: number, status: string): Promise<Animation | undefined>;
  updateAnimationScript(id: number, script: string): Promise<Animation | undefined>;
  updateAnimationCode(id: number, code: string): Promise<Animation | undefined>;
  updateAnimationVideo(id: number, videoUrl: string): Promise<Animation | undefined>;
  
  // Task operations
  createGenerationTask(task: InsertGenerationTask): Promise<GenerationTask>;
  updateTaskStatus(id: number, status: string, metadata?: any): Promise<GenerationTask | undefined>;
  getTasksByAnimation(animationId: number): Promise<GenerationTask[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async decrementUserGenerations(userId: number): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (!user || user.generationsRemaining <= 0) {
      return user;
    }

    const [updatedUser] = await db
      .update(users)
      .set({ generationsRemaining: user.generationsRemaining - 1 })
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  }

  // Animation operations
  async createAnimation(animation: InsertAnimation): Promise<Animation> {
    const [newAnimation] = await db
      .insert(animations)
      .values(animation)
      .returning();
    return newAnimation;
  }

  async getAnimation(id: number): Promise<Animation | undefined> {
    const [animation] = await db
      .select()
      .from(animations)
      .where(eq(animations.id, id));
    return animation;
  }

  async getUserAnimations(userId: number): Promise<Animation[]> {
    return db
      .select()
      .from(animations)
      .where(eq(animations.userId, userId))
      .orderBy(desc(animations.createdAt));
  }

  async updateAnimationStatus(id: number, status: string): Promise<Animation | undefined> {
    const [updatedAnimation] = await db
      .update(animations)
      .set({ status, updatedAt: new Date() })
      .where(eq(animations.id, id))
      .returning();
    return updatedAnimation;
  }

  async updateAnimationScript(id: number, script: string): Promise<Animation | undefined> {
    const [updatedAnimation] = await db
      .update(animations)
      .set({ script, updatedAt: new Date() })
      .where(eq(animations.id, id))
      .returning();
    return updatedAnimation;
  }

  async updateAnimationCode(id: number, manimCode: string): Promise<Animation | undefined> {
    const [updatedAnimation] = await db
      .update(animations)
      .set({ manimCode, updatedAt: new Date() })
      .where(eq(animations.id, id))
      .returning();
    return updatedAnimation;
  }

  async updateAnimationVideo(id: number, videoUrl: string): Promise<Animation | undefined> {
    const [updatedAnimation] = await db
      .update(animations)
      .set({ videoUrl, status: "completed", updatedAt: new Date() })
      .where(eq(animations.id, id))
      .returning();
    return updatedAnimation;
  }

  // Task operations
  async createGenerationTask(task: InsertGenerationTask): Promise<GenerationTask> {
    const [newTask] = await db
      .insert(generationTasks)
      .values(task)
      .returning();
    return newTask;
  }

  async updateTaskStatus(id: number, status: string, metadata?: any): Promise<GenerationTask | undefined> {
    const updates: any = { status };
    
    if (status === 'processing') {
      updates.startedAt = new Date();
    } else if (status === 'completed' || status === 'failed') {
      updates.completedAt = new Date();
    }
    
    if (metadata) {
      updates.metadata = metadata;
    }
    
    const [updatedTask] = await db
      .update(generationTasks)
      .set(updates)
      .where(eq(generationTasks.id, id))
      .returning();
    
    return updatedTask;
  }

  async getTasksByAnimation(animationId: number): Promise<GenerationTask[]> {
    return db
      .select()
      .from(generationTasks)
      .where(eq(generationTasks.animationId, animationId))
      .orderBy(desc(generationTasks.createdAt));
  }
}

export const storage = new DatabaseStorage();
