import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { 
  Bookmark, 
  Play, 
  Search, 
  Star,
  Clock,
  Mic,
  Tag,
  Filter,
  Calendar,
  Volume2,
  Image,
  Quote,
  Camera
} from 'lucide-react';



// Enhanced interface for visual context
interface Highlight {
  id: string;
  timestamp: string;
  title: string;
  content: string;
  duration: string;
  tags: string[];
  priority: 'high' | 'medium' | 'low';
  audioFile?: string;
  session: string;
  createdBy: 'voice' | 'tap';
  visualContext?: {
    type: 'whiteboard' | 'slides' | 'document' | 'screen';
    image: string;
    description: string;
  };
  keyQuote?: string;
}

// Mock highlights data from Mentra Live glasses with visual context
const mockHighlights: Highlight[] = [
  {
    id: '1',
    timestamp: '2024-12-19 14:45:30',
    title: 'Calculus Equation Derivation - Chain Rule',
    content: 'Professor derives the chain rule step-by-step on the whiteboard, showing f\'(g(x)) × g\'(x) with complete mathematical proof.',
    duration: '3m 45s',
    tags: ['Chain Rule', 'Calculus', 'Equation Derivation'],
    priority: 'high',
    session: 'Advanced Calculus - Derivatives',
    createdBy: 'voice',
    visualContext: {
      type: 'whiteboard',
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=600&fit=crop',
      description: 'Complete chain rule derivation with step-by-step proof and example'
    },
    keyQuote: 'The chain rule is fundamental - you multiply the outer derivative by the inner derivative.'
  },
  {
    id: '2',
    timestamp: '2024-12-19 15:20:45',
    title: 'Client Budget Decision - Q2 Marketing Allocation',
    content: 'Key decision: Allocate 40% of Q2 budget to digital marketing based on ROI analysis showing 3x better performance than traditional channels.',
    duration: '2m 30s',
    tags: ['Budget Decision', 'Marketing Strategy', 'ROI Analysis'],
    priority: 'high',
    session: 'Client Strategy Meeting - Acme Corp',
    createdBy: 'tap',
    visualContext: {
      type: 'slides',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
      description: 'ROI comparison chart and Q2 budget allocation breakdown'
    },
    keyQuote: 'The data is clear - digital campaigns are delivering 3x better ROI. We need to act on this immediately.'
  },
  {
    id: '3',
    timestamp: '2024-12-19 10:30:15',
    title: 'CEO Quote on European Expansion',
    content: 'CEO announces $50M investment in European market expansion over 18 months: "This isn\'t just about revenue - it\'s about establishing our brand globally."',
    duration: '1m 45s',
    tags: ['CEO Interview', 'Market Expansion', 'Investment Strategy'],
    priority: 'high',
    session: 'Executive Interview - Market Strategy',
    createdBy: 'voice',
    visualContext: {
      type: 'document',
      image: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&h=600&fit=crop',
      description: 'European expansion timeline and investment breakdown presentation'
    },
    keyQuote: 'This $50 million investment isn\'t just about revenue - it\'s about establishing our brand as a global leader.'
  },
  {
    id: '4',
    timestamp: '2024-12-18 16:55:20',
    title: 'Lab Equipment Setup - Protein Synthesis',
    content: 'Detailed explanation of sterile technique requirements: "Precision in protein synthesis requires perfect sterile technique - one contamination ruins the entire batch."',
    duration: '2m 10s',
    tags: ['Lab Procedure', 'Sterile Technique', 'Equipment Setup'],
    priority: 'medium',
    session: 'Biochemistry Lab - Protein Synthesis',
    createdBy: 'tap',
    visualContext: {
      type: 'screen',
      image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&h=600&fit=crop',
      description: 'Lab equipment arrangement and sterile workspace setup'
    },
    keyQuote: 'Precision in protein synthesis experiments requires perfect sterile technique - one contamination ruins everything.'
  }
];

const priorityColors = {
  high: 'bg-red-100 text-red-800 border-red-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-green-100 text-green-800 border-green-200'
};

const createdByIcons = {
  voice: Mic,
  tap: Star
};

