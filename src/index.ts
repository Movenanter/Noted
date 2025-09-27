import {AppServer, AppSession} from "@mentra/sdk"
import * as fs from "fs"
import * as path from "path"
import OpenAI from "openai"

interface PhotoData {
  buffer: Buffer
  mimeType: string
  filename: string
  requestId: string
  size: number
  timestamp: Date
}

interface VoiceSegment {
  id: string
  timestamp: Date
  transcription: string
  duration: number
  isBookmarked: boolean
}

interface Bookmark {
  id: string
  timestamp: Date
  type: 'voice' | 'photo' | 'moment'
  segmentId?: string
  photoId?: string
  description?: string
}

interface SessionData {
  id: string
  type: 'lecture' | 'meeting' | 'interview' | 'conversation'
  startTime: Date
  endTime?: Date
  segments: VoiceSegment[]
  photos: PhotoData[]
  bookmarks: Bookmark[]
  isActive: boolean
}

// Configuration
const PACKAGE_NAME = process.env.PACKAGE_NAME
const PORT = parseInt(process.env.PORT || "3000")
const MENTRAOS_API_KEY = process.env.MENTRAOS_API_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const PHOTOS_DIR = path.join(process.cwd(), "photos")

// Initialize OpenAI and create photos directory
const openai = new OpenAI({ apiKey: OPENAI_API_KEY })
if (!fs.existsSync(PHOTOS_DIR)) fs.mkdirSync(PHOTOS_DIR, { recursive: true })
if (!MENTRAOS_API_KEY) {
  console.error("MENTRAOS_API_KEY environment variable is required")
  process.exit(1)
}

class NotedApp extends AppServer {
  private isListening = false
  private currentTranscription = ""
  private wakeWords = ["hey noted", "noted", "start listening", "start"]
  private stopWords = ["stop listening", "end session", "goodbye noted", "stop", "done"]
  private notes: string[] = []
  private connectedSessions = new Set<string>()
  private lastProcessedCommand = ""
  
  // Session management
  private currentSession: SessionData | null = null
  private sessionSegments: VoiceSegment[] = []
  private sessionPhotos: PhotoData[] = []
  private bookmarkedMoments: Bookmark[] = []
  private isSessionActive = false
  private segmentStartTime: Date | null = null
  protected async onSession(session: AppSession, sessionId: string, userId: string): Promise<void> {
    session.logger.info(`New session: ${sessionId} for user ${userId}`)

    const isNewSession = !this.connectedSessions.has(sessionId)
    
    if (isNewSession) {
      this.connectedSessions.add(sessionId)
    } else {
      session.logger.info(`Session ${sessionId} already active, skipping welcome message`)
    }

    const capabilities = session.capabilities
    if (capabilities) {
      session.logger.info(`Device capabilities: hasDisplay=${capabilities.hasDisplay}, hasCamera=${capabilities.hasCamera}`)
    }

    // Always set up event listeners for any session
    this.setupEventListeners(session)
    
    // Only welcome new sessions
    if (isNewSession) {
      await this.welcomeUser(session)
    }

    session.events.onDisconnected(() => {
      session.logger.info(`Session ${sessionId} disconnected.`)
      this.connectedSessions.delete(sessionId)
    })
  }

