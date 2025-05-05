import bcrypt from "bcrypt";
import { storage } from "../storage";
import { InsertUser, User } from "@shared/schema";

class AuthService {
  async registerUser(userData: InsertUser & { email: string }): Promise<User> {
    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Create the user with hashed password
    const user = await storage.createUser({
      ...userData,
      password: hashedPassword,
    });
    
    return user;
  }
  
  async validateUser(username: string, password: string): Promise<User | null> {
    // Find user by username
    const user = await storage.getUserByUsername(username);
    if (!user) {
      return null;
    }
    
    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return null;
    }
    
    return user;
  }
}

export const authService = new AuthService();
