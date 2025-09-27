import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Baby, GraduationCap, Lightbulb, Sparkles, BookOpen, RefreshCw, Loader2 } from 'lucide-react';
import { useExplanationGeneration, useMentraLiveNotes } from '../hooks/use-ai-generation';

type ExplanationStyle = 'eli5' | 'technical' | 'analogy' | 'visual';

interface ExplanationExample {
  concept: string;
  eli5: string;
  technical: string;
  analogy: string;
  visual: string;
}

const explanationExamples: ExplanationExample[] = [
  {
    concept: "Photosynthesis",
    eli5: "Plants eat sunlight! Just like how you eat food to get energy, plants use sunlight, water, and air to make their own food (sugar). The green parts of plants (chlorophyll) are like tiny solar panels that catch the sunlight and turn it into food. It's like magic - plants can make food from nothing but light!",
    technical: "Photosynthesis is a complex biochemical process occurring in chloroplasts where light energy is converted to chemical energy. The process involves two main stages: light-dependent reactions in thylakoid membranes producing ATP and NADPH, and the Calvin cycle in the stroma where CO₂ is fixed into glucose via ribulose-1,5-bisphosphate carboxylase/oxygenase (RuBisCO).",
    analogy: "Think of photosynthesis like a restaurant kitchen. The chloroplasts are the kitchen, sunlight is the electricity powering everything, water and CO₂ are the raw ingredients, and glucose is the finished meal. The chlorophyll molecules are like skilled chefs who know exactly how to combine these ingredients using the energy from light to create food that the plant can use.",
    visual: "Picture a green leaf as a solar-powered factory: ☀️ Sunlight hits the green chlorophyll → 💧 Water comes up from roots → 🌬️ CO₂ enters through tiny pores → ⚡ Energy conversion happens → 🍯 Glucose (sugar) is produced → 💨 Oxygen is released as waste. It's like a biological solar panel system!"
  },
  {
    concept: "Black Holes",
    eli5: "A black hole is like a cosmic vacuum cleaner that's super, super strong! Imagine if you had a vacuum cleaner so powerful that it could suck up everything - even light! That's what a black hole does. It's so heavy and pulls so hard that nothing can escape once it gets too close, not even the fastest thing in the universe (light).",
    technical: "Black holes are regions of spacetime where gravitational effects become so strong that nothing, including electromagnetic radiation, can escape. They form when massive stars collapse, creating a singularity with infinite density and zero volume, surrounded by an event horizon - the boundary beyond which escape velocity exceeds the speed of light.",
    analogy: "A black hole is like a bowling ball placed on a stretched rubber sheet. The ball creates a deep dip that smaller marbles (planets, stars) roll into. The bigger and heavier the ball, the deeper the dip. If you roll a marble too close, it falls in and can never climb back out - that's what happens to matter near a black hole.",
    visual: "Imagine spacetime as a fabric: 🌌 A massive star dies → ⭐ Creates an invisible super-dense point → 🌀 Space curves extremely around it → ⚫ Forms event horizon (point of no return) → 🔄 Everything spirals inward → 💫 Not even light escapes!"
  }
];

