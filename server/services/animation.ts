import { storage } from "../storage";
import { InsertAnimation, Animation } from "@shared/schema";
import { aiService } from "./ai";
import { manimService } from "./manim";
import { WebSocketServer } from "ws";

interface GenerationTask {
  id: number;
  type: string;
  status: string;
  metadata?: any;
}

class AnimationService {
  async createAnimationProject(data: InsertAnimation): Promise<Animation> {
    // Create animation record
    const animation = await storage.createAnimation(data);
    
    // Create initial tasks
    await storage.createGenerationTask({
      animationId: animation.id,
      taskType: "script_generation",
    });
    
    await storage.createGenerationTask({
      animationId: animation.id,
      taskType: "code_generation",
    });
    
    await storage.createGenerationTask({
      animationId: animation.id,
      taskType: "rendering",
    });
    
    return animation;
  }
  
  async updateAnimationPrompt(animationId: number, prompt: string): Promise<Animation> {
    // Get the animation
    const animation = await storage.getAnimation(animationId);
    if (!animation) {
      throw new Error("Animation not found");
    }
    
    // Update animation status
    let updatedAnimation = await storage.updateAnimationStatus(animationId, "pending");
    
    // Update animation record with new prompt
    updatedAnimation = await storage.updateAnimationStatus(animationId, "pending");
    
    // Reset tasks
    const tasks = await storage.getTasksByAnimation(animationId);
    for (const task of tasks) {
      await storage.updateTaskStatus(task.id, "pending");
    }
    
    return updatedAnimation!;
  }
  
