import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Bookmark, Play, Search, Mic, Star, Volume2 } from 'lucide-react';
import Backend from '../services/backend';

export function Highlights() {
  const [highlights, setHighlights] = useState<{ id: string; text: string; bookmarked: boolean }[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHighlight, setSelectedHighlight] = useState<{ id: string; text: string; bookmarked: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const existing = sessionStorage.getItem('noted.sid');
        let sid = existing;
        if (!sid) {
          const created = await Backend.createSession('Web Highlights');
          sid = created.id;
          sessionStorage.setItem('noted.sid', sid);
        }
        if (!mounted) return;
        setSessionId(sid!);
        const tl = await Backend.getTimeline(sid!, { bookmarked: true });
        if (!mounted) return;
        setHighlights(tl.chunks);
        setSelectedHighlight(tl.chunks[0] || null);
      } catch (e: any) {
        setError(e.message || 'Failed to load highlights');
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredHighlights = highlights.filter((h) => h.text.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Mark This Highlights</h1>
        <p className="text-xl text-white/80 mb-8">Showing bookmarked transcript chunks from your current session</p>
      </div>

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
                placeholder="Search bookmarked text..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4" />
              <span>Bookmarked chunks</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              <span>Session ID: {sessionId || 'n/a'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>{filteredHighlights.length} highlights found</span>
            </div>
          </div>
          {loading && <p className="text-sm text-gray-600 mt-2">Loading…</p>}
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
            <Bookmark className="w-6 h-6" />
            Your Highlights ({filteredHighlights.length})
          </h2>

          {filteredHighlights.map((highlight) => (
            <Card
              key={highlight.id}
              className={`bg-white border-white/20 cursor-pointer transition-all hover:bg-gray-50 ${
                selectedHighlight?.id === highlight.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedHighlight(highlight)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2 flex-1">Bookmarked Note</CardTitle>
                  <div className="flex items-center gap-2 ml-2">
                    <Badge className="bg-green-100 text-green-800 border-green-200">bookmarked</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 mb-3 whitespace-pre-wrap">{highlight.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>

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
                    <CardTitle className="text-xl">Bookmarked Note</CardTitle>
                    <Badge className="bg-green-100 text-green-800 border-green-200">bookmarked</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Content</label>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedHighlight.text}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Volume2 className="w-5 h-5" />
                    Audio Playback
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Playback not available for text-only chunks.</p>
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