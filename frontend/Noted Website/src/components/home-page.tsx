import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Clock, 
  Bookmark,
  Zap,
  Sparkles,
  ArrowRight,
  Search,
  Play,
  Tag,
  Mic,
  Star,
  Volume2
} from 'lucide-react';

type ViewType = 
  | 'timeline' 
  | 'highlights'
  | 'summary';

interface HomePageProps {
  onViewChange: (view: ViewType) => void;
}

export function HomePage({ onViewChange }: HomePageProps) {
  const features = [
    {
      id: 'timeline' as ViewType,
      title: 'Searchable Timeline',
      description: 'Navigate through recordings like YouTube chapters. Search transcripts and jump to specific moments with full audio and visual context preserved.',
      icon: Clock,
      color: 'from-blue-500 to-cyan-500',
      highlight: 'Jump to moments like YouTube chapters',
      details: [
        'Interactive timeline with visual thumbnails',
        'AI-generated transcripts and searchable tags',
        'Natural language search across all recordings',
        'Synchronized audio and visual context'
      ]
    },
    {
      id: 'highlights' as ViewType,
      title: '"Mark This" Highlights',
      description: 'Instantly bookmark important moments with voice commands or tap gestures. All highlights are organized automatically for efficient review.',
      icon: Bookmark,
      color: 'from-purple-500 to-pink-500',
      highlight: 'Instant bookmarking during capture',
      details: [
        'Voice command: "Mark this" during recording',
        'Tap gesture support on Mentra Live glasses',
        'Auto-categorized by importance and topic',
        'Dedicated review interface for quick access'
      ]
    },
    {
      id: 'summary' as ViewType,
      title: 'Auto-Summary & Digest',
      description: 'AI generates comprehensive summaries at session end. Get keyword highlights, topic breakdowns, and exportable review materials.',
      icon: Zap,
      color: 'from-green-500 to-emerald-500',
      highlight: 'AI-powered session digests',
      details: [
        'Automatic summary generation after sessions',
        'Key topic extraction and smart categorization',
        'Important concept highlighting and tagging',
        'Export review cards and study materials'
      ]
    }
  ];

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <div className="text-center py-20">
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
        </div>
        
        <h1 className="font-semibold text-[64px] leading-[76.8px] text-white text-center tracking-[-1.28px] mb-6">
          Smart Glasses,
          <br />
          Smarter Learning
        </h1>
        
        <p className="text-[24px] leading-[33.6px] text-white/70 text-center max-w-4xl mx-auto mb-12">
          Noted transforms your <span className="text-white font-medium">Mentra Live glasses</span> recordings 
          into searchable timelines, instant highlights, and AI-powered summaries for effortless learning.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Button 
            onClick={() => onViewChange('timeline')}
            className="bg-white hover:bg-gray-100 text-[#1e3a8a] text-lg px-8 py-3"
          >
            Explore Timeline
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button 
            onClick={() => onViewChange('highlights')}
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-[#1e3a8a] text-lg px-8 py-3"
            style={{ color: 'white' }}
          >
            See Highlights
          </Button>
        </div>
      </div>

      {/* Core Features */}
      <div className="space-y-12">
        <div className="text-center">
          <h2 className="font-medium text-[48px] leading-[57.6px] text-white text-center tracking-[-0.96px] mb-4">
            Three Essential Features
          </h2>
          <p className="text-[20px] text-white/70 max-w-3xl mx-auto">
            Everything you need to capture, organize, and review your learning sessions with Mentra Live glasses.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <Card 
                key={feature.id}
                className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 hover:bg-white/10 transition-all duration-300 cursor-pointer group flex flex-col h-full"
                onClick={() => onViewChange(feature.id)}
              >
                <div className="text-center mb-6">
                  <div className={`w-20 h-20 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-10 h-10 text-white" />
                  </div>
                  
                  <h3 className="font-medium text-[24px] text-white group-hover:text-white transition-colors mb-3">
                    {feature.title}
                  </h3>
                  
                  <Badge className="bg-white/10 text-white border-white/20 mb-4">
                    {feature.highlight}
                  </Badge>
                </div>
                
                <div className="flex-grow flex flex-col">
                  <p className="text-white/70 text-[16px] leading-[22.4px] mb-6 text-center">
                    {feature.description}
                  </p>
                  
                  <ul className="space-y-3 flex-grow mb-6">
                    {feature.details.map((detail, index) => (
                      <li key={index} className="flex items-start gap-3 text-white/60 text-sm">
                        <div className="w-1.5 h-1.5 bg-white/40 rounded-full mt-2 flex-shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="flex justify-center mt-auto">
                    <Button 
                      variant="outline" 
                      className="border-white/30 text-white hover:bg-white hover:text-[#1e3a8a] group-hover:border-white transition-all"
                      style={{ color: 'white' }}
                    >
                      Try {feature.title}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Feature Demo */}
      <div className="space-y-12">
        <div className="text-center">
          <h2 className="font-medium text-[48px] leading-[57.6px] text-white text-center tracking-[-0.96px] mb-4">
            How It Works
          </h2>
          <p className="text-[20px] text-white/70 max-w-3xl mx-auto">
            Simple, intuitive workflow from recording to review.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10 p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Volume2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-medium text-white mb-3">1. Record</h3>
              <p className="text-white/70">
                Capture conversations, lectures, and meetings naturally with your Mentra Live glasses.
              </p>
            </div>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border border-white/10 p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-medium text-white mb-3">2. Mark</h3>
              <p className="text-white/70">
                Say "Mark this" or tap to instantly bookmark important moments during recording.
              </p>
            </div>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border border-white/10 p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-medium text-white mb-3">3. Review</h3>
              <p className="text-white/70">
                Search timelines, review highlights, and get AI summaries for efficient learning.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center py-16 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl border border-white/10">
        <h2 className="font-medium text-[40px] leading-[48px] text-white text-center tracking-[-0.8px] mb-4">
          Ready to Transform Your Learning?
        </h2>
        <p className="text-[18px] text-white/70 mb-8 max-w-2xl mx-auto">
          Experience effortless note-taking and review with AI-powered insights from your Mentra Live glasses.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button 
            onClick={() => onViewChange('timeline')}
            className="bg-white hover:bg-gray-100 text-[#1e3a8a] text-lg px-8 py-3"
          >
            Start Exploring
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button 
            onClick={() => onViewChange('summary')}
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-[#1e3a8a] text-lg px-8 py-3"
            style={{ color: 'white' }}
          >
            View Summaries
          </Button>
        </div>
      </div>
    </div>
  );
}