  private setupEventListeners(session: AppSession): void {
    session.events.onVoiceActivity((vad) => {
      const isSpeaking = vad.status === true || vad.status === "true"
      if (isSpeaking && this.isListening) {
        session.logger.info("User is speaking...")
      }
    })

    session.events.onTranscription((transcription) => {
      session.logger.info(`Voice input received: ${transcription.text}`)
      
      if (!this.isListening) {
        if (this.checkWakeWords(transcription.text)) {
          this.startListening(session)
          return
        }
      }
      
          if (this.isListening) {
            if (this.checkStopWords(transcription.text)) {
              this.stopListening(session)
              return
            }
            
            this.currentTranscription += transcription.text + " "
            this.processVoiceCommand(session, transcription.text)
            
            // Create voice segment if session is active and text is meaningful
            if (this.currentSession?.isActive && this.isMeaningfulText(transcription.text)) {
              this.createVoiceSegment(session, transcription.text).catch(error => 
                session.logger.error(`Failed to create voice segment: ${String(error)}`)
              )
            }
          }
    })

    session.events.onButtonPress((button) => {
      session.logger.info(`Button pressed: ${button.buttonId} - ${button.pressType}`)
      session.logger.info(`Full button data: ${JSON.stringify(button)}`)
      
      // Handle camera button presses based on ASG Client documentation
      if (button.buttonId === 'camera') {
        if (button.pressType === 'short') {
          session.logger.info("Camera button short press - taking photo")
          this.handleTakePhoto(session)
        }
        else if (button.pressType === 'long') {
          session.logger.info("Camera button long press - starting quiz")
          this.handleQuiz(session)
        }
        else {
          session.logger.info(`Unknown press type: ${button.pressType}`)
        }
      }
      else {
        session.logger.info(`Unhandled button: ${button.buttonId} with type ${button.pressType}`)
      }
    })
  }

  private processVoiceCommand(session: AppSession, text: string): void {
    const lowerText = text.toLowerCase()
    
    // Prevent duplicate processing of the same command
    if (this.lastProcessedCommand === lowerText) {
      return
    }
    
    if (lowerText.includes("take note")) {
      this.lastProcessedCommand = lowerText
      this.handleTakeNote(session, this.currentTranscription)
    }
    else if (lowerText.includes("quiz me")) {
      this.lastProcessedCommand = lowerText
      this.handleQuiz(session)
    }
    else if (lowerText.includes("help")) {
      this.lastProcessedCommand = lowerText
      this.showHelp(session)
    }
    else if (lowerText.includes("summarize") || lowerText.includes("summary")) {
      this.lastProcessedCommand = lowerText
      this.handleSummarize(session, this.currentTranscription)
    }
        else if (lowerText.includes("analyze photo") || lowerText.includes("describe photo")) {
          this.lastProcessedCommand = lowerText
          this.handleAnalyzePhotoPlaceholder(session)
        }
        else if (lowerText.includes("mark this") || lowerText.includes("bookmark")) {
          this.lastProcessedCommand = lowerText
          this.handleMarkMoment(session)
        }
        else if (lowerText.includes("start session") || lowerText.includes("start lecture") || lowerText.includes("start meeting")) {
          this.lastProcessedCommand = lowerText
          this.handleStartSession(session, lowerText)
        }
        else if (lowerText.includes("end session") || lowerText.includes("stop session")) {
          this.lastProcessedCommand = lowerText
          this.handleEndSession(session)
        }
  }

  private async handleTakePhoto(session: AppSession): Promise<void> {
    try {
      // Immediate feedback - let user know we're working
      await session.audio.speak("Taking photo...")
      
      const photo = await session.camera.requestPhoto({ 
        size: "medium"
      })
      
      // Confirm completion immediately
      await session.audio.speak("Photo captured!")
      
      // Add photo to current session if active
      if (this.currentSession?.isActive) {
        this.currentSession.photos.push(photo)
        this.sessionPhotos.push(photo)
        session.logger.info(`Photo added to session: ${this.currentSession.id}`)
      }

      // Save file in background - user doesn't wait for this
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
      const filename = `photo_${timestamp}.jpg`
      const filepath = path.join(PHOTOS_DIR, filename)
      
      fs.writeFile(filepath, photo.buffer, (err) => {
        if (err) session.logger.error(`Save error: ${err}`)
        else session.logger.info(`Photo saved: ${filename} (${photo.size} bytes)`)
      })
      
    } catch (error) {
      session.logger.error(`Photo capture failed: ${String(error)}`)
      await session.audio.speak("Failed to capture photo.")
    }
  }


  private async welcomeUser(session: AppSession): Promise<void> {
    try {
      await session.audio.speak("Welcome to Noted! Say 'hey noted' to start listening for voice commands.")
      session.logger.info("Welcome message played")
      session.logger.info("Note: For button presses to work, ensure ASG Client is in APPS or BOTH mode")
    } catch (error) {
      session.logger.error(`Failed to play welcome message: ${String(error)}`)
    }
  }

