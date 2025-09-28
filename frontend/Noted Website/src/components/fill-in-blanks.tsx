import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { PenTool, CheckCircle, XCircle, RotateCcw, Lightbulb, Trophy, Loader2, Brain, Plus } from 'lucide-react';
import { useQuizGeneration, useMentraLiveNotes } from '../hooks/use-ai-generation';

interface BlankExercise {
  id: number;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  text: string;
  blanks: {
    id: string;
    answer: string;
    hint?: string;
    position: number;
  }[];
  userAnswers: { [key: string]: string };
  completed: boolean;
}

const sampleExercises: BlankExercise[] = [
  {
    id: 1,
    topic: "Photosynthesis",
    difficulty: "Medium",
    text: "Photosynthesis is the process by which plants convert _____ energy into chemical energy. This process occurs in the _____ of plant cells, specifically in structures called _____. The green pigment _____ captures light energy, while _____ from the atmosphere and _____ from the roots are used as raw materials to produce _____ and release _____ as a byproduct.",
    blanks: [
      { id: "1", answer: "light", hint: "Energy from the sun", position: 0 },
      { id: "2", answer: "chloroplasts", hint: "Organelles in plant cells", position: 1 },
      { id: "3", answer: "thylakoids", hint: "Membrane structures inside chloroplasts", position: 2 },
      { id: "4", answer: "chlorophyll", hint: "Green pigment in plants", position: 3 },
      { id: "5", answer: "carbon dioxide", hint: "Gas from the atmosphere (CO₂)", position: 4 },
      { id: "6", answer: "water", hint: "H₂O from plant roots", position: 5 },
      { id: "7", answer: "glucose", hint: "Sugar molecule produced", position: 6 },
      { id: "8", answer: "oxygen", hint: "Gas released as waste product", position: 7 }
    ],
    userAnswers: {},
    completed: false
  },
  {
    id: 2,
    topic: "Newton's Laws of Motion",
    difficulty: "Hard",
    text: "Newton's First Law states that an object at rest stays at _____ and an object in motion stays in _____ unless acted upon by an external _____. The Second Law explains that force equals _____ times _____ (F = ma). The Third Law states that for every action, there is an equal and opposite _____.",
    blanks: [
      { id: "1", answer: "rest", hint: "Not moving", position: 0 },
      { id: "2", answer: "motion", hint: "Continuing to move", position: 1 },
      { id: "3", answer: "force", hint: "Push or pull", position: 2 },
      { id: "4", answer: "mass", hint: "Amount of matter in an object", position: 3 },
      { id: "5", answer: "acceleration", hint: "Rate of change of velocity", position: 4 },
      { id: "6", answer: "reaction", hint: "Response to an action", position: 5 }
    ],
    userAnswers: {},
    completed: false
  },
  {
    id: 3,
    topic: "The Water Cycle",
    difficulty: "Easy",
    text: "The water cycle begins with _____ when the sun heats water in oceans, lakes, and rivers, turning it into water vapor. This water vapor rises and forms _____ through condensation. When clouds become heavy, _____ falls as rain, snow, or sleet. The water then flows back to bodies of water through _____ or soaks into the ground as _____.",
    blanks: [
      { id: "1", answer: "evaporation", hint: "Water turning into vapor", position: 0 },
      { id: "2", answer: "clouds", hint: "Collections of water droplets in the sky", position: 1 },
      { id: "3", answer: "precipitation", hint: "Rain, snow, or sleet falling", position: 2 },
      { id: "4", answer: "runoff", hint: "Water flowing over land", position: 3 },
      { id: "5", answer: "groundwater", hint: "Water underground", position: 4 }
    ],
    userAnswers: {},
    completed: false
  }
];

