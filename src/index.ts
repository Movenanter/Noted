import {AppServer, AppSession} from "@mentra/sdk"

// Load configuration from environment variables
const PACKAGE_NAME = process.env.PACKAGE_NAME
const PORT = parseInt(process.env.PORT || "3000")
const MENTRAOS_API_KEY = process.env.MENTRAOS_API_KEY

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

    // Display welcome message on the glasses
    session.layouts.showTextWall("Welcome to Noted! Your note-taking and quizzing companion.")

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
      session.logger.info("Voice input received", { transcription })
      
      // Handle note-taking commands
      if (transcription.toLowerCase().includes("take note")) {
        this.handleTakeNote(session, transcription)
      }
      // Handle quiz commands
      else if (transcription.toLowerCase().includes("quiz me")) {
        this.handleQuiz(session)
      }
      // Handle help commands
      else if (transcription.toLowerCase().includes("help")) {
        this.showHelp(session)
      }
    })

    // Listen for button presses
    session.events.onButtonPress((button) => {
      session.logger.info("Button pressed", { button })
      
      switch (button) {
        case "primary":
          this.handleTakeNote(session, "Quick note")
          break
        case "secondary":
          this.handleQuiz(session)
          break
      }
    })
  }

  /**
   * Handle note-taking functionality
   * @param session - The app session instance
   * @param content - The note content
   */
  private handleTakeNote(session: AppSession, content: string): void {
    session.logger.info("Taking note", { content })
    session.layouts.showTextWall(`Note: ${content}`)
    
    // TODO: Implement note storage and management
    // This would integrate with your web app for persistent storage
  }

  /**
   * Handle quiz functionality
   * @param session - The app session instance
   */
  private handleQuiz(session: AppSession): void {
    session.logger.info("Starting quiz")
    session.layouts.showTextWall("Quiz feature coming soon! Use your web app to create and manage quizzes.")
    
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
- Primary button: Quick note
- Secondary button: Start quiz

Visit your web app for full functionality!
    `.trim()
    
    session.layouts.showTextWall(helpText)
  }
}

// Create and start the app server
const server = new NotedApp({
  packageName: PACKAGE_NAME,
  apiKey: MENTRAOS_API_KEY,
  port: PORT,
})

server.start().catch(err => {
  console.error("Failed to start server:", err)
})