  private checkWakeWords(text: string): boolean {
    const lowerText = text.toLowerCase()
    return this.wakeWords.some(wakeWord => lowerText.includes(wakeWord))
  }

  private checkStopWords(text: string): boolean {
    const lowerText = text.toLowerCase()
    return this.stopWords.some(stopWord => lowerText.includes(stopWord))
  }

  private async startListening(session: AppSession): Promise<void> {
    this.isListening = true
    this.currentTranscription = ""
    this.lastProcessedCommand = "" // Reset command tracking
    
    try {
      await Promise.race([
        session.audio.speak("I'm listening. You can take notes, ask for quizzes, or say 'stop listening' to end."),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Audio timeout")), 10000)
        )
      ])
      session.logger.info("Started listening mode")
    } catch (error) {
      session.logger.error(`Failed to announce listening start: ${String(error)}`)
      // Continue even if audio fails
    }
  }

  private async stopListening(session: AppSession): Promise<void> {
    this.isListening = false
    
    try {
      await session.audio.speak("Stopped listening. Say 'hey noted' to start again.")
      
      // Clean the transcription with GPT before using it
      const cleanTranscription = await this.cleanTranscriptionText(this.currentTranscription)
      session.logger.info(`Stopped listening mode. Clean transcription: ${cleanTranscription}`)
      
      if (cleanTranscription.trim() && cleanTranscription.length > 10) {
        this.handleTakeNote(session, cleanTranscription.trim())
      }
      
      this.currentTranscription = ""
    } catch (error) {
      session.logger.error(`Failed to announce listening stop: ${String(error)}`)
    }
  }

  private handleTakeNote(session: AppSession, content: string): void {
    session.logger.info(`Taking note: ${content}`)
    this.notes.push(content)
    
    session.audio.speak(`Note saved: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`)
      .catch(error => session.logger.error(`Failed to speak note confirmation: ${String(error)}`))
  }

  private async handleSummarize(session: AppSession, content: string): Promise<void> {
    try {
      session.logger.info(`Summarizing: ${content}`)
      await session.audio.speak("Let me summarize that for you...")
      
      const summary = await this.getSummary(content)
      await session.audio.speak(summary)
      session.logger.info(`Summary: ${summary}`)
      
    } catch (error) {
      session.logger.error(`Failed to summarize: ${String(error)}`)
      await session.audio.speak("Sorry, I couldn't summarize that right now.")
    }
  }

  private async getSummary(content: string): Promise<string> {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful summarizer. Provide a concise summary of the given content in 1-2 sentences. Keep it simple and clear for voice output."
          },
          {
            role: "user",
            content: `Please summarize this: ${content}`
          }
        ],
        max_tokens: 100,
        temperature: 0.3,
      })
      
      return completion.choices[0]?.message?.content || "I couldn't generate a summary."
    } catch (error) {
      throw new Error(`GPT API error: ${String(error)}`)
    }
  }

  private async handleAnalyzePhotoPlaceholder(session: AppSession): Promise<void> {
    try {
      session.logger.info("Photo analysis requested - placeholder for backend processing")
      
      const latestPhoto = this.getLatestPhoto()
      if (!latestPhoto) {
        await session.audio.speak("No photos found. Take a photo first with the camera button.")
        return
      }
      
      session.logger.info(`Found photo for analysis: ${latestPhoto}`)
      
      // TODO: Send photo to backend for analysis
      // This will be implemented by the backend team
      await session.audio.speak("Photo analysis will be processed by the backend. Please check your web app for results.")
      
      session.logger.info("Photo analysis request logged - backend processing needed")
      
    } catch (error) {
      session.logger.error(`Failed to process photo analysis request: ${String(error)}`)
      try {
        await session.audio.speak("Sorry, I couldn't process the photo analysis request right now.")
      } catch (audioError) {
        session.logger.warn(`Failed to speak error message: ${String(audioError)}`)
      }
    }
  }

  private getLatestPhoto(): string | null {
    try {
      const files = fs.readdirSync(PHOTOS_DIR)
        .filter(file => file.endsWith('.jpg'))
        .map(file => ({
          name: file,
          path: path.join(PHOTOS_DIR, file),
          time: fs.statSync(path.join(PHOTOS_DIR, file)).mtime
        }))
        .sort((a, b) => b.time.getTime() - a.time.getTime())
      
      return files.length > 0 ? files[0].path : null
    } catch (error) {
      return null
    }
  }


  private handleQuiz(session: AppSession): void {
    session.logger.info("Starting quiz")
    // TODO: Implement quiz functionality
  }

  private async handleStartSession(session: AppSession, command: string): Promise<void> {
    try {
      if (this.currentSession?.isActive) {
        await session.audio.speak("A session is already active. Say 'end session' to stop it first.")
        return
      }

      // Determine session type from command
      let sessionType: 'lecture' | 'meeting' | 'interview' | 'conversation' = 'conversation'
      if (command.includes('lecture')) sessionType = 'lecture'
      else if (command.includes('meeting')) sessionType = 'meeting'
      else if (command.includes('interview')) sessionType = 'interview'

      // Create new session
      this.currentSession = {
        id: `session_${Date.now()}`,
        type: sessionType,
        startTime: new Date(),
        segments: [],
        photos: [],
        bookmarks: [],
        isActive: true
      }

      this.isSessionActive = true
      this.sessionSegments = []
      this.sessionPhotos = []
      this.bookmarkedMoments = []

      session.logger.info(`Started ${sessionType} session: ${this.currentSession.id}`)
      await session.audio.speak(`${sessionType} session started. I'll capture everything automatically. Say 'mark this' to bookmark important moments.`)
      
    } catch (error) {
      session.logger.error(`Failed to start session: ${String(error)}`)
      await session.audio.speak("Failed to start session.")
    }
  }

  private async handleEndSession(session: AppSession): Promise<void> {
    try {
      if (!this.currentSession?.isActive) {
        await session.audio.speak("No active session to end.")
        return
      }

      // End the session
      this.currentSession.endTime = new Date()
      this.currentSession.isActive = false
      this.isSessionActive = false

      const duration = Math.round((this.currentSession.endTime.getTime() - this.currentSession.startTime.getTime()) / 1000 / 60)
      const segmentCount = this.currentSession.segments.length
      const photoCount = this.currentSession.photos.length
      const bookmarkCount = this.currentSession.bookmarks.length

      session.logger.info(`Ended session: ${this.currentSession.id}, Duration: ${duration}min, Segments: ${segmentCount}, Photos: ${photoCount}, Bookmarks: ${bookmarkCount}`)
      
      await session.audio.speak(`Session ended. Captured ${segmentCount} voice segments, ${photoCount} photos, and ${bookmarkCount} bookmarks over ${duration} minutes.`)
      
      // TODO: Send session data to backend when ready
      // await this.sendSessionToBackend(this.currentSession)
      
      this.currentSession = null
      
    } catch (error) {
      session.logger.error(`Failed to end session: ${String(error)}`)
      await session.audio.speak("Failed to end session.")
    }
  }

  private async handleMarkMoment(session: AppSession): Promise<void> {
    try {
      if (!this.currentSession?.isActive) {
        await session.audio.speak("No active session. Start a session first.")
        return
      }

      const bookmark: Bookmark = {
        id: `bookmark_${Date.now()}`,
        timestamp: new Date(),
        type: 'moment',
        description: 'User marked moment'
      }

      this.currentSession.bookmarks.push(bookmark)
      this.bookmarkedMoments.push(bookmark)

      session.logger.info(`Bookmarked moment: ${bookmark.id} at ${bookmark.timestamp}`)
      await session.audio.speak("Moment bookmarked!")
      
    } catch (error) {
      session.logger.error(`Failed to bookmark moment: ${String(error)}`)
      await session.audio.speak("Failed to bookmark moment.")
    }
  }

  private async createVoiceSegment(session: AppSession, text: string): Promise<void> {
    try {
      if (!this.currentSession?.isActive) return

      // Clean and polish the text with GPT
      const cleanText = await this.cleanTranscriptionText(text)
      
      // Only create segment if we have meaningful content
      if (cleanText.length < 3) return

      // Start timing if this is the first segment or a new segment
      if (!this.segmentStartTime) {
        this.segmentStartTime = new Date()
      }

      // Create voice segment with clean text
      const segment: VoiceSegment = {
        id: `segment_${Date.now()}`,
        timestamp: new Date(),
        transcription: cleanText,
        duration: this.segmentStartTime ? (new Date().getTime() - this.segmentStartTime.getTime()) / 1000 : 0,
        isBookmarked: false
      }

      this.currentSession.segments.push(segment)
      this.sessionSegments.push(segment)

      session.logger.info(`Voice segment created: ${segment.id} - "${cleanText}"`)
      
    } catch (error) {
      session.logger.error(`Failed to create voice segment: ${String(error)}`)
    }
  }

  private isMeaningfulText(text: string): boolean {
    // Skip very short fragments
    if (text.length < 3) return false
    
    // Skip single words that are likely fragments
    const singleWords = ["he", "hey", "what", "the", "and", "or", "but", "so", "if", "when", "where", "why", "how"]
    if (singleWords.includes(text.toLowerCase().trim())) return false
    
    // Skip repeated words
    const words = text.toLowerCase().split(/\s+/)
    if (words.length === 1 && words[0].length < 4) return false
    
    return true
  }

  private async cleanTranscriptionText(text: string): Promise<string> {
    try {
      // Simple local cleanup first
      const wakeWords = ["hey noted", "noted", "start listening", "start", "stop listening", "stop"]
      let cleanText = text.toLowerCase()
      
      wakeWords.forEach(word => {
        cleanText = cleanText.replace(new RegExp(word, 'gi'), '')
      })
      
      cleanText = cleanText.trim()
      
      // If text is too short or empty, return empty
      if (cleanText.length < 5) return ""
      
      // Use GPT to clean the messy transcription
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a text cleaner. Take messy, repeated, or fragmented speech transcription and return only the clean, final intended message. Remove repetitions, fragments, wake words, and command words. Wake words to exclude: 'hey noted', 'noted', 'start listening', 'start', 'stop listening', 'stop'. Command words to exclude: 'mark this', 'bookmark', 'take note', 'summarize', 'analyze photo', 'help'. Return only the clean, meaningful content, nothing else."
          },
          {
            role: "user",
            content: `Clean this transcription: ${cleanText}`
          }
        ],
        max_tokens: 100,
        temperature: 0.1,
      })
      
      const cleaned = completion.choices[0]?.message?.content?.trim() || ""
      return cleaned.length > 3 ? cleaned : ""
      
    } catch (error) {
      console.error(`GPT cleaning failed: ${String(error)}`)
      return text // Return original if GPT fails
    }
  }

  private async showHelp(session: AppSession): Promise<void> {
    const helpText = `Noted - Smart Lecture & Meeting Capture App

Wake Words: "Hey noted", "Noted", "Start listening"
Session Commands: "Start session", "Start lecture", "Start meeting", "End session"
Voice Commands: "Take note", "Mark this", "Summarize", "Analyze photo", "Help"
Stop Words: "Stop listening", "End session", "Goodbye noted"
Button Controls: Camera short press (photo), Camera long press (quiz)
Photos saved to: ./photos/
Note: Photo analysis is handled by backend - check web app for results`
    
    session.logger.info(`Help requested: ${helpText}`)
    
    try {
      await session.audio.speak("Here are the available commands. Wake words: hey noted, noted, or start listening. Session commands: start session, start lecture, start meeting, end session. While listening, you can say take note, mark this, quiz me, summarize, analyze photo, or help. Say stop listening to end.")
    } catch (error) {
      session.logger.error(`Failed to speak help: ${String(error)}`)
    }
  }
}

const server = new NotedApp({
  packageName: PACKAGE_NAME!,
  apiKey: MENTRAOS_API_KEY!,
  port: PORT,
})

server.start().catch(err => {
  console.error("Failed to start server:", err)
})
