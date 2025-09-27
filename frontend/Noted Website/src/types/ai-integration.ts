/**
 * ====================================================================================
 * TYPE DEFINITIONS FOR AI INTEGRATION
 * ====================================================================================
 * 
 * This file contains all TypeScript interfaces and types for AI services,
 * Mentra Live glasses integration, and collaboration features.
 */

// Core AI Service Types
export interface AIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  confidence?: number;
  processingTime?: number;
}

export interface AIGenerationOptions {
  difficulty?: 'easy' | 'medium' | 'hard';
  questionCount?: number;
  cardCount?: number;
  focusTopics?: string[];
  style?: 'eli5' | 'academic' | 'conversational' | 'technical';
}

// Mentra Live Glasses Types
export interface MentraLiveDevice {
  id: string;
  name: string;
  batteryLevel: number;
  signalStrength: number;
  isConnected: boolean;
  lastSync: string;
  firmwareVersion: string;
}

export interface MentraLiveRecording {
  id: string;
  deviceId: string;
  timestamp: string;
  duration: number; // in seconds
  participants: string[];
  location?: string;
  transcript: string;
  audioData?: string; // base64 encoded
  confidence: number;
  
  // AR-specific data
  gazeData?: GazePoint[];
  spatialAnchors?: SpatialAnchor[];
  attentionHeatmap?: AttentionData;
  environmentMapping?: EnvironmentMap;
}

export interface GazePoint {
  x: number; // normalized coordinates 0-1
  y: number; // normalized coordinates 0-1
  timestamp: number; // milliseconds from start
  duration: number; // milliseconds
  confidence: number;
  objectId?: string; // if gaze is focused on identified object
}

export interface SpatialAnchor {
  id: string;
  coordinates: {
    x: number;
    y: number;
    z: number;
  };
  orientation: {
    pitch: number;
    yaw: number;
    roll: number;
  };
  content: {
    title: string;
    note: string;
    attachments?: string[];
    timestamp: string;
  };
  type: 'observation' | 'decision' | 'research' | 'reminder';
  isPublic: boolean;
}

export interface AttentionData {
  heatmapPoints: Array<{
    x: number;
    y: number;
    intensity: number;
    duration: number;
  }>;
  focusAreas: Array<{
    area: string;
    percentage: number;
    duration: string;
    confidence: number;
  }>;
  insights: string[];
}

export interface EnvironmentMap {
  objects: Array<{
    id: string;
    type: string;
    position: { x: number; y: number; z: number };
    bounds: { width: number; height: number; depth: number };
    label?: string;
  }>;
  surfaces: Array<{
    id: string;
    type: 'wall' | 'floor' | 'ceiling' | 'table' | 'whiteboard';
    corners: Array<{ x: number; y: number; z: number }>;
  }>;
}

// AI Timeline Types
export interface AITimelineSection {
  id: string;
  type: 'key-definition' | 'action-item' | 'debate' | 'decision' | 'question';
  title: string;
  content: string;
  startTime: string; // MM:SS format
  endTime: string; // MM:SS format
  confidence: number;
  keyTerms?: string[];
  participants?: string[];
  importance?: 'high' | 'medium' | 'low';
  
  // Type-specific metadata
  dueDate?: string; // for action-items
  priority?: 'high' | 'medium' | 'low'; // for action-items
  questions?: string[]; // for question sections
  answered?: boolean; // for question sections
  impact?: string; // for decisions
  affectedParties?: string[]; // for decisions
}

// AI Knowledge Hub Types
export interface AIKnowledgeConcept {
  id: string;
  title: string;
  subject: string;
  definition: string;
  relatedConcepts: string[];
  sourceFiles: string[];
  confidence: number;
  lastMentioned: string;
  mentionCount: number;
  importance: 'high' | 'medium' | 'low';
  tags?: string[];
}

