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
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Quick Summary</h1>
        <p className="text-xl text-white/80 mb-8">
          AI-generated summaries of your notes with key insights and action items
        </p>
      </div>

      {/* Generate New Summary */}
      <Card className="bg-white border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            AI Summary Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Generate new summaries from your latest Mentra Live recordings
            </p>
            <Button 
              onClick={handleGenerateNew}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Generating...' : 'Generate Summary'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-2xl font-semibold text-white">Recent Summaries</h2>
          
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
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2">{summary.title}</CardTitle>
                    <IconComponent className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={categoryColors[summary.category]}>
                      {summary.category}
                    </Badge>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {summary.duration}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{formatDate(summary.date)}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Summary Details */}
        <div className="lg:col-span-2">
          {selectedSummary ? (
            <div className="space-y-6">
              <Card className="bg-white border-white/20">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl mb-2">{selectedSummary.title}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(selectedSummary.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {selectedSummary.duration}
                        </span>
                        {selectedSummary.participants && (
                          <span className="flex items-center gap-1">
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
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Key Points
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {selectedSummary.keyPoints.map((point, index) => (
                      <li key={index} className="flex gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <p className="text-gray-700">{point}</p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Action Items */}
              <Card className="bg-white border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Action Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {selectedSummary.actionItems.map((item, index) => (
                      <li key={index} className="flex gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        <p className="text-gray-700">{item}</p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Participants */}
              {selectedSummary.participants && (
                <Card className="bg-white border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Participants
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedSummary.participants.map((participant, index) => (
                        <Badge key={index} variant="outline">
                          {participant}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card className="bg-white border-white/20">
              <CardContent className="flex items-center justify-center h-96 text-gray-500">
                <div className="text-center">
                  <Zap className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Select a summary to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}