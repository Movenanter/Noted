import { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Clock, 
  Play, 
  Pause, 
  Volume2, 
  Timer, 
  User, 
  MessageSquare, 
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  Lightbulb,
  Calendar,
  Loader2,
  Brain,
  Search,
  Image,
  FileText,
  Camera,
  Quote
} from 'lucide-react';
import { useMentraLiveNotes } from '../hooks/use-ai-generation';
import Backend from '../services/backend';
import { openNotifySocket } from '../services/notify';
import { ENV } from '../config/env';

// Enhanced interface to support visual context
interface TimelineSection {
  id: string;
  type: string;
  title: string;
  startTime: string;
  endTime: string;
  content: string;
  transcript: string;
  confidence: number;
  keyTerms?: string[];
  dueDate?: string;
  priority?: string;
  participants?: string[];
  keyPoints?: string[];
  impact?: string;
  affectedParties?: string[];
  questions?: string[];
  answered?: boolean;
  visualContext?: {
    type: 'whiteboard' | 'slides' | 'document' | 'screen' | 'equation';
    image: string;
    description: string;
    timestamp: string;
  };
  keyQuote?: string;
  boardSnapshot?: string;
}

// Mock conversation data with visual context for the 3 use cases
const mockConversation = {
  id: 'conv-001',
  title: 'Advanced Calculus: Derivative Applications',
  date: '2024-01-15',
  duration: '50:15',
  participants: ['Prof. Martinez', 'Graduate Students'],
  sections: [
    {
      id: 'section-1',
      type: 'equation-derivation',
      title: 'Chain Rule Derivation on Whiteboard',
      startTime: '08:32',
      endTime: '15:45',
      content: 'Professor Martinez derives the chain rule step-by-step, showing the mathematical proof with visual examples.',
      transcript: 'Now let\'s work through the chain rule derivation. If we have f(g(x)), then the derivative is f\'(g(x)) × g\'(x). Let me show you why this works...',
      confidence: 0.97,
      keyTerms: ['chain rule', 'derivative', 'composite function', 'differentiation'],
      visualContext: {
        type: 'whiteboard' as const,
        image: 'https://images.unsplash.com/photo-1596495577886-d920f1fb7238?w=800&h=600&fit=crop',
        description: 'Whiteboard showing complete chain rule derivation with step-by-step mathematical proof and example f(g(x)) = sin(x²)',
        timestamp: '08:32'
      },
      keyQuote: '"The chain rule is fundamental to understanding how composite functions change - you multiply the outer derivative by the inner derivative."',
      boardSnapshot: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=600&fit=crop'
    },
    {
      id: 'section-2',
      type: 'client-decision',
      title: 'Budget Allocation Decision - Q2 Marketing',
      startTime: '22:15',
      endTime: '28:40',
      content: 'Key decision made to allocate 40% of Q2 budget to digital marketing campaigns based on ROI analysis.',
      transcript: 'Based on our analysis, I recommend we shift 40% of our Q2 marketing budget to digital channels. The ROI data clearly shows...',
      confidence: 0.94,
      impact: 'budget-reallocation',
      affectedParties: ['Marketing Team', 'Finance Department', 'Campaign Managers'],
      visualContext: {
        type: 'slides' as const,
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
        description: 'ROI analysis chart showing digital vs traditional marketing performance with Q2 budget breakdown',
        timestamp: '22:15'
      },
      keyQuote: '"The data is clear - digital campaigns are delivering 3x better ROI than traditional channels. We need to act on this."',
      boardSnapshot: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop'
    },
    {
      id: 'section-3',
      type: 'interview-quote',
      title: 'CEO Quote on Market Expansion Strategy',
      startTime: '45:20',
      endTime: '47:55',
      content: 'CEO discusses the company\'s aggressive expansion into European markets with specific timeline and investment details.',
      transcript: 'We\'re committing $50 million to European expansion over the next 18 months. This isn\'t just about revenue - it\'s about establishing our brand globally.',
      confidence: 0.92,
      keyPoints: ['European expansion', '$50M investment', '18-month timeline', 'brand establishment'],
      visualContext: {
        type: 'document' as const,
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
        description: 'CEO presentation slide showing European market expansion strategy with timeline and investment breakdown',
        timestamp: '45:20'
      },
      keyQuote: '"This $50 million investment isn\'t just about revenue - it\'s about establishing our brand as a global leader in the European market over the next 18 months."',
      boardSnapshot: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&h=600&fit=crop'
    },
    {
      id: 'section-4',
      type: 'lab-procedure',
      title: 'Protein Synthesis Experimental Setup',
      startTime: '12:10',
      endTime: '18:30',
      content: 'Detailed explanation of protein synthesis lab procedure with equipment setup and safety protocols.',
      transcript: 'First, we need to prepare the ribosome extract. Make sure your pipettes are calibrated and your workspace is sterile...',
      confidence: 0.89,
      keyTerms: ['protein synthesis', 'ribosome extract', 'pipette calibration', 'sterile technique'],
      visualContext: {
        type: 'screen' as const,
        image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&h=600&fit=crop',
        description: 'Lab equipment setup showing microscope, pipettes, and protein synthesis materials with step-by-step procedure',
        timestamp: '12:10'
      },
      keyQuote: '"Precision in protein synthesis experiments requires perfect sterile technique - one contamination ruins the entire batch."'
    }
  ] as TimelineSection[]
};

