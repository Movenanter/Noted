import { useEffect, useState } from 'react';
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
import Backend from '../services/backend';

type Summary = {
  title?: string;
  key_points?: string[];
  action_items?: string[];
  participants?: string[];
  duration?: string;
  date?: string;
  category?: 'lecture' | 'meeting' | 'research' | 'study';
};

const categoryIcons: Record<NonNullable<Summary['category']>, any> = {
  lecture: BookOpen,
  meeting: Users,
  research: TrendingUp,
  study: Target,
};

const categoryColors: Record<NonNullable<Summary['category']>, string> = {
  lecture: 'bg-blue-100 text-blue-800',
  meeting: 'bg-green-100 text-green-800',
  research: 'bg-purple-100 text-purple-800',
  study: 'bg-orange-100 text-orange-800',
};

export function QuickSummary() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ensure session exists
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const existing = sessionStorage.getItem('noted.sid');
        let sid = existing;
        if (!sid) {
          const created = await Backend.createSession('Web Summary');
          sid = created.id;
          sessionStorage.setItem('noted.sid', sid);
        }
        if (!mounted) return;
        setSessionId(sid!);
      } catch (e: any) {
        setError(e.message || 'Failed to init session');
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleGenerateNew = async () => {
    if (!sessionId) return;
    try {
      setError(null);
      setIsGenerating(true);
      const resp = await Backend.generateSummary(sessionId);
      // Backend returns arbitrary JSON; map a few common fields if present
      const mapped: Summary = {
        title: resp.title || 'Session Summary',
        key_points: resp.key_points || resp.bullets || [],
        action_items: resp.action_items || resp.actions || [],
        participants: resp.participants || [],
        duration: resp.duration,
        date: resp.date,
        category: resp.category || 'lecture',
      };
      setSummary(mapped);
    } catch (e: any) {
      setError(e.message || 'Failed to generate summary');
    } finally {
      setIsGenerating(false);
    }
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
          AI-generated summary of your current session with key insights and action items
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
            <p className="text-gray-600">Generate a summary for the current session.</p>
            <Button 
              onClick={handleGenerateNew}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Generating...' : 'Generate Summary'}
            </Button>
          </div>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </CardContent>
      </Card>

      {/* Summary Output */}
      <div className="space-y-6">
        <Card className="bg-white border-white/20">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">{summary?.title || 'No summary yet'}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {summary?.date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(summary.date)}
                    </span>
                  )}
                  {summary?.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {summary.duration}
                    </span>
                  )}
                </div>
              </div>
              {summary?.category && (
                <Badge className={categoryColors[summary.category]}>
                  {summary.category}
                </Badge>
              )}
            </div>
          </CardHeader>
        </Card>

        {summary?.key_points && summary.key_points.length > 0 && (
          <Card className="bg-white border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Key Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {summary.key_points.map((point: string, index: number) => (
                  <li key={index} className="flex gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-gray-700">{point}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {summary?.action_items && summary.action_items.length > 0 && (
          <Card className="bg-white border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Action Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {summary.action_items.map((item: string, index: number) => (
                  <li key={index} className="flex gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-gray-700">{item}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}