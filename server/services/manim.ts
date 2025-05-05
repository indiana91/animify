import { exec } from "child_process";
import fs from "fs";
import path from "path";
import util from "util";
import os from "os";

// Promise-based versions of Node.js functions
const execPromise = util.promisify(exec);
const writeFilePromise = util.promisify(fs.writeFile);
const mkdirPromise = util.promisify(fs.mkdir);
const existsPromise = util.promisify(fs.exists);

class ManimService {
  private outputDir: string;
  private manimScriptsDir: string;
  
  constructor() {
    // Create directories for Manim scripts and output
    this.outputDir = path.join(os.tmpdir(), "animation-generator", "output");
    this.manimScriptsDir = path.join(os.tmpdir(), "animation-generator", "manim-scripts");
    
    // Ensure directories exist
    this.ensureDirectoriesExist();
  }
  
  private async ensureDirectoriesExist(): Promise<void> {
    try {
      // Check if output directory exists, create if not
      if (!(await existsPromise(this.outputDir))) {
        await mkdirPromise(this.outputDir, { recursive: true });
      }
      
      // Check if scripts directory exists, create if not
      if (!(await existsPromise(this.manimScriptsDir))) {
        await mkdirPromise(this.manimScriptsDir, { recursive: true });
      }
    } catch (error) {
      console.error("Error creating directories:", error);
      throw new Error("Failed to create required directories");
    }
  }
  
  async renderAnimation(
    animationId: number, 
    manimCode: string, 
    progressCallback: (progress: number) => void
  ): Promise<string> {
    try {
      // Create a unique file name for the Manim script
      const scriptFileName = `animation_${animationId}_${Date.now()}.py`;
      const scriptPath = path.join(this.manimScriptsDir, scriptFileName);
      
      // Write Manim code to file
      await writeFilePromise(scriptPath, manimCode);
      
      // Get scene class name from Manim code
      const sceneClassName = this.extractSceneClassName(manimCode);
      if (!sceneClassName) {
        throw new Error("Could not extract scene class name from Manim code");
      }
      
      // Set up the command to run Manim
      const outputFile = path.join(this.outputDir, `animation_${animationId}`);
      const command = `python -m manim ${scriptPath} ${sceneClassName} -o ${outputFile} --format mp4 --progress_bar none`;
      
      // Execute Manim command
      let progress = 0;
      progressCallback(progress);
      
      const { stdout, stderr } = await execPromise(command);
      
      // Handle progress updates (simplified)
      // In a real implementation, you would parse the output of Manim to track progress
      for (let i = 1; i <= 10; i++) {
        progress = i * 10;
        progressCallback(progress);
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Return the path to the rendered video
      // In a production environment, you would upload this to a storage service
      // and return the URL
      return `/api/videos/animation_${animationId}.mp4`;
    } catch (error) {
      console.error("Error rendering animation:", error);
      throw new Error("Failed to render animation");
    }
  }
  
  private extractSceneClassName(manimCode: string): string | null {
    // Simple regex to find a class that extends Scene or ThreeDScene
    const regex = /class\s+(\w+)\s*\(\s*(ThreeDScene|Scene)\s*\)/;
    const match = manimCode.match(regex);
    
    return match ? match[1] : null;
  }
}

export const manimService = new ManimService();