export interface AIKnowledgeMap {
  concepts: AIKnowledgeConcept[];
  connections: Array<{
    from: string; // concept ID
    to: string; // concept ID
    relationship: string;
    strength: number;
  }>;
  subjects: Array<{
    id: string;
    name: string;
    sessionCount: number;
    conceptCount: number;
    lastUpdated: string;
  }>;
}

// AI Study Tools Types
export interface AIQuiz {
  id: string;
  title: string;
  sourceRecording: string;
  questions: AIQuizQuestion[];
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number; // minutes
  topics: string[];
  generated: string;
}

export interface AIQuizQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'open-ended' | 'fill-blank';
  question: string;
  options?: string[]; // for multiple choice
  correctAnswer: string | number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  sourceTimestamp?: string;
}

export interface AIFlashcard {
  id: string;
  front: string;
  back: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  sourceRecording: string;
  confidence: number;
  tags?: string[];
}

export interface AIDebriefDeck {
  id: string;
  title: string;
  sourceRecording: string;
  slides: Array<{
    id: string;
    title: string;
    content: string[];
    visualElements?: string[];
    notes?: string;
  }>;
  keyPoints: string[];
  estimatedPresentationTime: number; // minutes
  generated: string;
}

// Collaboration Types
export interface CollaborationTeam {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
  privacy: 'private' | 'team-only' | 'public';
  createdAt: string;
  lastActivity: string;
  sessionsShared: number;
  totalHours: number;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: string;
  deviceId?: string; // Mentra Live device
  contributedSessions: number;
  lastActive: string;
}

export interface SharedLibrary {
  id: string;
  title: string;
  description: string;
  teamId: string;
  contributors: string[]; // user IDs
  recordings: MentraLiveRecording[];
  mergedInsights: AIKnowledgeMap;
  sessionCount: number;
  conceptCount: number;
  lastUpdated: string;
  permissions: {
    canView: string[];
    canEdit: string[];
    canShare: string[];
  };
}

// Cross-Session Insights Types
export interface CrossSessionPattern {
  id: string;
  type: 'deadline' | 'concept' | 'speaker' | 'topic';
  title: string;
  description: string;
  occurrences: number;
  sessions: string[]; // session IDs
  items: Array<{
    text: string;
    frequency: number;
    context?: string;
    speaker?: string;
    urgency?: 'high' | 'medium' | 'low';
  }>;
  trend: 'increasing' | 'decreasing' | 'stable';
  impact: 'high' | 'medium' | 'low';
  confidence: number;
}

export interface ProductivityMetrics {
  actionItemsGenerated: number;
  decisionsRecorded: number;
  questionsAnswered: number;
  conceptsLearned: number;
  averageSessionLength: number; // minutes
  totalCollaborativeHours: number;
  participantEngagement: number; // percentage
}

// AR Integration Types
export interface ARHeatmap {
  id: string;
  sessionId: string;
  gazePoints: GazePoint[];
  focusAreas: AttentionData['focusAreas'];
  insights: string[];
  visualizationData: {
    heatmapImage?: string; // base64 encoded heatmap overlay
    hotspots: Array<{
      x: number;
      y: number;
      intensity: number;
      label: string;
    }>;
  };
}

export interface ARSyncStatus {
  isConnected: boolean;
  lastSync: string;
  pendingUploads: number;
  syncedSessions: number;
  storageUsed: string;
  storageTotal: string;
  batteryLevel: number;
  signalStrength: number;
}

// Export utility types
export type ViewType = 
  | 'home' 
  | 'timeline' 
  | 'knowledge' 
  | 'replay' 
  | 'recall' 
  | 'insights' 
  | 'tools' 
  | 'ar' 
  | 'collaborate'
  | 'contact'
  | 'help';

export type AIServiceStatus = 'idle' | 'loading' | 'success' | 'error';

export type GenerationProgress = {
  stage: string;
  progress: number; // 0-100
  message: string;
};