export function ConversationTimeline() {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState('00:00');
  const [searchQuery, setSearchQuery] = useState('');
  const [showVisualContext, setShowVisualContext] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [chunks, setChunks] = useState<{id:string;text:string;bookmarked:boolean}[]>([]);
  const [assets, setAssets] = useState<{id:string;path:string}[]>([]);
  const [chunkQuery, setChunkQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // AI Integration Hooks
  const { 
    notes: mentraLiveNotes,
    processRawNotes,
    isGenerating: isProcessingNotes,
    error: notesError
  } = useMentraLiveNotes();

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'equation-derivation':
        return Lightbulb;
      case 'client-decision':
        return AlertTriangle;
      case 'interview-quote':
        return Quote;
      case 'lab-procedure':
        return CheckCircle;
      default:
        return MessageSquare;
    }
  };

  const getSectionColor = (type: string) => {
    switch (type) {
      case 'equation-derivation':
        return 'from-yellow-500 to-orange-500';
      case 'client-decision':
        return 'from-red-500 to-pink-500';
      case 'interview-quote':
        return 'from-blue-500 to-cyan-500';
      case 'lab-procedure':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const formatSectionType = (type: string) => {
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const handleGenerateTimelineFromGlasses = async () => {
    try {
      const mockGlassesRecording = {
        audioData: 'base64-encoded-audio',
        timestamp: new Date().toISOString(),
        duration: 3015, // 50:15 in seconds
        location: 'Conference Room A',
        participants: ['Prof. Martinez', 'Students']
      };
      
      const processedData = await processRawNotes([mockGlassesRecording]);
      console.log('Generated timeline from Mentra Live glasses recording:', processedData);
    } catch (error) {
      console.error('Failed to generate timeline from glasses recording:', error);
    }
  };

  const jumpToSection = (sectionId: string, startTime: string) => {
    setSelectedSection(sectionId);
    setCurrentTime(startTime);
    console.log(`Jumping to section ${sectionId} at time ${startTime}`);
  };

  const filteredSections = mockConversation.sections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (section.keyQuote && section.keyQuote.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Ensure a session exists and load timeline from backend
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const existing = sessionStorage.getItem('noted.sid');
        let sid = existing;
        if (!sid) {
          const created = await Backend.createSession('Web Timeline');
          sid = created.id;
          sessionStorage.setItem('noted.sid', sid);
        }
        if (!mounted) return;
        setSessionId(sid!);
        const tl = await Backend.getTimeline(sid!);
        if (!mounted) return;
        setChunks(tl.chunks);
        setAssets(tl.assets || []);
      } catch (e:any) {
        setError(e.message || 'Failed to load timeline');
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Open notify WebSocket and refresh on relevant events
  useEffect(() => {
    const ws = openNotifySocket((e) => {
      if (!sessionId) return;
      // Update only on this session's events or global ones
      if (e.session_id && e.session_id !== sessionId) return;
      if (
        e.event_type === 'chunk.saved' ||
        e.event_type === 'transcript.saved' ||
        e.event_type === 'asset.uploaded' ||
        e.event_type === 'bookmark.added' ||
        e.event_type === 'summary.generated' ||
        e.event_type === 'flashcards.generated'
      ) {
        Backend.getTimeline(sessionId).then((tl) => {
          setChunks(tl.chunks);
          setAssets(tl.assets || []);
        }).catch(() => {});
      }
    });
    return () => {
      try { ws.close(); } catch {}
    };
  }, [sessionId]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
            <Clock className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="font-semibold text-[48px] leading-[57.6px] text-white text-center tracking-[-0.96px] mb-[16px]">
          Searchable Timeline with Visual Context
        </h1>
        <p className="text-[20px] leading-[28px] text-white/70 text-center max-w-4xl mx-auto">
          Jump to specific moments with audio + visual context. See board snapshots, slides, and documents 
          alongside transcripts for complete understanding.
        </p>
      </div>

      {/* Use Case Examples */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-white font-medium">Student Use Case</h3>
          </div>
          <p className="text-white/70 text-sm">
            Review exactly when the professor derived an equation with board snapshot alongside transcript
          </p>
        </Card>

        <Card className="bg-white/5 backdrop-blur-sm border border-white/10 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-white font-medium">Professional Use Case</h3>
          </div>
          <p className="text-white/70 text-sm">
            Instantly revisit key decisions with spoken context and whiteboard notes in one place
          </p>
        </Card>

        <Card className="bg-white/5 backdrop-blur-sm border border-white/10 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Quote className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-white font-medium">Journalist Use Case</h3>
          </div>
          <p className="text-white/70 text-sm">
            Search by keyword and jump to exact quotes with image references without replaying hours
          </p>
        </Card>
      </div>

      {/* Generate Timeline Controls */}
      <Card className="bg-white/5 backdrop-blur-sm border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-white mb-2">AI Timeline Generation</h3>
            <p className="text-sm text-white/70">
              Process recordings from your Mentra Live glasses to create intelligent timelines with visual context
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowVisualContext(!showVisualContext)}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Image className="w-4 h-4 mr-2" />
              {showVisualContext ? 'Hide' : 'Show'} Visual Context
            </Button>
            <Button
              onClick={handleGenerateTimelineFromGlasses}
              disabled={isProcessingNotes}
              className="bg-white hover:bg-gray-100 text-[#1e3a8a]"
            >
              {isProcessingNotes ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Generate from Recording
                </>
              )}
            </Button>
          </div>
        </div>

        {isProcessingNotes && (
          <div className="mb-4">
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Processing Mentra Live glasses recording and extracting visual context...
              </AlertDescription>
            </Alert>
            <Progress value={65} className="mt-2" />
          </div>
        )}

        {notesError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{notesError}</AlertDescription>
          </Alert>
        )}
      </Card>

      {/* Current Conversation Info */}
      <Card className="bg-white/5 backdrop-blur-sm border border-white/10 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-medium text-white mb-2">{mockConversation.title}</h2>
            <div className="flex items-center space-x-4 text-white/70">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{mockConversation.date}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Timer className="w-4 h-4" />
                <span>{mockConversation.duration}</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>{mockConversation.participants.join(', ')}</span>
              </div>
            </div>
          </div>
          
          <Badge className="bg-blue-500/20 text-blue-400">
            AI Generated + Visual Context
          </Badge>
        </div>

        {/* Audio Controls */}
        <div className="flex items-center space-x-4 mb-6 p-4 bg-white/5 rounded-lg">
          <Button
            onClick={() => setIsPlaying(!isPlaying)}
            className="bg-white hover:bg-gray-100 text-[#1e3a8a]"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm text-white/70 mb-1">
              <span>{currentTime}</span>
              <span>{mockConversation.duration}</span>
            </div>
            <Progress value={12} className="h-2" />
          </div>
          
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
            <Volume2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Search Timeline */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by keywords, quotes, or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </Card>

      {/* Timeline Sections */}
      <div className="space-y-4">
        <h3 className="font-medium text-[24px] text-white">Timeline Sections with Visual Context</h3>
        
        <div className="space-y-6">
          {filteredSections.map((section, index) => {
            const IconComponent = getSectionIcon(section.type);
            const isSelected = selectedSection === section.id;
            
            return (
              <Card 
                key={section.id}
                className={`bg-white/5 backdrop-blur-sm border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 cursor-pointer ${
                  isSelected ? 'ring-2 ring-blue-500 bg-white/10' : ''
                }`}
                onClick={() => jumpToSection(section.id, section.startTime)}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${getSectionColor(section.type)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium text-white text-lg">{section.title}</h4>
                        <Badge className="bg-white/10 text-white text-xs">
                          {formatSectionType(section.type)}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2 text-white/70 text-sm">
                        <span>{section.startTime}</span>
                        <span>→</span>
                        <span>{section.endTime}</span>
                      </div>
                    </div>
                    
                    <p className="text-white/80 text-sm mb-3 leading-relaxed">
                      {section.content}
                    </p>

                    {/* Key Quote */}
                    {section.keyQuote && (
                      <div className="bg-blue-500/10 border-l-4 border-blue-500 p-3 mb-4 rounded-r-lg">
                        <div className="flex items-start gap-2">
                          <Quote className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                          <p className="text-blue-100 text-sm italic leading-relaxed">
                            "{section.keyQuote}"
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Visual Context */}
                    {showVisualContext && section.visualContext && (
                      <div className="bg-white/5 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Camera className="w-4 h-4 text-white/70" />
                              <span className="text-white/70 text-sm font-medium">
                                {section.visualContext.type.charAt(0).toUpperCase() + section.visualContext.type.slice(1)} Context
                              </span>
                              <Badge className="bg-green-500/20 text-green-400 text-xs">
                                @ {section.visualContext.timestamp}
                              </Badge>
                            </div>
                            <p className="text-white/80 text-sm mb-3">
                              {section.visualContext.description}
                            </p>
                          </div>
                          <div className="w-32 h-24 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                            <img 
                              src={section.visualContext.image} 
                              alt={section.visualContext.description}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Section-specific metadata */}
                    {section.keyTerms && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {section.keyTerms.map((term, i) => (
                          <Badge key={i} className="bg-yellow-500/20 text-yellow-400 text-xs">
                            {term}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-xs text-white/70">
                            {Math.round(section.confidence * 100)}% confidence
                          </span>
                        </div>
                        {section.visualContext && (
                          <div className="flex items-center space-x-2">
                            <Image className="w-3 h-3 text-blue-400" />
                            <span className="text-xs text-blue-400">Visual context available</span>
                          </div>
                        )}
                      </div>
                      
                      <Button
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                          e.stopPropagation();
                          jumpToSection(section.id, section.startTime);
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1"
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Jump to {section.startTime}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {filteredSections.length === 0 && searchQuery && (
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 text-center">
          <p className="text-white/70">No timeline sections found matching "{searchQuery}"</p>
        </Card>
      )}

      {/* Backend Timeline Chunks */}
      <div className="space-y-4">
        <h3 className="font-medium text-[24px] text-white">Backend Transcript Chunks</h3>
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-white/70 text-sm">
              Session: {sessionId ?? 'n/a'} · {chunks.length} chunks
            </div>
            <div className="relative w-80 max-w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-4 h-4" />
              <input
                type="text"
                placeholder="Search transcript chunks..."
                value={chunkQuery}
                onChange={(e) => setChunkQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {loading && (
            <div className="text-white/70 text-sm">Loading timeline…</div>
          )}
          {error && (
            <div className="text-red-300 text-sm">{error}</div>
          )}

          {!loading && !error && (
            <div className="space-y-3">
              {chunks
                .filter(c => c.text.toLowerCase().includes(chunkQuery.toLowerCase()))
                .map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-lg bg-white/10 border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Badge className={c.bookmarked ? 'bg-green-500/20 text-green-300' : 'bg-white/10 text-white/70'}>
                        {c.bookmarked ? 'bookmarked' : 'note'}
                      </Badge>
                      <span className="text-xs text-white/50">{c.id}</span>
                    </div>
                    <p className="text-white/80 whitespace-pre-wrap text-sm">{c.text}</p>
                  </div>
              ))}

              {chunks.filter(c => c.text.toLowerCase().includes(chunkQuery.toLowerCase())).length === 0 && (
                <div className="text-white/60 text-sm">No chunks match your search.</div>
              )}

              {assets.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                    <Image className="w-4 h-4" /> Assets ({assets.length})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {assets.map(a => (
                      <div key={a.id} className="rounded-lg overflow-hidden bg-white/10 border border-white/10">
                        <div className="aspect-video bg-white/5 flex items-center justify-center">
                          {/* Simple preview: if path ends with image extension, attempt to render */}
                          {/\.(png|jpg|jpeg|gif|webp)$/i.test(a.path) ? (
                            <img src={a.path} alt={a.path} className="w-full h-full object-cover" />
                          ) : (
                            <FileText className="w-6 h-6 text-white/60" />
                          )}
                        </div>
                        <div className="p-2 text-xs text-white/70 truncate" title={a.path}>{a.path}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}