export function ExplainerMode() {
  const [selectedConcept, setSelectedConcept] = useState<ExplanationExample>(explanationExamples[0]);
  const [currentStyle, setCurrentStyle] = useState<ExplanationStyle>('eli5');
  const [customConcept, setCustomConcept] = useState('');
  
  // AI Integration Hooks
  const {
    isGenerating,
    error: explanationError,
    progress: explanationProgress,
    explanation: aiExplanation,
    generateExplanation,
    clearExplanation
  } = useExplanationGeneration();
  
  const { 
    notes: mentraLiveNotes,
    processRawNotes,
    isGenerating: isProcessingNotes
  } = useMentraLiveNotes();

  /**
   * ====================================================================================
   * AI INTEGRATION FUNCTIONS - MENTRA LIVE GLASSES EXPLANATION GENERATION
   * ====================================================================================
   * These functions handle AI-powered explanation generation from Mentra Live glasses notes
   */

  const explanationStyles = [
    {
      id: 'eli5' as const,
      name: 'Explain Like I\'m 5',
      description: 'Simple, fun explanations anyone can understand',
      icon: <Baby className="w-5 h-5" />,
      color: 'bg-green-500'
    },
    {
      id: 'technical' as const,
      name: 'Technical Depth',
      description: 'Detailed, scientific explanations with precise terminology',
      icon: <GraduationCap className="w-5 h-5" />,
      color: 'bg-blue-500'
    },
    {
      id: 'analogy' as const,
      name: 'Analogy-Based',
      description: 'Real-world comparisons to make complex concepts relatable',
      icon: <Lightbulb className="w-5 h-5" />,
      color: 'bg-yellow-500'
    },
    {
      id: 'visual' as const,
      name: 'Visual Description',
      description: 'Step-by-step visual breakdowns with emojis and imagery',
      icon: <Sparkles className="w-5 h-5" />,
      color: 'bg-purple-500'
    }
  ];

  const handleGenerateExplanation = async () => {
    if (!customConcept.trim()) return;
    
    try {
      // TODO: Replace with actual Mentra Live glasses data retrieval
      const mockGlassesData = [
        {
          transcript: `Notes about ${customConcept} from the lecture...`,
          timestamp: new Date().toISOString(),
          detectedSubject: "General",
          extractedKeywords: [customConcept.toLowerCase()]
        }
      ];
      
      // Process raw glasses data into structured notes
      const processedNotes = await processRawNotes(mockGlassesData);
      
      // Generate AI explanation from processed notes
      const aiGeneratedExplanation = await generateExplanation(
        customConcept,
        processedNotes,
        currentStyle
      );
      
      // Update selected concept with AI-generated explanation
      if (aiGeneratedExplanation) {
        const updatedConcept: ExplanationExample = {
          concept: aiGeneratedExplanation.concept,
          eli5: aiGeneratedExplanation.explanations.eli5,
          technical: aiGeneratedExplanation.explanations.technical,
          analogy: aiGeneratedExplanation.explanations.analogy,
          visual: aiGeneratedExplanation.explanations.visual
        };
        
        setSelectedConcept(updatedConcept);
      }
      
      console.log('Generated AI explanation for:', customConcept);
    } catch (error) {
      console.error('Failed to generate explanation:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="font-semibold text-[48px] leading-[57.6px] text-white text-center tracking-[-0.96px] mb-[16px]">
          AI Explainer Mode
        </h1>
        <p className="font-normal text-[20px] leading-[30px] text-white/70 text-center max-w-[700px] mx-auto">
          Transform complex concepts from your Mentra Live glasses notes into clear, 
          understandable explanations tailored to your learning style and level.
        </p>
      </div>

      {/* Custom Concept Input */}
      <Card className="bg-white/5 backdrop-blur-sm border border-white/10 p-6">
        <h3 className="font-medium text-[20px] text-white mb-4">
          Generate Explanation for Custom Concept
        </h3>
        
        <div className="flex gap-4">
          <Textarea
            placeholder="Enter any concept you'd like explained (e.g., quantum computing, photosynthesis, machine learning)..."
            value={customConcept}
            onChange={(e) => setCustomConcept(e.target.value)}
            className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none"
            rows={3}
          />
          <Button
            onClick={handleGenerateExplanation}
            disabled={!customConcept.trim() || isGenerating || isProcessingNotes}
            className="bg-white hover:bg-gray-100 text-[#1e3a8a] self-start"
          >
            {isGenerating || isProcessingNotes ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isProcessingNotes ? 'Processing...' : 'Generating...'}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate with AI
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* AI Generation Progress */}
      {(isGenerating || isProcessingNotes) && (
        <div className="mb-6">
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              {isProcessingNotes ? 'Processing notes from Mentra Live glasses...' : 'Generating AI explanation...'}
            </AlertDescription>
          </Alert>
          <Progress value={explanationProgress} className="mt-2" />
        </div>
      )}

      {/* AI Generation Error */}
      {explanationError && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{explanationError}</AlertDescription>
        </Alert>
      )}

      {/* AI-Generated Explanation Display */}
      {aiExplanation && (
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-medium text-white">AI-Generated Explanation</h3>
            <Badge className="bg-blue-500/20 text-blue-400">
              From Mentra Live Notes
            </Badge>
          </div>
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <p className="text-white text-sm mb-2">
              <strong>Concept:</strong> {aiExplanation.concept}
            </p>
            <p className="text-white/90">
              {aiExplanation.explanations[currentStyle]}
            </p>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              size="sm"
              onClick={() => setSelectedConcept({
                concept: aiExplanation.concept,
                eli5: aiExplanation.explanations.eli5,
                technical: aiExplanation.explanations.technical,
                analogy: aiExplanation.explanations.analogy,
                visual: aiExplanation.explanations.visual
              })}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Use This Explanation
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={clearExplanation}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Clear
            </Button>
          </div>
        </Card>
      )}

      {/* Concept Selection */}
      <div>
        <h3 className="font-medium text-[24px] text-white mb-4">Sample Concepts</h3>
        <div className="flex gap-4 mb-8">
          {explanationExamples.map((example, index) => (
            <Button
              key={index}
              variant={selectedConcept.concept === example.concept ? "default" : "outline"}
              onClick={() => setSelectedConcept(example)}
              className={selectedConcept.concept === example.concept 
                ? "bg-white text-[#1e3a8a]" 
                : "bg-white/10 border-white/20 text-white hover:bg-white/20"
              }
            >
              {example.concept}
            </Button>
          ))}
        </div>
      </div>

      {/* Explanation Style Selector */}
      <div>
        <h3 className="font-medium text-[24px] text-white mb-4">Choose Explanation Style</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {explanationStyles.map((style) => (
            <Card
              key={style.id}
              className={`p-4 cursor-pointer transition-all duration-300 border-2 ${
                currentStyle === style.id
                  ? 'bg-white/20 border-white/40'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
              onClick={() => setCurrentStyle(style.id)}
            >
              <div className={`w-12 h-12 ${style.color} rounded-lg flex items-center justify-center mb-3 text-white`}>
                {style.icon}
              </div>
              <h4 className="font-medium text-white mb-1">{style.name}</h4>
              <p className="text-sm text-white/70">{style.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Explanation Display */}
      <Card className="bg-white/5 backdrop-blur-sm border border-white/10 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-medium text-[28px] text-white mb-2">
              {selectedConcept.concept}
            </h3>
            <Badge className={`${explanationStyles.find(s => s.id === currentStyle)?.color}/20 text-white`}>
              {explanationStyles.find(s => s.id === currentStyle)?.name}
            </Badge>
          </div>
          
          <div className={`w-16 h-16 ${explanationStyles.find(s => s.id === currentStyle)?.color} rounded-full flex items-center justify-center`}>
            {explanationStyles.find(s => s.id === currentStyle)?.icon}
          </div>
        </div>

        <div className="bg-white/10 rounded-lg p-6 border border-white/20">
          <div className="font-normal text-[18px] leading-[27px] text-white whitespace-pre-wrap">
            {selectedConcept[currentStyle]}
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <Button className="bg-white hover:bg-gray-100 text-[#1e3a8a]">
            <BookOpen className="w-4 h-4 mr-2" />
            Save Explanation
          </Button>
          <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            <RefreshCw className="w-4 h-4 mr-2" />
            Regenerate
          </Button>
        </div>
      </Card>

      {/* Quick Style Comparison */}
      <Card className="bg-white/5 backdrop-blur-sm border border-white/10 p-6">
        <h3 className="font-medium text-[20px] text-white mb-4">
          Compare All Explanation Styles
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {explanationStyles.map((style) => (
            <div key={style.id} className="bg-white/10 rounded-lg p-4 border border-white/20">
              <div className="flex items-center mb-3">
                <div className={`w-8 h-8 ${style.color} rounded-lg flex items-center justify-center mr-3`}>
                  {style.icon}
                </div>
                <h4 className="font-medium text-white">{style.name}</h4>
              </div>
              <p className="text-sm text-white/80 line-clamp-3">
                {selectedConcept[style.id]}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentStyle(style.id)}
                className="mt-3 bg-transparent border-white/30 text-white hover:bg-white/20"
              >
                View Full
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}