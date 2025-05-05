import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { authService } from "./services/auth";
import { User } from "@shared/schema";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";

// Extend Express.User interface to match our User type
declare global {
  namespace Express {
    // Use our User type from schema
    interface User {
      id: number;
      username: string;
      email: string;
      password: string;
      generationsRemaining: number;
    }
  }
}

export function setupAuth(app: Express) {
  // Configure session store with PostgreSQL
  const PgStore = connectPgSimple(session);
  
  const sessionOptions: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "manim-animation-generator-secret",
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: 'lax',
    },
    store: new PgStore({
      pool,
      tableName: "session",
      createTableIfMissing: true,
    }),
  };
  
  console.log("Setting up session with options:", {
    resave: true,
    saveUninitialized: true,
    cookieMaxAge: 30 * 24 * 60 * 60 * 1000,
    cookieSecure: process.env.NODE_ENV === "production",
  });

  // Set trust proxy if in production
  if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }

  // Set up session and passport
  app.use(session(sessionOptions));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure local strategy
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

  // Serialize and deserialize user
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await authService.getUserById(id);
      done(null, user || undefined);
    } catch (error) {
      done(error);
    }
  });
}