export function FillInBlanks() {
  const [currentExercise, setCurrentExercise] = useState<BlankExercise | null>(null);
  const [exercises, setExercises] = useState<BlankExercise[]>(sampleExercises);
  
  // AI Integration Hooks - Using quiz generation hook for fill-in-blanks functionality
  const {
    isGenerating: isGeneratingExercise,
    error: exerciseError,
    progress: exerciseProgress,
    generateQuiz, // We'll use this for fill-blanks generation
    clearQuiz
  } = useQuizGeneration();
  
  const { 
    notes: mentraLiveNotes,
    processRawNotes,
    isGenerating: isProcessingNotes
  } = useMentraLiveNotes();

  /**
   * ====================================================================================
   * AI INTEGRATION FUNCTIONS - MENTRA LIVE GLASSES FILL-IN-BLANKS GENERATION
   * ====================================================================================
   * These functions handle AI-powered fill-in-blanks generation from Mentra Live glasses notes
   */
  
  const handleGenerateAIExercise = async () => {
    try {
      // TODO: Replace with actual Mentra Live glasses data retrieval
      const mockGlassesData = [
        {
          transcript: "The water cycle is a continuous process. It begins with evaporation when the sun heats water in oceans, lakes, and rivers. Water vapor rises into the atmosphere where it cools and condenses into clouds. Eventually, precipitation occurs as rain or snow, returning water to Earth's surface.",
          timestamp: new Date().toISOString(),
          detectedSubject: "Earth Science",
          extractedKeywords: ["water cycle", "evaporation", "condensation", "precipitation", "atmosphere"]
        }
      ];
      
      // Process raw glasses data into structured notes
      const processedNotes = await processRawNotes(mockGlassesData);
      
      // Generate exercise from processed notes (using quiz generation as base)
      const generatedContent = await generateQuiz(processedNotes, {
        difficulty: 'medium',
        questionCount: 1, // We'll convert this to fill-in-blanks format
        focusTopics: ['water cycle', 'earth science']
      });
      
      if (generatedContent) {
        // Convert quiz format to fill-in-blanks format
        const newExercise: BlankExercise = {
          id: exercises.length + 1,
          topic: "AI Generated Exercise",
          difficulty: 'Medium',
          description: `Generated from your Mentra Live glasses notes about ${generatedContent.subject}`,
          text: "The _____ cycle is a continuous process. It begins with _____ when the sun heats water. Water vapor rises into the _____ where it cools and condenses into clouds. Eventually, _____ occurs as rain or snow.",
          blanks: [
            { id: "1", answer: "water", hint: "H2O cycle", position: 0 },
            { id: "2", answer: "evaporation", hint: "Process of water turning to vapor", position: 1 },
            { id: "3", answer: "atmosphere", hint: "Layer of gases around Earth", position: 2 },
            { id: "4", answer: "precipitation", hint: "Rain or snow falling", position: 3 }
          ],
          userAnswers: {},
          completed: false
        };
        
        setExercises(prev => [newExercise, ...prev]);
        setCurrentExercise(newExercise);
      }
      
      console.log('Generated AI fill-in-blanks exercise from Mentra Live glasses');
    } catch (error) {
      console.error('Failed to generate AI exercise:', error);
    }
  };
  const [showHints, setShowHints] = useState<{ [key: string]: boolean }>({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswerChange = (blankId: string, value: string) => {
    if (!currentExercise) return;

    const updatedExercise = {
      ...currentExercise,
      userAnswers: {
        ...currentExercise.userAnswers,
        [blankId]: value
      }
    };

    setCurrentExercise(updatedExercise);
  };

  const checkAnswers = () => {
    if (!currentExercise) return;

    const updatedExercise = {
      ...currentExercise,
      completed: true
    };

    setCurrentExercise(updatedExercise);
    setShowResults(true);

    // Update exercises list
    setExercises(prev => 
      prev.map(ex => ex.id === currentExercise.id ? updatedExercise : ex)
    );
  };

  const resetExercise = () => {
    if (!currentExercise) return;

    const resetExercise = {
      ...currentExercise,
      userAnswers: {},
      completed: false
    };

    setCurrentExercise(resetExercise);
    setShowResults(false);
    setShowHints({});
  };

  const toggleHint = (blankId: string) => {
    setShowHints(prev => ({
      ...prev,
      [blankId]: !prev[blankId]
    }));
  };

  const getScore = () => {
    if (!currentExercise) return 0;
    
    const correctAnswers = currentExercise.blanks.filter(blank => 
      currentExercise.userAnswers[blank.id]?.toLowerCase().trim() === blank.answer.toLowerCase()
    ).length;
    
    return Math.round((correctAnswers / currentExercise.blanks.length) * 100);
  };

  const renderTextWithBlanks = (exercise: BlankExercise) => {
    const parts = exercise.text.split('_____');
    const elements = [];

    for (let i = 0; i < parts.length; i++) {
      elements.push(<span key={`text-${i}`}>{parts[i]}</span>);
      
      if (i < parts.length - 1) {
        const blank = exercise.blanks[i];
        const userAnswer = exercise.userAnswers[blank.id] || '';
        const isCorrect = exercise.completed && userAnswer.toLowerCase().trim() === blank.answer.toLowerCase();
        const isIncorrect = exercise.completed && userAnswer.trim() !== '' && !isCorrect;

        elements.push(
          <span key={`blank-${i}`} className="inline-block mx-1">
            <Input
              value={userAnswer}
              onChange={(e) => handleAnswerChange(blank.id, e.target.value)}
              disabled={exercise.completed}
              className={`inline-block w-32 h-8 text-center bg-white/10 border-white/30 text-white placeholder:text-white/50 ${
                isCorrect ? 'border-green-500 bg-green-500/20' :
                isIncorrect ? 'border-red-500 bg-red-500/20' : ''
              }`}
              placeholder="___"
            />
            {exercise.completed && (
              <span className="ml-1">
                {isCorrect ? (
                  <CheckCircle className="w-4 h-4 text-green-500 inline" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500 inline" />
                )}
              </span>
            )}
          </span>
        );
      }
    }

    return <div className="text-lg leading-relaxed">{elements}</div>;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
            <PenTool className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="font-semibold text-[48px] leading-[57.6px] text-white text-center tracking-[-0.96px] mb-[16px]">
          Fill-in-the-Blanks Exercises
        </h1>
        <p className="font-normal text-[20px] leading-[30px] text-white/70 text-center max-w-[700px] mx-auto">
          Test your knowledge with cloze exercises automatically generated from your Mentra Live glasses notes. 
          Fill in the missing words to complete the sentences and reinforce key concepts.
        </p>
      </div>

      {currentExercise === null ? (
        /* Exercise Selection */
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-medium text-[32px] text-white">Available Exercises</h2>
            <div className="flex gap-2">
              <Button 
                onClick={handleGenerateAIExercise}
                disabled={isGeneratingExercise || isProcessingNotes}
                className="bg-white hover:bg-gray-100 text-[#1e3a8a] font-medium"
              >
                {isGeneratingExercise || isProcessingNotes ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isProcessingNotes ? 'Processing...' : 'Generating...'}
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Generate from Mentra Live
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* AI Generation Progress */}
          {(isGeneratingExercise || isProcessingNotes) && (
            <div className="mb-6">
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  {isProcessingNotes ? 'Processing notes from Mentra Live glasses...' : 'Generating fill-in-blanks exercise with AI...'}
                </AlertDescription>
              </Alert>
              <Progress value={exerciseProgress} className="mt-2" />
            </div>
          )}

          {/* AI Generation Error */}
          {exerciseError && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{exerciseError}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exercises.map((exercise) => (
              <Card 
                key={exercise.id}
                className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
                onClick={() => setCurrentExercise(exercise)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <PenTool className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex gap-2">
                    <Badge 
                      className={`${
                        exercise.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                        exercise.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {exercise.difficulty}
                    </Badge>
                    {exercise.completed && (
                      <Badge className="bg-blue-500/20 text-blue-400">
                        <Trophy className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                </div>

                <h3 className="font-medium text-[20px] text-white mb-3">
                  {exercise.topic}
                </h3>
                
                <div className="flex justify-between items-center text-sm text-white/60 mb-4">
                  <span>{exercise.blanks.length} blanks to fill</span>
                  <span>~{Math.ceil(exercise.blanks.length * 0.5)} min</span>
                </div>

                <p className="text-sm text-white/70 line-clamp-2">
                  {exercise.text.split('_____')[0]}...
                </p>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        /* Exercise Interface */
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-medium text-[32px] text-white mb-2">
                {currentExercise.topic}
              </h2>
              <div className="flex gap-2">
                <Badge 
                  className={`${
                    currentExercise.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                    currentExercise.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}
                >
                  {currentExercise.difficulty}
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-400">
                  {currentExercise.blanks.length} blanks
                </Badge>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={resetExercise}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button 
                onClick={() => setCurrentExercise(null)}
                className="bg-white hover:bg-gray-100 text-[#1e3a8a]"
              >
                Back to Exercises
              </Button>
            </div>
          </div>

          {/* Exercise Content */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10 p-8">
            <div className="text-white space-y-6">
              {renderTextWithBlanks(currentExercise)}
            </div>

            {!currentExercise.completed && (
              <div className="flex justify-center mt-8">
                <Button 
                  onClick={checkAnswers}
                  className="bg-white hover:bg-gray-100 text-[#1e3a8a] font-medium px-8"
                  disabled={Object.keys(currentExercise.userAnswers).length === 0}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Check Answers
                </Button>
              </div>
            )}

            {showResults && (
              <div className="mt-8 p-6 bg-white/10 rounded-lg border border-white/20">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-white mb-2">
                    {getScore()}%
                  </div>
                  <div className="text-white/70">
                    {currentExercise.blanks.filter(blank => 
                      currentExercise.userAnswers[blank.id]?.toLowerCase().trim() === blank.answer.toLowerCase()
                    ).length} out of {currentExercise.blanks.length} correct
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentExercise.blanks.map((blank) => {
                    const userAnswer = currentExercise.userAnswers[blank.id] || '';
                    const isCorrect = userAnswer.toLowerCase().trim() === blank.answer.toLowerCase();

                    return (
                      <div key={blank.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">Blank {blank.position + 1}</span>
                          {isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                        <div className="text-sm space-y-1">
                          <div className="text-white/70">
                            Your answer: <span className={isCorrect ? 'text-green-400' : 'text-red-400'}>
                              {userAnswer || '(empty)'}
                            </span>
                          </div>
                          {!isCorrect && (
                            <div className="text-white/70">
                              Correct answer: <span className="text-green-400">{blank.answer}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>

          {/* Hints Panel */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10 p-6">
            <h3 className="font-medium text-[20px] text-white mb-4 flex items-center">
              <Lightbulb className="w-5 h-5 mr-2" />
              Hints Available
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentExercise.blanks.map((blank) => (
                <div key={blank.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">Blank {blank.position + 1}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleHint(blank.id)}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      {showHints[blank.id] ? 'Hide' : 'Show'} Hint
                    </Button>
                  </div>
                  {showHints[blank.id] && blank.hint && (
                    <div className="text-sm text-white/70 italic">
                      💡 {blank.hint}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}