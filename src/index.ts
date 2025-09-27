import {AppServer, AppSession} from "@mentra/sdk"
import * as fs from "fs"
import * as path from "path"

// Load configuration from environment variables
const PACKAGE_NAME = process.env.PACKAGE_NAME
const PORT = parseInt(process.env.PORT || "3000")
const MENTRAOS_API_KEY = process.env.MENTRAOS_API_KEY

// Create photos directory if it doesn't exist
const PHOTOS_DIR = path.join(process.cwd(), "photos")
if (!fs.existsSync(PHOTOS_DIR)) {
  fs.mkdirSync(PHOTOS_DIR, { recursive: true })
}

if (!MENTRAOS_API_KEY) {
  console.error("MENTRAOS_API_KEY environment variable is required")
  process.exit(1)
}

/**
 * Noted - A MentraOS application for note taking and quizzing
 * Extends AppServer to handle sessions and user interactions
 */
class NotedApp extends AppServer {
  /**
   * Handle new session connections
   * @param session - The app session instance
   * @param sessionId - Unique identifier for this session
   * @param userId - The user ID for this session
   */
  protected async onSession(session: AppSession, sessionId: string, userId: string): Promise<void> {
    session.logger.info(`New session: ${sessionId} for user ${userId}`)

    // Check device capabilities
    const capabilities = session.capabilities
    if (capabilities) {
      session.logger.info(`Device capabilities: hasDisplay=${capabilities.hasDisplay}, hasCamera=${capabilities.hasCamera}`)
    }

    // Set up event listeners for note-taking and quizzing
    this.setupEventListeners(session)

    // Log when the session is disconnected
    session.events.onDisconnected(() => {
      session.logger.info(`Session ${sessionId} disconnected.`)
    })
  }

  /**
   * Set up event listeners for the app functionality
   * @param session - The app session instance
   */
  private setupEventListeners(session: AppSession): void {
    // Listen for voice commands
    session.events.onTranscription((transcription) => {
      session.logger.info(`Voice input received: ${transcription.text}`)
      
      // Handle note-taking commands
      if (transcription.text.toLowerCase().includes("take note")) {
        this.handleTakeNote(session, transcription.text)
      }
      // Handle quiz commands
      else if (transcription.text.toLowerCase().includes("quiz me")) {
        this.handleQuiz(session)
      }
      // Handle help commands
      else if (transcription.text.toLowerCase().includes("help")) {
        this.showHelp(session)
      }
    })

    // Listen for button presses
    session.events.onButtonPress((button) => {
      session.logger.info(`Button pressed: ${button.buttonId} - ${button.pressType}`)
      
      // Handle camera button short press for photo capture
      if (button.buttonId === 'camera' && button.pressType === 'short') {
        this.handleTakePhoto(session)
      }
      // Handle camera button long press for quiz
      else if (button.buttonId === 'camera' && button.pressType === 'long') {
        this.handleQuiz(session)
      }
    })
  }

  /**
   * Handle photo capture functionality
   * @param session - The app session instance
   */
  private async handleTakePhoto(session: AppSession): Promise<void> {
    try {
      session.logger.info("Taking photo...")
      
      // Check if camera is available
      if (!session.capabilities?.hasCamera) {
        session.logger.error("Camera not available on this device")
        return
      }
      
      // Take the photo
      const photo = await session.camera.requestPhoto({
        size: "large" // Options: "small", "medium", "large"
      })
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
      const filename = `photo_${timestamp}.jpg`
      const filepath = path.join(PHOTOS_DIR, filename)
      
      // Save photo to local directory using the buffer
      fs.writeFileSync(filepath, photo.buffer)
      
      session.logger.info(`Photo saved successfully: ${filename} (${photo.size} bytes, ${photo.mimeType})`)
      
    } catch (error) {
      session.logger.error(`Failed to take photo: ${String(error)}`)
    }
  }


  /**
   * Handle note-taking functionality
   * @param session - The app session instance
   * @param content - The note content
   */
  private handleTakeNote(session: AppSession, content: string): void {
    session.logger.info(`Taking note: ${content}`)
    
    // TODO: Implement note storage and management
    // This would integrate with your web app for persistent storage
  }

  /**
   * Handle quiz functionality
   * @param session - The app session instance
   */
  private handleQuiz(session: AppSession): void {
    session.logger.info("Starting quiz")
    
    // TODO: Implement quiz functionality
    // This would integrate with your web app for quiz management
  }

  /**
   * Show help information
   * @param session - The app session instance
   */
  private showHelp(session: AppSession): void {
    const helpText = `
Noted - Note Taking & Quizzing App

Voice Commands:
- "Take note [content]" - Create a new note
- "Quiz me" - Start a quiz session
- "Help" - Show this help

Button Controls:
- Camera button short press: Take photo 📸
- Camera button long press: Start quiz

Photos saved to: ./photos/
Visit your web app for full functionality!
    `.trim()
    
    session.logger.info(`Help requested: ${helpText}`)
  }
}

// Create and start the app server
const server = new NotedApp({
  packageName: PACKAGE_NAME!,
  apiKey: MENTRAOS_API_KEY!,
  port: PORT,
})

server.start().catch(err => {
  console.error("Failed to start server:", err)
})
