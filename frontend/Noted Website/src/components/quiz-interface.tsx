import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { ChevronLeft, ChevronRight, Loader2, Brain, Zap } from 'lucide-react';
import { useQuizGeneration, useMentraLiveNotes } from '../hooks/use-ai-generation';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

const sampleQuestions: Question[] = [
  {
    id: 1,
    question: "What's another name for a lycanthrope?",
    options: ["A Werewolf", "A Vampire", "A Witch", "A Bat"],
    correctAnswer: 0
  },
  {
    id: 2,
    question: "Which planet is closest to the Sun?",
    options: ["Venus", "Mercury", "Earth", "Mars"],
    correctAnswer: 1
  },
  {
    id: 3,
    question: "What is the largest mammal in the world?",
    options: ["African Elephant", "Blue Whale", "Giraffe", "Polar Bear"],
    correctAnswer: 1
  },
  {
    id: 4,
    question: "In which year did World War II end?",
    options: ["1944", "1945", "1946", "1947"],
    correctAnswer: 1
  },
  {
    id: 5,
    question: "What is the chemical symbol for gold?",
    options: ["Gd", "Go", "Au", "Ag"],
    correctAnswer: 2
  }
];

export function QuizInterface() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [usingAIQuiz, setUsingAIQuiz] = useState(false);
  
  // AI Integration Hooks
  const {
    isGenerating: isGeneratingQuiz,
    error: quizError,
    progress: quizProgress,
    quiz: aiQuiz,
    generateQuiz,
    clearQuiz
  } = useQuizGeneration();
  
  const { 
    notes: mentraLiveNotes,
    processRawNotes,
    isGenerating: isProcessingNotes
  } = useMentraLiveNotes();

  /**
   * ====================================================================================
   * AI INTEGRATION FUNCTIONS - MENTRA LIVE GLASSES QUIZ GENERATION
   * ====================================================================================
   * These functions handle AI-powered quiz generation from Mentra Live glasses notes
   */
  
  const handleGenerateAIQuiz = async () => {
    try {
      // TODO: Replace with actual Mentra Live glasses data retrieval
      const mockGlassesData = [
        {
          transcript: "Today we learned about photosynthesis, the process by which plants convert light energy into chemical energy. The main components are chlorophyll, water, carbon dioxide, and sunlight. The products are glucose and oxygen...",
          timestamp: new Date().toISOString(),
          detectedSubject: "Biology",
          extractedKeywords: ["photosynthesis", "chlorophyll", "glucose", "oxygen", "carbon dioxide"]
        }
      ];
      
      // Process raw glasses data into structured notes
      const processedNotes = await processRawNotes(mockGlassesData);
      
      // Generate quiz from processed notes
      const newQuiz = await generateQuiz(processedNotes, {
        difficulty: 'medium',
        questionCount: 5,
        focusTopics: ['photosynthesis', 'biology']
      });
      
      if (newQuiz) {
        setUsingAIQuiz(true);
        setCurrentQuestion(0);
        setSelectedAnswer("");
        setScore(0);
        setShowResult(false);
      }
      
      console.log('Generated AI quiz from Mentra Live glasses:', newQuiz);
    } catch (error) {
      console.error('Failed to generate AI quiz:', error);
    }
  };

  // Get current questions based on whether using AI quiz or sample quiz
  const currentQuestions = usingAIQuiz && aiQuiz 
    ? aiQuiz.questions.map((q, index) => ({
        id: index + 1,
        question: q.question,
        options: q.options || [],
        correctAnswer: typeof q.correctAnswer === 'string' 
          ? q.options?.indexOf(q.correctAnswer) || 0 
          : Array.isArray(q.correctAnswer) 
            ? q.options?.indexOf(q.correctAnswer[0]) || 0
            : 0
      }))
    : sampleQuestions;
  const currentQuizTitle = usingAIQuiz && aiQuiz ? aiQuiz.title : "Sample Quiz";

  const totalQuestions = currentQuestions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  const handleNext = () => {
    if (selectedAnswer) {
      const isCorrect = parseInt(selectedAnswer) === sampleQuestions[currentQuestion].correctAnswer;
      if (isCorrect) {
        setScore(score + 1);
      }

      if (currentQuestion < totalQuestions - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer("");
      } else {
        setShowResult(true);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer("");
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer("");
    setScore(0);
    setShowResult(false);
  };

  if (showResult) {
    return (
      <Card className="w-full max-w-2xl mx-auto border-2 border-[#030213] shadow-lg bg-[#030213]">
        <CardContent className="p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Quiz Complete!</h2>
          <div className="text-6xl mb-4">🎉</div>
          <p className="text-xl mb-6 text-white">
            You scored <span className="font-bold text-[#4ade80]">{score}</span> out of{" "}
            <span className="font-bold text-white">{totalQuestions}</span>
          </p>
          <div className="text-lg mb-6 text-white">
            Percentage: <span className="font-bold text-[#4ade80]">{Math.round((score / totalQuestions) * 100)}%</span>
          </div>
          <Button onClick={resetQuiz} className="bg-white hover:bg-gray-100 text-[#1e3a8a]">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Generation Controls */}
      <Card className="w-full max-w-2xl mx-auto border-2 border-[#030213] shadow-lg bg-[#030213]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-white mb-2">
                {usingAIQuiz ? 'AI-Generated Quiz' : 'Sample Quiz'}
              </h3>
              <p className="text-sm text-white/70">
                {usingAIQuiz 
                  ? 'Generated from your Mentra Live glasses notes' 
                  : 'Generate a personalized quiz from your notes'
                }
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleGenerateAIQuiz}
                disabled={isGeneratingQuiz || isProcessingNotes}
                className="bg-white hover:bg-gray-100 text-[#1e3a8a]"
              >
                {isGeneratingQuiz || isProcessingNotes ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isProcessingNotes ? 'Processing...' : 'Generating...'}
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Generate AI Quiz
                  </>
                )}
              </Button>
              {usingAIQuiz && (
                <Button
                  onClick={() => {
                    setUsingAIQuiz(false);
                    clearQuiz();
                    resetQuiz();
                  }}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Use Sample Quiz
                </Button>
              )}
            </div>
          </div>

          {/* AI Generation Progress */}
          {(isGeneratingQuiz || isProcessingNotes) && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span className="text-sm text-white">
                  {isProcessingNotes ? 'Processing notes from Mentra Live glasses...' : 'Generating AI quiz...'}
                </span>
              </div>
              <Progress value={quizProgress} className="h-2" />
            </div>
          )}

          {/* AI Generation Error */}
          {quizError && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{quizError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Quiz Interface */}
      <Card className="w-full max-w-2xl mx-auto border-2 border-[#030213] shadow-lg bg-[#030213]">
        <CardContent className="p-8">
          {/* Quiz Title */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">{currentQuizTitle}</h2>
            {usingAIQuiz && aiQuiz && (
              <div className="flex justify-center gap-2">
                <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">
                  AI Generated
                </span>
                <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                  {aiQuiz.subject}
                </span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-white/80 mb-2">
            <span>Question {currentQuestion + 1} of {totalQuestions}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="bg-white/20 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-white h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <h2 className="text-2xl font-bold text-white mb-6 leading-relaxed">
          {currentQuestions[currentQuestion].question}
        </h2>

        {/* Answer Options */}
        <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer} className="space-y-3 mb-8">
          {currentQuestions[currentQuestion].options.map((option, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border border-white/20 hover:bg-white/10 transition-colors">
              <RadioGroupItem value={index.toString()} id={`option-${index}`} className="border-white text-white" />
              <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-lg text-white">
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex items-center gap-2 bg-white hover:bg-gray-100 text-[#1e3a8a] border-white"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="text-sm text-white/60">
            {currentQuestion + 1} / {totalQuestions}
          </div>

          <Button
            onClick={handleNext}
            disabled={!selectedAnswer}
            className="flex items-center gap-2 bg-white hover:bg-gray-100 text-[#1e3a8a]"
          >
            {currentQuestion === totalQuestions - 1 ? "Finish" : "Next"}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}