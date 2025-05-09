import express, { Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import passport from "passport";
import { z } from "zod";
import { insertUserSchema, insertAnimationSchema } from "@shared/schema";
import { authService } from "./services/auth";
import { animationService } from "./services/animation";
import { WebSocketServer } from "ws";
import { setupAuth } from "./auth";

export async function registerRoutes(app: express.Express): Promise<Server> {
  // Set up authentication with Passport.js
  setupAuth(app);

  // Create HTTP server
  const httpServer = createServer(app);

  // Set up WebSocket server for real-time updates - use a specific path to avoid conflicts with Vite
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws-animation'  // Specify a custom path for our WebSocket server
  });
  wss.on("connection", (ws) => {
    console.log("WebSocket client connected");
    
    ws.on("message", (message) => {
      try {
        const parsedMessage = JSON.parse(message.toString());
        console.log("Received message:", parsedMessage);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    });
    
    ws.on("close", () => {
      console.log("WebSocket client disconnected");
    });
  });

  // Authentication middleware
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Auth routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      console.log("Signup request received:", req.body);
      
      const validatedData = insertUserSchema
        .extend({
          email: z.string().email("Invalid email address"),
          password: z.string().min(8, "Password must be at least 8 characters"),
        })
        .parse(req.body);

      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }

      const user = await authService.registerUser(validatedData);
      console.log("User created:", user.id, user.username);
      
      // Log the user in
      return req.login(user, (err) => {
        if (err) {
          console.error("Error logging in after registration:", err);
          return res.status(500).json({ message: "Error logging in after registration" });
        }
        
        console.log("User logged in successfully after registration");
        console.log("Session details:", req.session);
        
        // Send back sanitized user data
        const safeUser = {
          id: user.id,
          username: user.username,
          email: user.email,
          generationsRemaining: user.generationsRemaining,
        };
        
        return res.status(201).json(safeUser);
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors.map(e => `${e.path}: ${e.message}`).join(", ");
        console.error("Validation error:", errorMessage);
        return res.status(400).json({ message: errorMessage });
      }
      console.error("Signup error:", error);
      res.status(500).json({ message: "Error creating user" });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    console.log("Login request received:", req.body);
    
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error("Login error:", err);
        return next(err);
      }
      if (!user) {
        console.log("Authentication failed:", info?.message || "Unknown reason");
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }
      
      console.log("User authenticated:", user.id, user.username);
      
      return req.login(user, (err) => {
        if (err) {
          console.error("Error during login session creation:", err);
          return next(err);
        }
        
        console.log("User logged in successfully");
        console.log("Session details:", req.session);
        
        // Send back sanitized user data
        const safeUser = {
          id: user.id,
          username: user.username,
          email: user.email,
          generationsRemaining: user.generationsRemaining,
        };
        
        return res.json(safeUser);
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Error during logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/user", (req, res) => {
    console.log("User session check, authenticated:", req.isAuthenticated());
    console.log("Session ID:", req.sessionID);
    console.log("Session content:", req.session);
    
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = req.user as any;
    console.log("Current user:", user.id, user.username);
    
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      generationsRemaining: user.generationsRemaining,
    });
  });

  // Animation routes
  app.post("/api/animations", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      
      // Check if user has generations remaining
      if (user.generationsRemaining <= 0) {
        return res.status(403).json({ message: "You have reached your animation generation limit" });
      }
      
      // Validate request body
      const validatedData = insertAnimationSchema
        .extend({
          prompt: z.string().min(10, "Prompt must be at least 10 characters long"),
          title: z.string().min(3, "Title must be at least 3 characters long"),
          aiModel: z.enum(["openai", "gemini", "groq"]),
          duration: z.number().int().min(5).max(60),
        })
        .parse({
          ...req.body,
          userId: user.id,
          title: req.body.title || `Animation ${Date.now()}`,
        });
      
      // Create new animation project
      const animation = await animationService.createAnimationProject(validatedData);
      
      // Decrement user's remaining generations
      await storage.decrementUserGenerations(user.id);
      
      // Start the generation process asynchronously
      animationService.startGenerationPipeline(animation.id, validatedData.aiModel, wss);
      
      res.status(201).json(animation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Animation creation error:", error);
      res.status(500).json({ message: "Error creating animation" });
    }
  });

  app.get("/api/animations", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const animations = await storage.getUserAnimations(user.id);
      res.json(animations);
    } catch (error) {
      console.error("Error fetching animations:", error);
      res.status(500).json({ message: "Error fetching animations" });
    }
  });

  app.get("/api/animations/:id", isAuthenticated, async (req, res) => {
    try {
      const animationId = parseInt(req.params.id);
      const animation = await storage.getAnimation(animationId);
      
      if (!animation) {
        return res.status(404).json({ message: "Animation not found" });
      }
      
      const user = req.user as any;
      if (animation.userId !== user.id) {
        return res.status(403).json({ message: "You don't have access to this animation" });
      }
      
      const tasks = await storage.getTasksByAnimation(animationId);
      
      res.json({
        ...animation,
        tasks,
      });
    } catch (error) {
      console.error("Error fetching animation:", error);
      res.status(500).json({ message: "Error fetching animation" });
    }
  });

  app.post("/api/animations/:id/regenerate", isAuthenticated, async (req, res) => {
    try {
      const animationId = parseInt(req.params.id);
      const animation = await storage.getAnimation(animationId);
      
      if (!animation) {
        return res.status(404).json({ message: "Animation not found" });
      }
      
      const user = req.user as any;
      if (animation.userId !== user.id) {
        return res.status(403).json({ message: "You don't have access to this animation" });
      }

      if (user.generationsRemaining <= 0) {
        return res.status(403).json({ message: "You have reached your animation generation limit" });
      }
      
      // Update animation with new prompt if provided
      let updatedAnimation = animation;
      if (req.body.prompt) {
        updatedAnimation = await animationService.updateAnimationPrompt(animationId, req.body.prompt);
      }
      
      // Decrement user's remaining generations
      await storage.decrementUserGenerations(user.id);
      
      // Start the generation process asynchronously
      animationService.startGenerationPipeline(animationId, animation.aiModel, wss);
      
      res.json(updatedAnimation);
    } catch (error) {
      console.error("Error regenerating animation:", error);
      res.status(500).json({ message: "Error regenerating animation" });
    }
  });

  // User Settings API
  app.get("/api/settings", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const userId = user.id;
      const settings = await storage.getUserSettings(userId);
      
      if (!settings) {
        return res.json({ 
          userId,
          defaultAiModel: "openai",
          openaiApiKey: null,
          googleApiKey: null,
          groqApiKey: null,
        });
      }
      
      // Don't send the actual API keys, just indicate they exist
      res.json({
        ...settings,
        openaiApiKey: settings.openaiApiKey ? "********" : null,
        googleApiKey: settings.googleApiKey ? "********" : null,
        groqApiKey: settings.groqApiKey ? "********" : null,
      });
    } catch (error) {
      console.error("Error fetching user settings:", error);
      res.status(500).json({ message: "Failed to fetch user settings" });
    }
  });
  
  app.post("/api/settings", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const userId = user.id;
      const { openaiApiKey, googleApiKey, groqApiKey, defaultAiModel } = req.body;
      
      const updatedSettings = await storage.updateUserSettings(userId, {
        openaiApiKey,
        googleApiKey,
        groqApiKey,
        defaultAiModel,
      });
      
      // Don't send the actual API keys, just indicate they exist
      res.json({
        ...updatedSettings,
        openaiApiKey: updatedSettings?.openaiApiKey ? "********" : null,
        googleApiKey: updatedSettings?.googleApiKey ? "********" : null,
        groqApiKey: updatedSettings?.groqApiKey ? "********" : null,
      });
    } catch (error) {
      console.error("Error updating user settings:", error);
      res.status(500).json({ message: "Failed to update user settings" });
    }
  });

  return httpServer;
}
