import express, { Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { z } from "zod";
import { insertUserSchema, insertAnimationSchema } from "@shared/schema";
import { authService } from "./services/auth";
import { animationService } from "./services/animation";
import { WebSocketServer } from "ws";

// Session store setup
import MemoryStore from "memorystore";
const MemoryStoreSession = MemoryStore(session);

export async function registerRoutes(app: express.Express): Promise<Server> {
  // Set up session middleware
  app.use(
    session({
      store: new MemoryStoreSession({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
      secret: process.env.SESSION_SECRET || "animation-generator-session-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
      },
    })
  );

  // Set up passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await authService.validateUser(username, password);
        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

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
      
      // Log the user in
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error logging in after registration" });
        }
        return res.status(201).json({
          id: user.id,
          username: user.username,
          email: user.email,
          generationsRemaining: user.generationsRemaining,
        });
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Signup error:", error);
      res.status(500).json({ message: "Error creating user" });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.json({
          id: user.id,
          username: user.username,
          email: user.email,
          generationsRemaining: user.generationsRemaining,
        });
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

  app.get("/api/auth/user", isAuthenticated, (req, res) => {
    const user = req.user as any;
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

  return httpServer;
}