  async startGenerationPipeline(animationId: number, aiModel: string, wss: WebSocketServer): Promise<void> {
    // Mark animation as processing
    await storage.updateAnimationStatus(animationId, "processing");
    
    try {
      // 1. Generate script
      await this.generateScript(animationId, aiModel, wss);
      
      // 2. Generate Manim code
      await this.generateManimCode(animationId, aiModel, wss);
      
      // 3. Render animation
      await this.renderAnimation(animationId, wss);
      
      // Mark animation as completed
      await storage.updateAnimationStatus(animationId, "completed");
      
      // Broadcast completion
      this.broadcastUpdate(wss, {
        type: "animation_update",
        animationId,
        status: "completed",
      });
    } catch (error) {
      console.error(`Error in generation pipeline for animation ${animationId}:`, error);
      
      // Mark animation as failed
      await storage.updateAnimationStatus(animationId, "failed");
      
      // Broadcast failure
      this.broadcastUpdate(wss, {
        type: "animation_update",
        animationId,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
  
  private async generateScript(animationId: number, aiModel: string, wss: WebSocketServer): Promise<void> {
    // Get animation
    const animation = await storage.getAnimation(animationId);
    if (!animation) {
      throw new Error("Animation not found");
    }
    
    // Get script generation task
    const tasks = await storage.getTasksByAnimation(animationId);
    const scriptTask = tasks.find(task => task.taskType === "script_generation");
    if (!scriptTask) {
      throw new Error("Script generation task not found");
    }
    
    // Update task status
    await storage.updateTaskStatus(scriptTask.id, "processing");
    
    // Broadcast update
    this.broadcastUpdate(wss, {
      type: "task_update",
      animationId,
      taskId: scriptTask.id,
      taskType: "script_generation",
      status: "processing",
    });
    
    try {
      // Generate script using AI service
      const script = await aiService.generateScript(animation.prompt, aiModel);
      
      // Update animation with script
      await storage.updateAnimationScript(animationId, script);
      
      // Update task status
      await storage.updateTaskStatus(scriptTask.id, "completed");
      
      // Broadcast update
      this.broadcastUpdate(wss, {
        type: "task_update",
        animationId,
        taskId: scriptTask.id,
        taskType: "script_generation",
        status: "completed",
      });
    } catch (error) {
      // Update task status
      await storage.updateTaskStatus(scriptTask.id, "failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      
      // Broadcast update
      this.broadcastUpdate(wss, {
        type: "task_update",
        animationId,
        taskId: scriptTask.id,
        taskType: "script_generation",
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
      
      throw error;
    }
  }
  
  private async generateManimCode(animationId: number, aiModel: string, wss: WebSocketServer): Promise<void> {
    // Get animation
    const animation = await storage.getAnimation(animationId);
    if (!animation) {
      throw new Error("Animation not found");
    }
    
    if (!animation.script) {
      throw new Error("Script must be generated before code");
    }
    
    // Get code generation task
    const tasks = await storage.getTasksByAnimation(animationId);
    const codeTask = tasks.find(task => task.taskType === "code_generation");
    if (!codeTask) {
      throw new Error("Code generation task not found");
    }
    
    // Update task status
    await storage.updateTaskStatus(codeTask.id, "processing");
    
    // Broadcast update
    this.broadcastUpdate(wss, {
      type: "task_update",
      animationId,
      taskId: codeTask.id,
      taskType: "code_generation",
      status: "processing",
    });
    
    try {
      // Generate Manim code using AI service
      const manimCode = await aiService.generateManimCode(animation.prompt, animation.script, animation.duration, aiModel);
      
      // Update animation with Manim code
      await storage.updateAnimationCode(animationId, manimCode);
      
      // Update task status
      await storage.updateTaskStatus(codeTask.id, "completed");
      
      // Broadcast update
      this.broadcastUpdate(wss, {
        type: "task_update",
        animationId,
        taskId: codeTask.id,
        taskType: "code_generation",
        status: "completed",
      });
    } catch (error) {
      // Update task status
      await storage.updateTaskStatus(codeTask.id, "failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      
      // Broadcast update
      this.broadcastUpdate(wss, {
        type: "task_update",
        animationId,
        taskId: codeTask.id,
        taskType: "code_generation",
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
      
      throw error;
    }
  }
  
  private async renderAnimation(animationId: number, wss: WebSocketServer): Promise<void> {
    // Get animation
    const animation = await storage.getAnimation(animationId);
    if (!animation) {
      throw new Error("Animation not found");
    }
    
    if (!animation.manimCode) {
      throw new Error("Manim code must be generated before rendering");
    }
    
    // Get rendering task
    const tasks = await storage.getTasksByAnimation(animationId);
    const renderTask = tasks.find(task => task.taskType === "rendering");
    if (!renderTask) {
      throw new Error("Rendering task not found");
    }
    
    // Update task status
    await storage.updateTaskStatus(renderTask.id, "processing");
    
    // Broadcast update
    this.broadcastUpdate(wss, {
      type: "task_update",
      animationId,
      taskId: renderTask.id,
      taskType: "rendering",
      status: "processing",
    });
    
    try {
      // Render animation using Manim service
      const progressCallback = (progress: number) => {
        // Broadcast progress update
        this.broadcastUpdate(wss, {
          type: "task_progress",
          animationId,
          taskId: renderTask.id,
          taskType: "rendering",
          progress,
        });
      };
      
      const videoUrl = await manimService.renderAnimation(animation.id, animation.manimCode, progressCallback);
      
      // Update animation with video URL
      await storage.updateAnimationVideo(animationId, videoUrl);
      
      // Update task status
      await storage.updateTaskStatus(renderTask.id, "completed");
      
      // Broadcast update
      this.broadcastUpdate(wss, {
        type: "task_update",
        animationId,
        taskId: renderTask.id,
        taskType: "rendering",
        status: "completed",
        videoUrl,
      });
    } catch (error) {
      // Update task status
      await storage.updateTaskStatus(renderTask.id, "failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      
      // Broadcast update
      this.broadcastUpdate(wss, {
        type: "task_update",
        animationId,
        taskId: renderTask.id,
        taskType: "rendering",
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
      
      throw error;
    }
  }
  
  private broadcastUpdate(wss: WebSocketServer, data: any): void {
    const message = JSON.stringify(data);
    wss.clients.forEach(client => {
      if (client.readyState === 1) { // OPEN
        client.send(message);
      }
    });
  }
}

export const animationService = new AnimationService();
