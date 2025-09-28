import {AppServer, AppSession} from "@mentra/sdk"
import * as fs from "fs"
import * as path from "path"
// Gemini API will be used via fetch calls

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
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash"
const PHOTOS_DIR = path.join(process.cwd(), "photos-audios")

// Gemini API Helper Functions
async function callGeminiAPI(prompt: string, imageData?: { mimeType: string; base64: string }, session?: any, fallbackModel?: string): Promise<string | null> {
  if (!GEMINI_API_KEY) {
    session?.logger?.warn("No Gemini API key - cannot process request")
    return null
  }

  const model = fallbackModel || GEMINI_MODEL
  const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${GEMINI_API_KEY}`
  
  const contents: any = {
    parts: [{ text: prompt }]
  }
  
  if (imageData) {
    contents.parts.push({
      inline_data: {
        mime_type: imageData.mimeType,
        data: imageData.base64
      }
    })
  }

  const body = {
    contents: [contents],
    generationConfig: {
      maxOutputTokens: 300,
      temperature: 0.3
    }
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      // Try fallback model if pro model fails
      if (model === "gemini-1.5-pro" && response.status === 404) {
        session?.logger?.info("Pro model not available, trying flash model...")
        return callGeminiAPI(prompt, imageData, session, "gemini-1.5-flash")
      }
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const result = await response.json()
    return result.candidates?.[0]?.content?.parts?.[0]?.text || null
  } catch (error) {
    session?.logger?.error(`Gemini API call failed: ${String(error)}`)
    return null
  }
}

// Backend API Configuration
const BACKEND_API_URL = process.env.BACKEND_API_URL || "https://unmultipliable-manifestatively-darrin.ngrok-free.dev"
const BACKEND_API_TOKEN = process.env.BACKEND_API_TOKEN || "devsecret123"

// Create photos directory
if (!fs.existsSync(PHOTOS_DIR)) fs.mkdirSync(PHOTOS_DIR, { recursive: true })
if (!MENTRAOS_API_KEY) {
  console.error("MENTRAOS_API_KEY environment variable is required")
  process.exit(1)
}

class NotedApp extends AppServer {
  private isListening = false
  private wakeWords = ["hey noted", "noted", "start listening", "start"]
  private stopWords = ["stop listening", "end session", "goodbye noted", "stop", "done"]
  private notes: string[] = []
  private connectedSessions = new Set<string>()
  private lastProcessedCommand = ""
  
  // Audio processing properties
  private audioBuffer: Int16Array[] = []
  private isRecordingAudio = false
  private audioStartTime: Date | null = null
  private currentAudioLevel = 0
  private audioLevelHistory: number[] = []
  private silenceThreshold = 0.05
  private speechThreshold = 0.15
  
  // VAD-based wake word detection
  private consecutiveHighLevels = 0
  
  // Session management
  private currentSession: SessionData | null = null
  private sessionSegments: VoiceSegment[] = []
  private sessionPhotos: PhotoData[] = []
  private bookmarkedMoments: Bookmark[] = []
  private isSessionActive = false
  private segmentStartTime: Date | null = null
  // Backend session tracking
  private backendSessionId: string | null = null
  
  // Auto-capture settings
  private autoCaptureInterval: NodeJS.Timeout | null = null
  private autoCaptureEnabled = true
  private captureIntervalMs = 30000 // 30 seconds
  protected async onSession(session: AppSession, sessionId: string, userId: string): Promise<void> {
    session.logger.info(`New session: ${sessionId} for user ${userId}`)

    const isNewSession = !this.connectedSessions.has(sessionId)
    
    if (isNewSession) {
      this.connectedSessions.add(sessionId)
    }

    const capabilities = session.capabilities
    if (capabilities) {
      session.logger.info(`Device capabilities: hasDisplay=${capabilities.hasDisplay}, hasCamera=${capabilities.hasCamera}`)
    }

    // Set up event listeners
    this.setupEventListeners(session)
    
    // Welcome new sessions
    if (isNewSession) {
      await this.welcomeUser(session)
    }

    session.events.onDisconnected(() => {
      session.logger.info(`Session ${sessionId} disconnected.`)
      this.connectedSessions.delete(sessionId)
    })
  }

  private setupEventListeners(session: AppSession): void {
    // Just use transcription for everything - back to basics
    session.events.onTranscription((transcription) => {
      session.logger.info(`Transcription: ${transcription.text}`)
      
      if (!this.isListening) {
        if (this.checkWakeWords(transcription.text)) {
          this.startListening(session)
          return // Don't process the wake word as a note
        }
        // Don't process anything else when not listening
        return
      }
      
      if (this.isListening) {
        if (this.checkStopWords(transcription.text)) {
          this.stopListening(session)
          return // Don't process the stop word as a note
        }
        
        // First, check if it's a voice command
        const wasCommand = this.processVoiceCommand(session, transcription.text)
        
        // Only process meaningful transcriptions as notes (but not wake words or commands)
        if (!wasCommand && this.isMeaningfulText(transcription.text) && !this.checkWakeWords(transcription.text)) {
          this.handleTakeNote(session, transcription.text)
        }
      }
    })

    // Subscribe to audio chunks - but only process when listening
    session.subscribe("AUDIO_CHUNK")
    session.events.onAudioChunk((audioData) => {
      // Only process audio chunks when actively listening
      if (this.isListening) {
        this.processAudioChunk(session, audioData)
      }
    })

    session.events.onButtonPress((button) => {
      session.logger.info(`Button pressed: ${button.buttonId} - ${button.pressType}`)
      
      // Handle camera button presses
      if (button.buttonId === 'camera') {
        if (button.pressType === 'short') {
          session.logger.info("Camera button short press - taking photo")
          this.handleTakePhoto(session)
        }
        else if (button.pressType === 'long') {
          session.logger.info("Camera button long press - stopping listening")
          if (this.isListening) {
            this.stopListening(session)
          }
        }
      }
      // Handle main button
      else if (button.buttonId === 'main') {
        if (button.pressType === 'short') {
          session.logger.info("Main button short press - starting listening manually")
          if (!this.isListening) {
            this.startListening(session)
          }
        }
        else if (button.pressType === 'long') {
          session.logger.info("Main button long press - stopping listening")
          if (this.isListening) {
            this.stopListening(session)
          }
        }
      }
    })
  }

  // Voice commands will be processed via external speech recognition on audio files
  // This method is kept for button-based commands and future text input
  private processVoiceCommand(session: AppSession, text: string): boolean {
    const lowerText = text.toLowerCase()
    
    // Prevent duplicate processing of the same command
    if (this.lastProcessedCommand === lowerText) {
      return false
    }
    
    // Check if it's a question first
    if (this.isQuestion(text)) {
      this.lastProcessedCommand = lowerText
      this.handleQuestion(session, text)
      return true
    }
    
    // Basic command processing - could be enhanced with external speech recognition
    if (lowerText.includes("help")) {
      this.lastProcessedCommand = lowerText
      this.showHelp(session)
      return true
    }
    else if (lowerText.includes("analyze photo") || lowerText.includes("describe photo")) {
      this.lastProcessedCommand = lowerText
      this.handleAnalyzePhoto(session)
      return true
    }
    else if (lowerText.includes("mark this") || lowerText.includes("bookmark")) {
      this.lastProcessedCommand = lowerText
      this.handleMarkMoment(session)
      return true
    }
    else if (lowerText.includes("summarize") || lowerText.includes("summary")) {
      this.lastProcessedCommand = lowerText
      this.handleSummarizeAudio(session)
      return true
    }
    else if (lowerText.includes("export") || lowerText.includes("save session")) {
      this.lastProcessedCommand = lowerText
      this.handleExportSession(session)
      return true
    }
    else if (lowerText.includes("start session") || lowerText.includes("start lecture") || lowerText.includes("start meeting")) {
      this.lastProcessedCommand = lowerText
      this.handleStartSession(session, lowerText)
      return true
    }
    else if (lowerText.includes("end session") || lowerText.includes("stop session")) {
      this.lastProcessedCommand = lowerText
      this.handleEndSession(session)
      return true
    }
    else if (lowerText.includes("toggle auto capture") || lowerText.includes("auto capture")) {
      this.lastProcessedCommand = lowerText
      this.handleToggleAutoCapture(session)
      return true
    }
    
    return false // No command was processed
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
      } else {
        // Create a standalone photo entry even without active session
        session.logger.info(`Photo captured outside of active session`)
      }

      // Save file in background - user doesn't wait for this
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
      const filename = `photo_${timestamp}.jpg`
      const filepath = path.join(PHOTOS_DIR, filename)
      
      fs.writeFile(filepath, photo.buffer, (err) => {
        if (err) session.logger.error(`Save error: ${err}`)
        else {
          session.logger.info(`Photo saved: ${filename} (${photo.size} bytes)`)
          // Send to backend for processing
          this.sendPhotoToBackend(photo, filename, session)
        }
      })
      
    } catch (error) {
      session.logger.error(`Photo capture failed: ${String(error)}`)
      await session.audio.speak("Failed to capture photo.")
    }
  }


  private async welcomeUser(session: AppSession): Promise<void> {
    try {
      await session.audio.speak("Welcome to Noted! Say 'hey noted' to start listening.")
      session.logger.info("Wake word detection active - waiting for 'hey noted'")
      session.logger.info("Controls: Main button short press = start, long press = stop, Camera button = photo")
      session.logger.info("Question feature: Ask any question and get AI-powered answers")
    } catch (error) {
      session.logger.error(`Failed to play welcome message: ${String(error)}`)
    }
  }

  private checkWakeWords(text: string): boolean {
    const lowerText = text.toLowerCase().trim()
    
    // Simple wake word detection - check if any wake word is contained
    for (const wakeWord of this.wakeWords) {
      if (lowerText.includes(wakeWord)) {
        console.log(`✅ Wake word detected: "${lowerText}" contains "${wakeWord}"`)
        return true
      }
    }
    
    console.log(`❌ No wake word in: "${lowerText}"`)
    return false
  }

  private checkStopWords(text: string): boolean {
    const lowerText = text.toLowerCase()
    return this.stopWords.some(stopWord => lowerText.includes(stopWord))
  }

  private isMeaningfulText(text: string): boolean {
    const trimmed = text.trim()
    // Skip very short text, single letters, or common filler words
    if (trimmed.length < 2) return false
    if (trimmed.length === 1 && /^[a-zA-Z]$/.test(trimmed)) return false
    
    const lowerText = trimmed.toLowerCase()
    const fillerWords = ['um', 'uh', 'ah', 'er', 'so', 'like', 'you know', 'actually', 'basically']
    
    // Skip if it's just filler words
    if (fillerWords.some(filler => lowerText === filler)) return false
    
    return true
  }

  private isQuestion(text: string): boolean {
    const lowerText = text.toLowerCase().trim()
    
    // Check for question words and patterns
    const questionWords = [
      'what', 'where', 'when', 'why', 'how', 'who', 'which', 'whose', 'whom',
      'is', 'are', 'was', 'were', 'do', 'does', 'did', 'can', 'could', 'would', 'should',
      'will', 'shall', 'may', 'might', 'have', 'has', 'had'
    ]
    
    // Check if text starts with question words
    const startsWithQuestion = questionWords.some(word => lowerText.startsWith(word + ' '))
    
    // Check if text ends with question mark (though transcription might not capture this)
    const endsWithQuestionMark = lowerText.endsWith('?')
    
    // Check for question patterns like "what is", "how do", etc.
    const questionPatterns = [
      /^what\s+(is|are|was|were|do|does|did|can|could|would|should)/,
      /^how\s+(do|does|did|can|could|would|should|is|are|was|were)/,
      /^where\s+(is|are|was|were|do|does|did|can|could|would|should)/,
      /^when\s+(is|are|was|were|do|does|did|can|could|would|should)/,
      /^why\s+(is|are|was|were|do|does|did|can|could|would|should)/,
      /^who\s+(is|are|was|were|do|does|did|can|could|would|should)/,
      /^which\s+(is|are|was|were|do|does|did|can|could|would|should)/,
      /^can\s+you/,
      /^could\s+you/,
      /^would\s+you/,
      /^should\s+i/,
      /^do\s+you\s+know/,
      /^tell\s+me/,
      /^explain/,
      /^define/
    ]
    
    const matchesPattern = questionPatterns.some(pattern => pattern.test(lowerText))
    
    // Also check for common question phrases
    const questionPhrases = [
      'what is the', 'what are the', 'how do i', 'how does', 'where is', 'where are',
      'when is', 'when are', 'why is', 'why are', 'who is', 'who are',
      'capital of', 'population of', 'size of', 'meaning of', 'definition of'
    ]
    
    const containsQuestionPhrase = questionPhrases.some(phrase => lowerText.includes(phrase))
    
    return startsWithQuestion || endsWithQuestionMark || matchesPattern || containsQuestionPhrase
  }

  private async startListening(session: AppSession): Promise<void> {
    this.isListening = true
    this.lastProcessedCommand = "" // Reset command tracking
    
    try {
      await Promise.race([
        session.audio.speak("I'm listening. Audio will be recorded and processed. Say 'stop listening' to end."),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Audio timeout")), 10000)
        )
      ])
      session.logger.info("Started listening mode - audio recording active")
    } catch (error) {
      session.logger.error(`Failed to announce listening start: ${String(error)}`)
      // Continue even if audio fails
    }
  }

  private async stopListening(session: AppSession): Promise<void> {
    this.isListening = false
    
    try {
      await session.audio.speak("Stopped listening. Say 'hey noted' to start again.")
      
      // Process any buffered audio data
      if (this.audioBuffer.length > 0) {
        await this.processBufferedAudio(session)
      }
      
      session.logger.info("Stopped listening mode - audio processing completed")
      
    } catch (error) {
      session.logger.error(`Failed to announce listening stop: ${String(error)}`)
    }
  }

  private handleTakeNote(session: AppSession, content: string): void {
    session.logger.info(`Taking note: ${content}`)
    this.notes.push(content)
    
    // Removed the annoying "Note saved:" confirmation
  }

  private async handleQuestion(session: AppSession, question: string): Promise<void> {
    try {
      session.logger.info(`Question detected: ${question}`)
      
      // Let user know we're processing their question
      await session.audio.speak("Let me answer that for you...")
      
      // Get answer from Gemini
      const answer = await this.getAnswerFromGemini(question, session)
      
      if (answer) {
        // Speak the answer back to the user
        await session.audio.speak(answer)
        session.logger.info(`Question answered: ${answer}`)
        
        // Also add the Q&A to notes for reference
        this.notes.push(`Q: ${question}`)
        this.notes.push(`A: ${answer}`)
      } else {
        await session.audio.speak("I'm sorry, I couldn't process that question right now. Please try again.")
        session.logger.warn(`Failed to get answer for question: ${question}`)
      }
      
    } catch (error) {
      session.logger.error(`Failed to handle question: ${String(error)}`)
      try {
        await session.audio.speak("I'm sorry, I encountered an error while processing your question.")
      } catch (audioError) {
        session.logger.warn(`Failed to speak error message: ${String(audioError)}`)
      }
    }
  }

  private async handleSummarize(session: AppSession): Promise<void> {
    try {
      session.logger.info("Summarizing latest audio session...")
      await session.audio.speak("Let me summarize the latest audio for you...")
      
      // Get the latest audio file for summarization
      const latestAudioFile = this.getLatestAudioFile()
      if (!latestAudioFile) {
        await session.audio.speak("No audio files found to summarize.")
        return
      }
      
      // TODO: Process audio file with Gemini API for summarization
      await session.audio.speak("Audio summarization will be processed by external service. Check logs for details.")
      session.logger.info(`Audio file ready for summarization: ${latestAudioFile}`)
      
    } catch (error) {
      session.logger.error(`Failed to summarize: ${String(error)}`)
      await session.audio.speak("Sorry, I couldn't summarize that right now.")
    }
  }

  private getLatestAudioFile(): string | null {
    try {
      const files = fs.readdirSync(PHOTOS_DIR)
        .filter(file => file.endsWith('.wav'))
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



  private async handleStartSession(session: AppSession, command: string): Promise<void> {
    try {
      if (this.currentSession?.isActive) {
        await session.audio.speak("A session is already active. Say 'end session' to stop it first.")
        return
      }

      // Determine session type from command
      let sessionType: 'lecture' | 'meeting' | 'interview' | 'conversation' = 'conversation'
      if (typeof command === 'string') {
        if (command.includes('lecture')) sessionType = 'lecture'
        else if (command.includes('meeting')) sessionType = 'meeting'
        else if (command.includes('interview')) sessionType = 'interview'
      } else {
        // If command is already a session type, use it directly
        sessionType = command as 'lecture' | 'meeting' | 'interview' | 'conversation'
      }

      // Create new local session
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

      // Ensure a backend session exists and capture its ID for uploads
      try {
        const backendId = await this.ensureBackendSession(session, sessionType)
        this.backendSessionId = backendId
        session.logger.info(`Backend session established: ${backendId}`)
      } catch (e) {
        session.logger.warn(`Failed to pre-create backend session: ${String(e)}`)
      }

      // Start auto-capture for visual snapshots
      this.startAutoCapture(session)

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

      // Stop auto-capture
      this.stopAutoCapture()

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
      
      // Send session data to backend
      await this.sendSessionToBackend(this.currentSession, session)
      
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




  private async showHelp(session: AppSession): Promise<void> {
    const helpText = `Noted - Smart Lecture & Meeting Capture App

Wake Words: "Hey noted", "Noted", "Start listening"
Session Commands: "Start session", "Start lecture", "Start meeting", "End session"
Voice Commands: "Mark this", "Summarize", "Analyze photo", "Toggle auto capture", "Help"
Question Feature: Ask any question like "What's the capital of China?" and get AI-powered answers
Stop Words: "Stop listening", "End session", "Goodbye noted"
Button Controls: Camera short press (photo), Camera long press (stop), Main button (start/stop)
Auto-Capture: Visual snapshots every 30 seconds during sessions
Files saved to: ./photos/ (audio .wav + photos .jpg)
Note: Audio processing and transcription handled by external services`
    
    session.logger.info(`Help requested: ${helpText}`)
    
    try {
      await session.audio.speak("Here are the available commands. Say 'hey noted' to start listening. Say 'start session' to begin recording. While in a session, you can ask questions like 'what's the capital of China' and I'll answer them using AI. You can also say mark this, summarize, analyze photo, or help. Say stop listening to end. Audio will be recorded and processed automatically with AI transcription.")
    } catch (error) {
      session.logger.error(`Failed to speak help: ${String(error)}`)
    }
  }

  // Audio chunk processing methods
  private processAudioChunk(session: AppSession, audioData: any): void {
    try {
      // Convert ArrayBuffer to PCM data
      const pcmData = new Int16Array(audioData.arrayBuffer)
      
      // Calculate audio level for volume monitoring
      const audioLevel = this.calculateAudioLevel(pcmData)
      this.currentAudioLevel = audioLevel
      
      // Log audio level for debugging
      if (Math.random() < 0.05) {
        session.logger.info(`Audio level: ${audioLevel.toFixed(3)}`)
      }
      
      // If we're in listening mode, buffer the audio for processing
      if (this.isListening) {
        this.audioBuffer.push(pcmData)
        
        // Start recording if we haven't already
        if (!this.isRecordingAudio) {
          this.isRecordingAudio = true
          this.audioStartTime = new Date()
          session.logger.info("Started audio recording")
        }
      }
      
      // Wake word detection now handled by VAD
      
    } catch (error) {
      session.logger.error(`Failed to process audio chunk: ${String(error)}`)
    }
  }





  private calculateAudioLevel(pcmData: Int16Array): number {
    // Calculate RMS (Root Mean Square) for audio level
    let sum = 0
    for (let i = 0; i < pcmData.length; i++) {
      sum += pcmData[i] * pcmData[i]
    }
    const rms = Math.sqrt(sum / pcmData.length)
    // Normalize to 0-1 range (assuming 16-bit audio, max value is 32767)
    return Math.min(rms / 32767, 1)
  }

  private getBufferedAudio(): Int16Array | null {
    if (this.audioBuffer.length === 0) return null
    
    // Calculate total length needed
    let totalLength = 0
    for (const chunk of this.audioBuffer) {
      totalLength += chunk.length
    }
    
    // Concatenate all audio chunks
    const combinedAudio = new Int16Array(totalLength)
    let offset = 0
    for (const chunk of this.audioBuffer) {
      combinedAudio.set(chunk, offset)
      offset += chunk.length
    }
    
    return combinedAudio
  }

  private clearAudioBuffer(): void {
    this.audioBuffer = []
    this.isRecordingAudio = false
    this.audioStartTime = null
  }

  private async processBufferedAudio(session: AppSession): Promise<void> {
    try {
      const audioData = this.getBufferedAudio()
      if (!audioData || audioData.length === 0) return
      
      const duration = this.audioStartTime ? 
        (new Date().getTime() - this.audioStartTime.getTime()) / 1000 : 0
      
      session.logger.info(`Processing buffered audio: ${audioData.length} samples, ${duration.toFixed(2)}s duration`)
      
      // Here you could:
      // 1. Send audio to your own speech recognition service
      // 2. Save audio to file for later processing
      // 3. Perform custom audio analysis
      // 4. Send to external transcription service
      
      // Example: Save audio to file for analysis
      await this.saveAudioToFile(audioData, session, duration)
      
      // Example: Send to external speech recognition (commented out)
      // const transcription = await this.transcribeAudio(audioData, session)
      
      // For now, just log the audio statistics
      const avgLevel = this.calculateAudioLevel(audioData)
      session.logger.info(`Audio processed - Avg level: ${avgLevel.toFixed(3)}, Duration: ${duration.toFixed(2)}s`)
      
      // Create voice segment with audio metadata instead of transcription
      if (this.currentSession?.isActive && duration > 1.0) {
        await this.createAudioSegment(session, audioData, duration, avgLevel)
      }
      
    } catch (error) {
      session.logger.error(`Failed to process buffered audio: ${String(error)}`)
    } finally {
      this.clearAudioBuffer()
    }
  }

  private async createAudioSegment(session: AppSession, audioData: Int16Array, duration: number, audioLevel: number): Promise<void> {
    try {
      if (!this.currentSession?.isActive) return
      
      const segment: VoiceSegment = {
        id: `audio_segment_${Date.now()}`,
        timestamp: new Date(),
        transcription: `[Audio Segment - ${duration.toFixed(1)}s, Level: ${audioLevel.toFixed(3)}]`,
        duration: duration,
        isBookmarked: false
      }
      
      this.currentSession.segments.push(segment)
      this.sessionSegments.push(segment)
      
      session.logger.info(`Audio segment created: ${segment.id} - Duration: ${duration.toFixed(2)}s`)
      
    } catch (error) {
      session.logger.error(`Failed to create audio segment: ${String(error)}`)
    }
  }

  private async saveAudioToFile(audioData: Int16Array, session: AppSession, duration: number): Promise<void> {
    try {
      // Create a simple WAV file header (16-bit PCM, mono, 16kHz)
      const sampleRate = 16000
      const numChannels = 1
      const bitsPerSample = 16
      const byteRate = sampleRate * numChannels * bitsPerSample / 8
      const blockAlign = numChannels * bitsPerSample / 8
      const dataSize = audioData.length * 2 // 2 bytes per 16-bit sample
      const fileSize = 36 + dataSize

      // WAV file header
      const header = new ArrayBuffer(44)
      const view = new DataView(header)
      
      // RIFF header
      view.setUint32(0, 0x46464952, true) // "RIFF"
      view.setUint32(4, fileSize, true)
      view.setUint32(8, 0x45564157, true) // "WAVE"
      
      // fmt chunk
      view.setUint32(12, 0x20746d66, true) // "fmt "
      view.setUint32(16, 16, true) // fmt chunk size
      view.setUint16(20, 1, true) // audio format (PCM)
      view.setUint16(22, numChannels, true)
      view.setUint32(24, sampleRate, true)
      view.setUint32(28, byteRate, true)
      view.setUint16(32, blockAlign, true)
      view.setUint16(34, bitsPerSample, true)
      
      // data chunk
      view.setUint32(36, 0x61746164, true) // "data"
      view.setUint32(40, dataSize, true)

      // Convert audio data to bytes
      const audioBytes = new Uint8Array(audioData.length * 2)
      for (let i = 0; i < audioData.length; i++) {
        audioBytes[i * 2] = audioData[i] & 0xff
        audioBytes[i * 2 + 1] = (audioData[i] >> 8) & 0xff
      }

      // Combine header and audio data
      const wavFile = new Uint8Array(44 + audioBytes.length)
      wavFile.set(new Uint8Array(header), 0)
      wavFile.set(audioBytes, 44)

      // Save to file
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
      const filename = `audio_${timestamp}_${duration.toFixed(1)}s.wav`
      const filepath = path.join(PHOTOS_DIR, filename) // Using photos dir for now
      
      fs.writeFileSync(filepath, wavFile)
      session.logger.info(`Audio saved: ${filename} (${wavFile.length} bytes, ${duration.toFixed(2)}s)`)
      
      // Send to backend for processing
      await this.sendAudioToBackend(Buffer.from(wavFile), filename, session)
      
    } catch (error) {
      session.logger.error(`Failed to save audio file: ${String(error)}`)
    }
  }

  // Audio transcription using backend service (which uses Gemini)
  private async transcribeAudio(audioData: Int16Array, session: AppSession): Promise<string> {
    try {
      session.logger.info("Transcribing audio with backend service...")
      
      // Convert Int16Array to WAV buffer
      const wavBuffer = this.int16ArrayToWavBuffer(audioData)
      
      // Create FormData for backend API
      const formData = new FormData()
      const blob = new Blob([new Uint8Array(wavBuffer)], { type: 'audio/wav' })
      formData.append('file', blob, 'audio.wav')
      
      // Use a temporary session ID for transcription
      const tempSessionId = `temp_${Date.now()}`
      
      const response = await fetch(`${BACKEND_API_URL}/sessions/${tempSessionId}/transcribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${BACKEND_API_TOKEN}`,
          'ngrok-skip-browser-warning': 'true',
        },
        body: formData
      })
      
      if (!response.ok) {
        throw new Error(`Backend transcription error: ${response.status}`)
      }
      
      const result = await response.json()
      const transcription = result.text || ''
      
      session.logger.info(`Transcription completed: ${transcription.substring(0, 100)}...`)
      return transcription
      
    } catch (error) {
      session.logger.error(`Failed to transcribe audio: ${String(error)}`)
      return "[Transcription failed]"
    }
  }

  // Convert Int16Array to WAV buffer
  private int16ArrayToWavBuffer(audioData: Int16Array): Buffer {
    const length = audioData.length
    const buffer = Buffer.alloc(44 + length * 2)
    
    // WAV header
    buffer.write('RIFF', 0)
    buffer.writeUInt32LE(36 + length * 2, 4)
    buffer.write('WAVE', 8)
    buffer.write('fmt ', 12)
    buffer.writeUInt32LE(16, 16)
    buffer.writeUInt16LE(1, 20)
    buffer.writeUInt16LE(1, 22)
    buffer.writeUInt32LE(16000, 24)
    buffer.writeUInt32LE(32000, 28)
    buffer.writeUInt16LE(2, 32)
    buffer.writeUInt16LE(16, 34)
    buffer.write('data', 36)
    buffer.writeUInt32LE(length * 2, 40)
    
    // Audio data
    for (let i = 0; i < length; i++) {
      buffer.writeInt16LE(audioData[i], 44 + i * 2)
    }
    
    return buffer
  }

  private startAutoCapture(session: AppSession): void {
    if (!this.autoCaptureEnabled) return
    
    this.autoCaptureInterval = setInterval(async () => {
      if (this.currentSession?.isActive) {
        try {
          session.logger.info("Auto-capturing visual snapshot...")
          await this.handleTakePhoto(session)
        } catch (error) {
          session.logger.error(`Auto-capture failed: ${String(error)}`)
        }
      }
    }, this.captureIntervalMs)
    
    session.logger.info(`Auto-capture started - capturing every ${this.captureIntervalMs / 1000} seconds`)
  }

  private stopAutoCapture(): void {
    if (this.autoCaptureInterval) {
      clearInterval(this.autoCaptureInterval)
      this.autoCaptureInterval = null
    }
  }

  private async handleToggleAutoCapture(session: AppSession): Promise<void> {
    try {
      this.autoCaptureEnabled = !this.autoCaptureEnabled
      
      if (this.autoCaptureEnabled) {
        if (this.currentSession?.isActive) {
          this.startAutoCapture(session)
        }
        await session.audio.speak("Auto-capture enabled. Visual snapshots will be taken every 30 seconds.")
      } else {
        this.stopAutoCapture()
        await session.audio.speak("Auto-capture disabled. Manual photo capture only.")
      }
      
      session.logger.info(`Auto-capture ${this.autoCaptureEnabled ? 'enabled' : 'disabled'}`)
      
    } catch (error) {
      session.logger.error(`Failed to toggle auto-capture: ${String(error)}`)
      await session.audio.speak("Failed to toggle auto-capture.")
    }
  }

  // Backend integration methods
  private async sendAudioToBackend(audioBuffer: Uint8Array, filename: string, session: AppSession): Promise<void> {
    try {
      // Ensure backend session exists
      const sessionId = await this.ensureBackendSession(session, this.currentSession?.type || 'conversation')
      this.backendSessionId = sessionId
      session.logger.info(`Sending audio to backend: ${filename} for backend session ${sessionId}`)

      // Create FormData for file upload
      const formData = new FormData()
      const audioArray = audioBuffer instanceof Uint8Array ? audioBuffer : new Uint8Array(audioBuffer)
      const audioSlice = (audioArray.buffer as ArrayBuffer).slice(audioArray.byteOffset, audioArray.byteOffset + audioArray.byteLength)
      const blob = new Blob([audioSlice], { type: 'audio/wav' })
      formData.append('file', blob, filename)
      
      const response = await fetch(`${BACKEND_API_URL}/sessions/${sessionId}/transcribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${BACKEND_API_TOKEN}`,
          'ngrok-skip-browser-warning': 'true',
        },
        body: formData
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`${response.status} ${response.statusText} - ${errorText}`)
      }

      const result = await response.json()
      session.logger.info(`✅ Audio sent to backend successfully: ${filename}`)
      session.logger.info(`Backend response: ${JSON.stringify(result)}`)

    } catch (error) {
      session.logger.error(`❌ Failed to send audio to backend: ${String(error)}`)
    }
  }

  private async sendPhotoToBackend(photo: PhotoData, filename: string, session: AppSession): Promise<void> {
    try {
      if (!this.currentSession?.isActive) {
        session.logger.info("No active session - skipping backend photo upload")
        return
      }

      const sessionId = await this.ensureBackendSession(session, this.currentSession.type)
      this.backendSessionId = sessionId
      session.logger.info(`Sending photo to backend: ${filename} for backend session ${sessionId}`)

      // Create FormData for file upload
      const formData = new FormData()
      // Convert Node Buffer to precise ArrayBuffer slice for Blob
      const u8 = new Uint8Array(photo.buffer.buffer as ArrayBuffer, photo.buffer.byteOffset, photo.buffer.byteLength)
      const slice = (u8.buffer as ArrayBuffer).slice(u8.byteOffset, u8.byteOffset + u8.byteLength)
      const blob = new Blob([slice], { type: photo.mimeType })
      formData.append('file', blob, filename)
      
      const response = await fetch(`${BACKEND_API_URL}/sessions/${sessionId}/assets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${BACKEND_API_TOKEN}`,
          'ngrok-skip-browser-warning': 'true',
        },
        body: formData
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`${response.status} ${response.statusText} - ${errorText}`)
      }

      const result = await response.json()
      session.logger.info(`✅ Photo sent to backend successfully: ${filename}`)
      session.logger.info(`Backend response: ${JSON.stringify(result)}`)

    } catch (error) {
      session.logger.error(`❌ Failed to send photo to backend: ${String(error)}`)
    }
  }

  private async sendSessionToBackend(sessionData: SessionData, session: AppSession): Promise<void> {
    try {
      // Optionally notify backend; ensure session exists (idempotent)
      const backendId = await this.ensureBackendSession(session, sessionData.type)
      session.logger.info(`Session ended; backend session confirmed: ${backendId}`)

    } catch (error) {
      session.logger.error(`❌ Failed to send session data to backend: ${String(error)}`)
    }
  }

  // AI-powered features

  private async analyzePhotoWithAI(photo: PhotoData, session: AppSession): Promise<string | null> {
    try {
      // Convert photo buffer to base64
      const base64Image = photo.buffer.toString('base64')
      
      const prompt = 'Describe this image in detail. Focus on any text, diagrams, or important visual elements that might be relevant for note-taking or studying.'
      const imageData = {
        mimeType: photo.mimeType,
        base64: base64Image
      }
      
      return await callGeminiAPI(prompt, imageData, session)
      
    } catch (error) {
      session.logger.error(`Photo analysis failed: ${String(error)}`)
      return null
    }
  }

  private async handleAnalyzePhoto(session: AppSession): Promise<void> {
    try {
      const latestPhotoPath = this.getLatestPhoto()
      if (!latestPhotoPath) {
        await session.audio.speak("No photos found. Take a photo first with the camera button.")
        return
      }
      
      await session.audio.speak("Analyzing photo with AI...")
      session.logger.info("Photo analysis requested")
      
      // Read the photo file and create PhotoData object
      const photoBuffer = fs.readFileSync(latestPhotoPath)
      const photoData: PhotoData = {
        buffer: photoBuffer,
        mimeType: 'image/jpeg',
        filename: path.basename(latestPhotoPath),
        requestId: `analysis_${Date.now()}`,
        size: photoBuffer.length,
        timestamp: new Date()
      }
      
      // Analyze photo using OpenAI Vision API
      const analysis = await this.analyzePhotoWithAI(photoData, session)
      
      if (analysis) {
        await session.audio.speak(`Photo analysis: ${analysis}`)
        session.logger.info(`Photo analysis result: ${analysis}`)
      } else {
        await session.audio.speak("Failed to analyze photo. Please try again.")
      }
      
    } catch (error) {
      session.logger.error(`Photo analysis failed: ${String(error)}`)
      await session.audio.speak("Failed to analyze photo.")
    }
  }

  // Enhanced audio summarization
  private async handleSummarizeAudio(session: AppSession): Promise<void> {
    try {
      if (!this.currentSession?.isActive) {
        await session.audio.speak("No active session. Start a session first to summarize audio.")
        return
      }

      const segments = this.currentSession.segments
      if (segments.length === 0) {
        await session.audio.speak("No audio content available to summarize. Record some audio first.")
        return
      }

      await session.audio.speak("Generating summary of your session...")
      
      // Combine all transcriptions
      const fullText = segments.map(s => s.transcription).join(' ')
      
      if (fullText.trim().length < 100) {
        await session.audio.speak("Not enough content to generate a meaningful summary. Record more audio first.")
        return
      }

      // Generate summary using OpenAI
      const summary = await this.generateSummaryFromText(fullText, session)
      
      if (summary) {
        await session.audio.speak(`Summary: ${summary}`)
        session.logger.info(`Session summary: ${summary}`)
      } else {
        await session.audio.speak("Failed to generate summary. Please try again.")
      }
      
    } catch (error) {
      session.logger.error(`Summary generation failed: ${String(error)}`)
      await session.audio.speak("Failed to generate summary.")
    }
  }

  private async generateSummaryFromText(text: string, session: AppSession): Promise<string | null> {
    try {
      const prompt = `Summarize this audio transcription in 2-3 sentences, focusing on the key points and main topics discussed: "${text}"`
      return await callGeminiAPI(prompt, undefined, session)
      
    } catch (error) {
      session.logger.error(`Summary generation failed: ${String(error)}`)
      return null
    }
  }

  private async getAnswerFromGemini(question: string, session: AppSession): Promise<string | null> {
    try {
      session.logger.info(`Sending question to Gemini: ${question}`)

      const prompt = `You are a helpful assistant that provides clear, concise answers to questions. Keep your responses brief and conversational since they will be spoken aloud. Focus on giving accurate, factual information.\n\nQuestion: ${question}`
      const answer = await callGeminiAPI(prompt, undefined, session)
      
      if (answer) {
        session.logger.info(`Gemini response received: ${answer.substring(0, 100)}...`)
        return answer
      }
      
      // Fallback to GPT if Gemini fails
      session.logger.info("Gemini failed, trying GPT fallback...")
      return await this.getAnswerFromGPT(question, session)
      
    } catch (error) {
      session.logger.error(`Failed to get answer from Gemini: ${String(error)}`)
      // Fallback to GPT if Gemini throws error
      session.logger.info("Gemini error, trying GPT fallback...")
      return await this.getAnswerFromGPT(question, session)
    }
  }

  private async getAnswerFromGPT(question: string, session: AppSession): Promise<string | null> {
    try {
      const OPENAI_API_KEY = process.env.OPENAI_API_KEY
      if (!OPENAI_API_KEY) {
        session.logger.warn("No OpenAI API key - cannot use GPT fallback")
        return null
      }

      session.logger.info(`Sending question to GPT: ${question}`)

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{
            role: 'system',
            content: 'You are a helpful assistant that provides clear, concise answers to questions. Keep your responses brief and conversational since they will be spoken aloud. Focus on giving accurate, factual information.'
          }, {
            role: 'user',
            content: question
          }],
          max_tokens: 200,
          temperature: 0.7
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      const answer = result.choices[0]?.message?.content || null
      
      if (answer) {
        session.logger.info(`GPT response received: ${answer.substring(0, 100)}...`)
      }
      
      return answer
      
    } catch (error) {
      session.logger.error(`Failed to get answer from GPT: ${String(error)}`)
      return null
    }
  }

  // Session export functionality
  private async handleExportSession(session: AppSession): Promise<void> {
    try {
      if (!this.currentSession?.isActive) {
        await session.audio.speak("No active session to export. Start a session first.")
        return
      }

      await session.audio.speak("Exporting session data...")
      
      const sessionData = {
        id: this.currentSession.id,
        type: this.currentSession.type,
        startTime: this.currentSession.startTime.toISOString(),
        endTime: this.currentSession.endTime?.toISOString(),
        isActive: this.currentSession.isActive,
        segments: this.currentSession.segments.map(segment => ({
          id: segment.id,
          timestamp: segment.timestamp.toISOString(),
          transcription: segment.transcription,
          duration: segment.duration,
          isBookmarked: segment.isBookmarked
        })),
        photos: this.currentSession.photos.map(photo => ({
          filename: photo.filename,
          mimeType: photo.mimeType,
          size: photo.size,
          timestamp: photo.timestamp.toISOString()
        })),
        bookmarks: this.currentSession.bookmarks.map(bookmark => ({
          id: bookmark.id,
          timestamp: bookmark.timestamp.toISOString(),
          type: bookmark.type,
          description: bookmark.description
        }))
      }

      // Save to JSON file
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
      const filename = `session_${this.currentSession.id}_${timestamp}.json`
      const filepath = path.join(PHOTOS_DIR, filename)
      
      fs.writeFileSync(filepath, JSON.stringify(sessionData, null, 2))
      
      await session.audio.speak(`Session exported successfully to ${filename}`)
      session.logger.info(`Session exported: ${filepath}`)
      
    } catch (error) {
      session.logger.error(`Session export failed: ${String(error)}`)
      await session.audio.speak("Failed to export session.")
    }
  }

  // Ensure a backend session exists; returns backend session id
  private async ensureBackendSession(session: AppSession, title: string): Promise<string> {
    if (this.backendSessionId) return this.backendSessionId
    session.logger.info(`Creating backend session for title: ${title}`)
    const response = await fetch(`${BACKEND_API_URL}/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BACKEND_API_TOKEN}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ title })
    })
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`${response.status} ${response.statusText} - ${errorText}`)
    }
    const result = await response.json()
    const id = result?.id || `standalone_${Date.now()}`
    this.backendSessionId = id
    return id
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

