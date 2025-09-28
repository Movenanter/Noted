import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Zap, 
  Clock, 
  TrendingUp, 
  BookOpen,
  Target,
  Users,
  Calendar,
  RefreshCw
} from 'lucide-react';

interface Summary {
  id: string;
  date: string;
  title: string;
  keyPoints: string[];
  actionItems: string[];
  duration: string;
  participants?: string[];
  category: 'lecture' | 'meeting' | 'research' | 'study';
}

// Mock summaries that would be AI-generated from Mentra Live glasses notes
const mockSummaries: Summary[] = [
  {
    id: '1',
    date: '2024-12-19',
    title: 'Neural Networks & Machine Learning Lecture',
    keyPoints: [
      'Backpropagation algorithm is fundamental for training neural networks',
      'Gradient descent optimization helps minimize loss functions',
      'Vanishing gradient problem affects deep network training',
      'Regularization techniques prevent overfitting'
    ],
    actionItems: [
      'Complete perceptron implementation assignment by Friday',
      'Review gradient descent mathematical derivation',
      'Practice implementing dropout regularization'
    ],
    duration: '2h 15m',
    participants: ['Professor Johnson', 'Class (25 students)'],
    category: 'lecture'
  },
  {
    id: '2', 
    date: '2024-12-19',
    title: 'Capstone Project Team Meeting',
    keyPoints: [
      'API integration architecture finalized',
      'Team roles and responsibilities assigned',
      'Database schema needs optimization',
      'Frontend mockups approved by client'
    ],
    actionItems: [
      'Sarah: Complete frontend user authentication',
      'Mike: Set up backend API endpoints',
      'Me: Design and implement database schema',
      'All: Prepare December 30th milestone presentation'
    ],
    duration: '45m',
    participants: ['Sarah Chen', 'Mike Rodriguez', 'You'],
    category: 'meeting'
  },
  {
    id: '3',
    date: '2024-12-18',
    title: 'Quantum Computing Research Seminar',
    keyPoints: [
      'Quantum error correction is crucial for practical quantum computers',
      'Surface codes offer promising error correction approach',
      'Topological quantum computing provides inherent error protection',
      'Recent IBM and Google breakthroughs discussed'
    ],
    actionItems: [
      'Read "Quantum Error Correction with Surface Codes" paper',
      'Explore topological quantum computing literature',
      'Consider quantum computing applications for thesis research'
    ],
    duration: '1h 30m',
    participants: ['Dr. Chen', 'Research group (12 members)'],
    category: 'research'
  }
];

const categoryIcons = {
  lecture: BookOpen,
  meeting: Users,
  research: TrendingUp,
  study: Target
};

const categoryColors = {
  lecture: 'bg-blue-100 text-blue-800',
  meeting: 'bg-green-100 text-green-800', 
  research: 'bg-purple-100 text-purple-800',
  study: 'bg-orange-100 text-orange-800'
};

export function QuickSummary() {
  const [summaries] = useState<Summary[]>(mockSummaries);
  const [selectedSummary, setSelectedSummary] = useState<Summary | null>(summaries[0]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateNew = () => {
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Quick Summary</h1>
        <p className="text-xl text-white/80 max-w-3xl mx-auto">
          AI-generated summaries of your notes with key insights and action items
        </p>
      </div>

      {/* Generate New Summary */}
      <Card className="bg-white border-white/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            AI Summary Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between gap-4">
            <p className="text-gray-600 flex-1">
              Generate new summaries from your latest Mentra Live recordings
            </p>
            <Button 
              onClick={handleGenerateNew}
              disabled={isGenerating}
              className="flex items-center gap-2 shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Generating...' : 'Generate Summary'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Summary List */}
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-semibold text-white mb-6">Recent Summaries</h2>
          <div className="space-y-4">
            {summaries.map((summary) => {
              const IconComponent = categoryIcons[summary.category];
              return (
                <Card 
                  key={summary.id}
                  className={`bg-white border-white/20 cursor-pointer transition-all hover:bg-gray-50 ${
                    selectedSummary?.id === summary.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedSummary(summary)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-lg line-clamp-2 flex-1">{summary.title}</CardTitle>
                      <IconComponent className="w-5 h-5 text-gray-400 shrink-0" />
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                      <Badge className={categoryColors[summary.category]}>
                        {summary.category}
                      </Badge>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {summary.duration}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600">{formatDate(summary.date)}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Summary Details */}
        <div className="lg:col-span-2">
          {selectedSummary ? (
            <div className="space-y-6">
              {/* Summary Header */}
              <Card className="bg-white border-white/20">
                <CardHeader className="pb-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-3">{selectedSummary.title}</CardTitle>
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <span className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {formatDate(selectedSummary.date)}
                        </span>
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {selectedSummary.duration}
                        </span>
                        {selectedSummary.participants && (
                          <span className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            {selectedSummary.participants.length} participants
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge className={categoryColors[selectedSummary.category]}>
                      {selectedSummary.category}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>

              {/* Key Points */}
              <Card className="bg-white border-white/20">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Key Points
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-4">
                    {selectedSummary.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2.5 shrink-0" />
                        <p className="text-gray-700 leading-relaxed">{point}</p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Action Items */}
              <Card className="bg-white border-white/20">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Action Items
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-4">
                    {selectedSummary.actionItems.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2.5 shrink-0" />
                        <p className="text-gray-700 leading-relaxed">{item}</p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Participants */}
              {selectedSummary.participants && (
                <Card className="bg-white border-white/20">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Participants
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-3">
                      {selectedSummary.participants.map((participant, index) => (
                        <Badge key={index} variant="outline" className="text-sm px-3 py-1">
                          {participant}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-semibold text-white mb-6">Summary Details</h2>
              <Card className="bg-white border-white/20">
                <CardContent className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <Zap className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">Select a summary to view details</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}