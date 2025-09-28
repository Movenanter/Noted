# Noted AI Integration Setup Guide

## Overview

Noted is designed to integrate with **Mentra Live glasses** and various **AI services** to provide intelligent study tools. This guide explains how to set up and configure the AI integration components.

## 🚀 Quick Start

1. **Copy the environment template:**
   ```bash
   cp env.example .env.local
   ```

2. **Configure your API keys** in `.env.local`

3. **Choose your AI provider** (OpenAI, Anthropic, or custom)

4. **Set up Mentra Live glasses integration**

## 🔧 Configuration

### AI Service Providers

#### OpenAI Setup
```env
VITE_AI_PROVIDER=openai
VITE_AI_API_ENDPOINT=https://api.openai.com/v1
VITE_AI_API_KEY=sk-your-openai-key-here
VITE_OPENAI_MODEL=gpt-4
```

#### Anthropic Claude Setup
```env
VITE_AI_PROVIDER=anthropic
VITE_AI_API_ENDPOINT=https://api.anthropic.com/v1
VITE_AI_API_KEY=sk-ant-your-anthropic-key-here
VITE_ANTHROPIC_MODEL=claude-3-sonnet-20240229
```

#### Custom AI Service
```env
VITE_AI_PROVIDER=custom
VITE_AI_API_ENDPOINT=https://your-custom-ai-api.com/v1
VITE_AI_API_KEY=your-custom-api-key
```

### Mentra Live Glasses Integration

```env
VITE_MENTRA_LIVE_API_ENDPOINT=https://api.mentralive.com/v1
VITE_MENTRA_LIVE_API_KEY=your-mentra-live-api-key
VITE_MENTRA_LIVE_WS_URL=wss://api.mentralive.com/ws
```

## 🧠 AI Features Implementation

### Current AI Integration Points

1. **Concept Maps (`/components/concept-maps.tsx`)**
   - Line 34-65: `handleGenerateFromGlasses()` function
   - Processes Mentra Live notes and generates visual concept maps
   - Uses `useConceptMapGeneration()` hook

2. **Practice Quizzes (`/components/quiz-interface.tsx`)**
   - Line 67-98: `handleGenerateAIQuiz()` function
   - Creates personalized quizzes from glasses notes
   - Uses `useQuizGeneration()` hook

3. **Explainer Mode (`/components/explainer-mode.tsx`)**
   - Line 105-136: `handleGenerateExplanation()` function
   - Generates explanations in different styles (ELI5, technical, analogy, visual)
   - Uses `useExplanationGeneration()` hook

4. **Fill-in-the-Blanks (`/components/fill-in-blanks.tsx`)**
   - Line 99-130: `handleGenerateAIExercise()` function
   - Creates cloze exercises from study notes
   - Uses `useQuizGeneration()` hook

5. **Flashcards (`/components/flashcard-interactive.tsx`)**
   - Ready for AI integration using `useFlashcardsGeneration()` hook

## 🔌 Service Architecture

### Core Files

- **`/types/ai-integration.ts`** - TypeScript interfaces for AI services
- **`/services/ai-service.ts`** - Main AI service implementation
- **`/hooks/use-ai-generation.ts`** - React hooks for AI functionality
- **`/config/env.ts`** - Environment configuration management

### AI Service Structure

```typescript
interface AIService {
  // Process raw Mentra Live glasses data
  processRawNotes(rawData: any[]): Promise<MentraLiveNote[]>;
  
  // Generate different types of study materials
  generateConceptMap(request: AIGenerationRequest): Promise<ConceptMapData>;
  generateQuiz(request: AIGenerationRequest): Promise<GeneratedQuiz>;
  generateFlashcards(request: AIGenerationRequest): Promise<GeneratedFlashcards>;
  generateFillBlanks(request: AIGenerationRequest): Promise<FillInBlanksExercise>;
  generateExplanation(concept: string, notes: MentraLiveNote[], style?: string): Promise<ExplanationGeneration>;
}
```

## 🛠 Implementation Steps

### 1. Replace Mock Data with Real API Calls

In `/services/ai-service.ts`, replace the TODO comments with actual API implementations:

```typescript
// TODO: Replace with actual AI API call
const aiResponse = await this.callAIService('conceptMap', {
  notes: request.notes.map(note => note.content).join('\n\n'),
  parameters: request.parameters
});
```

### 2. Implement Mentra Live Glasses SDK

Replace mock glasses data with real Mentra Live SDK calls:

```typescript
// TODO: Replace with actual Mentra Live glasses data retrieval
const realGlassesData = await MentraLiveSDK.getLatestNotes();
```

### 3. Add Error Handling and Retry Logic

Enhance the AI service with robust error handling:

```typescript
try {
  const result = await aiService.generateQuiz(request);
  return result;
} catch (error) {
  if (error.status === 429) {
    // Handle rate limiting
    await this.retryWithBackoff(request);
  }
  throw error;
}
```

## 🔒 Security Considerations

1. **API Key Management**
   - Never commit API keys to version control
   - Use environment variables for all sensitive data
   - Rotate API keys regularly

2. **Data Privacy**
   - Mentra Live notes may contain sensitive information
   - Implement data encryption for stored notes
   - Follow GDPR/privacy regulations

3. **Rate Limiting**
   - Implement client-side rate limiting
   - Cache AI responses when appropriate
   - Monitor API usage and costs

## 🧪 Testing AI Integration

### Mock Data for Development

The current implementation includes mock data for testing:

- Mock Mentra Live glasses data
- Sample AI responses
- Placeholder API endpoints

### Testing Different AI Providers

1. Set up test API keys for each provider
2. Compare response quality and latency
3. Test error handling and edge cases

## 📊 Monitoring and Analytics

### Performance Metrics

- AI response times
- Success/failure rates
- User engagement with AI features
- Cost tracking for API usage

### Error Tracking

- Failed AI generations
- Mentra Live connection issues
- User feedback on AI quality

## 🚀 Deployment Checklist

- [ ] Configure production API keys
- [ ] Set up monitoring and logging
- [ ] Test Mentra Live glasses connection
- [ ] Verify AI service reliability
- [ ] Enable feature flags appropriately
- [ ] Set up error alerting
- [ ] Configure rate limiting
- [ ] Test backup/fallback scenarios

## 🤝 Contributing

When adding new AI features:

1. Follow the existing hook pattern (`use-ai-generation.ts`)
2. Add proper TypeScript interfaces (`ai-integration.ts`)
3. Implement error handling and loading states
4. Add progress indicators for long operations
5. Include mock data for development/testing

## 📚 Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [Mentra Live SDK Documentation](#) (TODO: Add actual link)
- [React Hooks Best Practices](https://react.dev/reference/react)

---

For questions about AI integration, please check the implementation files mentioned above or refer to the specific TODO comments that indicate where real API integration should be added.