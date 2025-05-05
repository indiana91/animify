import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
// Skip Groq for now to fix the startup issues
// import Groq from "groq";

interface ApiKeys {
  openaiApiKey?: string;
  googleApiKey?: string;
  groqApiKey?: string;
}

class AIService {
  private openai: OpenAI | null = null;
  private googleAI: GoogleGenerativeAI | null = null;
  // private groq: any = null;
  
  constructor() {
    this.initializeDefaultClients();
  }
  
  private initializeDefaultClients() {
    // Initialize OpenAI
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (openaiApiKey) {
      this.openai = new OpenAI({
        apiKey: openaiApiKey,
      });
    }
    
    // Initialize Google Generative AI
    const googleApiKey = process.env.GOOGLE_AI_API_KEY;
    if (googleApiKey) {
      this.googleAI = new GoogleGenerativeAI(googleApiKey);
    }
    
    // Initialize Groq - Temporarily disabled to fix startup
    // const groqApiKey = process.env.GROQ_API_KEY;
    // if (groqApiKey) {
    //   // Will implement later
    // }
  }
  
  // Get custom clients with user-specific API keys
  private getCustomClients(userId: number | undefined): Promise<ApiKeys> {
    return new Promise(async (resolve) => {
      if (!userId) {
        resolve({});
        return;
      }
      
      try {
        // Get custom API keys from user settings
        const user = await storage.getUser(userId);
        if (!user) {
          resolve({});
          return;
        }
        
        // Get user settings with API keys
        const userSettings = await storage.getUserSettings(userId);
        if (!userSettings) {
          resolve({});
          return;
        }
        
        resolve({
          openaiApiKey: userSettings.openaiApiKey || undefined,
          googleApiKey: userSettings.googleApiKey || undefined,
          groqApiKey: userSettings.groqApiKey || undefined
        });
      } catch (error) {
        console.error("Error getting custom API keys:", error);
        resolve({});
      }
    });
  }
  
  async generateScript(prompt: string, model: string): Promise<string> {
    const instructions = `
      Generate a detailed scene description for an animation based on the following prompt.
      The scene description should include:
      1. Clear visual elements to include
      2. Movement and transitions
      3. Timing suggestions
      4. Color and style recommendations
      
      PROMPT: ${prompt}
      
      Provide a structured, detailed scene description that could be used to create a Manim animation.
    `;
    
    switch (model) {
      case "openai":
        return this.generateWithOpenAI(instructions);
      case "gemini":
        return this.generateWithGemini(instructions);
      case "groq":
        return this.generateWithGroq(instructions);
      default:
        throw new Error(`Unknown AI model: ${model}`);
    }
  }
  
  async generateManimCode(prompt: string, script: string, duration: number, model: string): Promise<string> {
    const instructions = `
      Generate Manim Python code to create an animation based on the following prompt and script.
      The animation should be approximately ${duration} seconds long.
      
      PROMPT: ${prompt}
      
      SCRIPT: ${script}
      
      Create complete, executable Manim Python code that implements this animation.
      The code should:
      1. Import all necessary libraries
      2. Define a Scene class that extends Scene or ThreeDScene
      3. Include a construct method with all needed animations
      4. Use appropriate timing to match the desired duration
      5. Use clean, commented, and well-structured code
      
      Return only the Python code without any additional explanation.
    `;
    
    switch (model) {
      case "openai":
        return this.generateWithOpenAI(instructions);
      case "gemini":
        return this.generateWithGemini(instructions);
      case "groq":
        return this.generateWithGroq(instructions);
      default:
        throw new Error(`Unknown AI model: ${model}`);
    }
  }
  
  private async generateWithOpenAI(instructions: string): Promise<string> {
    if (!this.openai) {
      throw new Error("OpenAI API key not configured");
    }
    
    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an expert in Manim animation programming." },
        { role: "user", content: instructions }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });
    
    return response.choices[0]?.message?.content?.trim() || "";
  }
  
  private async generateWithGemini(instructions: string): Promise<string> {
    if (!this.googleAI) {
      throw new Error("Google AI API key not configured");
    }
    
    try {
      // Try to use Gemini API
      const model = this.googleAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      
      const result = await model.generateContent(instructions);
      const response = result.response;
      return response.text().trim();
    } catch (error) {
      console.error("Error using Gemini API:", error);
      
      // Fallback to OpenAI if Gemini fails
      console.log("Falling back to OpenAI for generation");
      return this.generateWithOpenAI(instructions);
    }
  }
  
  private async generateWithGroq(instructions: string): Promise<string> {
    // Temporarily use OpenAI as fallback since Groq is disabled
    return this.generateWithOpenAI(instructions);
    
    // Original implementation:
    /*
    if (!this.groq) {
      throw new Error("Groq API key not configured");
    }
    
    const completion = await this.groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are an expert in Manim animation programming." },
        { role: "user", content: instructions }
      ],
      model: "llama3-70b-8192",
    });
    
    return completion.choices[0]?.message?.content?.trim() || "";
    */
  }
}

export const aiService = new AIService();