export function Highlights() {
  const [highlights] = useState<Highlight[]>(mockHighlights);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHighlight, setSelectedHighlight] = useState<Highlight | null>(highlights[0]);
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const filteredHighlights = highlights.filter(highlight => {
    const matchesSearch = highlight.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         highlight.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         highlight.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesPriority = filterPriority === 'all' || highlight.priority === filterPriority;
    
    return matchesSearch && matchesPriority;
  });

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Mark This Highlights</h1>
        <p className="text-xl text-white/80 mb-8">
          Voice or tap to bookmark key moments during recordings for quick review
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="bg-white border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search & Filter Highlights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search highlights, tags, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <select 
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Priority</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4" />
              <span>Voice marked</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              <span>Tap marked</span>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span>{filteredHighlights.length} highlights found</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Highlights List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
            <Bookmark className="w-6 h-6" />
            Your Highlights ({filteredHighlights.length})
          </h2>
          
          {filteredHighlights.map((highlight) => {
            const CreatedByIcon = createdByIcons[highlight.createdBy];
            return (
              <Card 
                key={highlight.id}
                className={`bg-white border-white/20 cursor-pointer transition-all hover:bg-gray-50 ${
                  selectedHighlight?.id === highlight.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedHighlight(highlight)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2 flex-1">{highlight.title}</CardTitle>
                    <div className="flex items-center gap-2 ml-2">
                      <CreatedByIcon className="w-4 h-4 text-gray-400" />
                      <Badge className={priorityColors[highlight.priority]}>
                        {highlight.priority}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(highlight.timestamp)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {highlight.duration}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 line-clamp-2 mb-3">
                    {highlight.content}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {highlight.tags.slice(0, 3).map((tag, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {highlight.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{highlight.tags.length - 3} more
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Highlight Detail */}
        <div>
          <h2 className="text-2xl font-semibold text-white flex items-center gap-2 mb-4">
            <Play className="w-6 h-6" />
            Highlight Details
          </h2>
          
          {selectedHighlight ? (
            <div className="space-y-4">
              <Card className="bg-white border-white/20">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">{selectedHighlight.title}</CardTitle>
                    <Badge className={priorityColors[selectedHighlight.priority]}>
                      {selectedHighlight.priority} priority
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(selectedHighlight.timestamp)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {selectedHighlight.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      {createdByIcons[selectedHighlight.createdBy] && 
                        React.createElement(createdByIcons[selectedHighlight.createdBy], { className: "w-4 h-4" })
                      }
                      {selectedHighlight.createdBy === 'voice' ? 'Voice marked' : 'Tap marked'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Session</label>
                      <p className="text-gray-700">{selectedHighlight.session}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Content</label>
                      <p className="text-gray-700 leading-relaxed">{selectedHighlight.content}</p>
                    </div>

                    {/* Key Quote */}
                    {selectedHighlight.keyQuote && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Key Quote</label>
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg">
                          <div className="flex items-start gap-2">
                            <Quote className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <p className="text-blue-800 italic">"{selectedHighlight.keyQuote}"</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Visual Context */}
                    {selectedHighlight.visualContext && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Visual Context</label>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Camera className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-medium text-gray-700">
                                  {selectedHighlight.visualContext.type.charAt(0).toUpperCase() + selectedHighlight.visualContext.type.slice(1)}
                                </span>
                              </div>
                              <p className="text-gray-600 text-sm">{selectedHighlight.visualContext.description}</p>
                            </div>
                            <div className="w-32 h-24 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                              <img 
                                src={selectedHighlight.visualContext.image} 
                                alt={selectedHighlight.visualContext.description}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Tags</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedHighlight.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Audio Playback */}
              <Card className="bg-white border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Volume2 className="w-5 h-5" />
                    Audio Playback
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Button className="flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      Play Highlight
                    </Button>
                    <span className="text-sm text-gray-600">
                      Duration: {selectedHighlight.duration}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Audio snippet from {selectedHighlight.session}
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="bg-white border-white/20">
              <CardContent className="flex items-center justify-center h-96 text-gray-500">
                <div className="text-center">
                  <Bookmark className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Select a highlight to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}