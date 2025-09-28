import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Brain, Network, Zap, Eye, Download, Share2, Plus, Minus, Loader2 } from 'lucide-react';
import { useConceptMapGeneration, useMentraLiveNotes } from '../hooks/use-ai-generation';
import { ConceptMapData } from '../types/ai-integration';

interface ConceptNode {
  id: string;
  title: string;
  description: string;
  connections: string[];
  x: number;
  y: number;
  color: string;
}

const sampleConceptMap: ConceptNode[] = [
  {
    id: "1",
    title: "Photosynthesis",
    description: "Process by which plants convert light energy into chemical energy",
    connections: ["2", "3", "4"],
    x: 400,
    y: 200,
    color: "bg-green-500"
  },
  {
    id: "2",
    title: "Chlorophyll",
    description: "Green pigment that captures light energy",
    connections: ["1", "5"],
    x: 200,
    y: 150,
    color: "bg-emerald-500"
  },
  {
    id: "3",
    title: "Carbon Dioxide",
    description: "Gas absorbed from atmosphere during photosynthesis",
    connections: ["1", "6"],
    x: 600,
    y: 150,
    color: "bg-blue-500"
  },
  {
    id: "4",
    title: "Glucose",
    description: "Sugar molecule produced as energy storage",
    connections: ["1", "7"],
    x: 400,
    y: 350,
    color: "bg-yellow-500"
  },
  {
    id: "5",
    title: "Light Reactions",
    description: "First stage of photosynthesis in thylakoids",
    connections: ["2"],
    x: 100,
    y: 100,
    color: "bg-purple-500"
  },
  {
    id: "6",
    title: "Calvin Cycle",
    description: "Second stage using CO2 to produce glucose",
    connections: ["3", "4"],
    x: 700,
    y: 250,
    color: "bg-orange-500"
  },
  {
    id: "7",
    title: "Cellular Respiration",
    description: "Process that breaks down glucose for energy",
    connections: ["4"],
    x: 400,
    y: 500,
    color: "bg-red-500"
  }
];

const studySets = [
  {
    id: 1,
    title: "Biology: Photosynthesis",
    description: "Explore the process of photosynthesis and its key components",
    nodeCount: 7,
    connectionCount: 12,
    difficulty: "Medium",
    lastUpdated: "2 hours ago"
  },
  {
    id: 2,
    title: "Physics: Electromagnetic Waves",
    description: "Understand the relationships between frequency, wavelength, and energy",
    nodeCount: 9,
    connectionCount: 15,
    difficulty: "Hard",
    lastUpdated: "1 day ago"
  },
  {
    id: 3,
    title: "History: World War II Timeline",
    description: "Key events, causes, and consequences of WWII",
    nodeCount: 12,
    connectionCount: 18,
    difficulty: "Easy",
    lastUpdated: "3 days ago"
  }
];

export function ConceptMaps() {
  const [selectedMap, setSelectedMap] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  
  // AI Integration Hooks
  const { 
    isGenerating: isGeneratingMap, 
    error: mapError, 
    progress: mapProgress,
    conceptMap,
    generateConceptMap,
    clearConceptMap
  } = useConceptMapGeneration();
  
  const { 
    notes: mentraLiveNotes,
    processRawNotes,
    isGenerating: isProcessingNotes
  } = useMentraLiveNotes();

  /**
   * ====================================================================================
   * AI INTEGRATION FUNCTIONS - MENTRA LIVE GLASSES
   * ====================================================================================
   * These functions handle the integration with Mentra Live glasses for concept map generation
   */
  
  const handleGenerateFromGlasses = async () => {
    try {
      // TODO: Replace with actual Mentra Live glasses data retrieval
      const mockGlassesData = [
        {
          transcript: "Photosynthesis is the process by which plants convert light energy into chemical energy...",
          timestamp: new Date().toISOString(),
          detectedSubject: "Biology",
          extractedKeywords: ["photosynthesis", "light energy", "chemical energy", "plants"]
        }
      ];
      
      // Process raw glasses data into structured notes
      const processedNotes = await processRawNotes(mockGlassesData);
      
      // Generate concept map from processed notes
      const newConceptMap = await generateConceptMap(processedNotes, {
        difficulty: 'medium',
        focusTopics: ['photosynthesis', 'biology']
      });
      
      console.log('Generated concept map from Mentra Live glasses:', newConceptMap);
    } catch (error) {
      console.error('Failed to generate concept map from glasses data:', error);
    }
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.2, 2));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.2, 0.5));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <Network className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="font-semibold text-[48px] leading-[57.6px] text-white text-center tracking-[-0.96px] mb-[16px]">
          AI-Generated Concept Maps
        </h1>
        <p className="font-normal text-[20px] leading-[30px] text-white/70 text-center max-w-[700px] mx-auto">
          Visualize complex relationships between concepts from your Mentra Live glasses notes. 
          AI automatically builds interactive mind maps to enhance understanding and retention.
        </p>
      </div>

      {selectedMap === null ? (
        /* Study Sets Selection */
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="font-medium text-[32px] text-white">Your Concept Maps</h2>
            <div className="flex gap-2">
              <Button 
                className="bg-white hover:bg-gray-100 text-[#1e3a8a] font-medium"
                onClick={handleGenerateFromGlasses}
                disabled={isGeneratingMap || isProcessingNotes}
              >
                {isGeneratingMap || isProcessingNotes ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Generate from Mentra Live
              </Button>
            </div>
          </div>

          {/* AI Generation Progress */}
          {(isGeneratingMap || isProcessingNotes) && (
            <div className="mb-6">
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  {isProcessingNotes ? 'Processing notes from Mentra Live glasses...' : 'Generating concept map with AI...'}
                </AlertDescription>
              </Alert>
              <Progress value={mapProgress} className="mt-2" />
            </div>
          )}

          {/* AI Generation Error */}
          {mapError && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{mapError}</AlertDescription>
            </Alert>
          )}

          {/* Display AI-generated concept map */}
          {conceptMap && (
            <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
              <h3 className="text-lg font-medium text-white mb-2">AI-Generated Concept Map</h3>
              <p className="text-white/70 text-sm mb-4">
                Generated from {conceptMap.metadata.sourceNotes.length} Mentra Live notes
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => setSelectedMap(999)} // Use special ID for AI-generated map
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  View AI Map
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearConceptMap}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Clear
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studySets.map((set) => (
              <Card 
                key={set.id}
                className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
                onClick={() => setSelectedMap(set.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <Badge 
                    className={`${
                      set.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                      set.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {set.difficulty}
                  </Badge>
                </div>

                <h3 className="font-medium text-[20px] text-white mb-2">
                  {set.title}
                </h3>
                
                <p className="font-normal text-[14px] text-white/70 mb-4 line-clamp-2">
                  {set.description}
                </p>

                <div className="flex justify-between items-center text-sm text-white/60 mb-4">
                  <div className="flex items-center gap-4">
                    <span>{set.nodeCount} concepts</span>
                    <span>{set.connectionCount} connections</span>
                  </div>
                </div>

                <div className="text-xs text-white/50">
                  Updated {set.lastUpdated}
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        /* Interactive Concept Map Viewer */
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-medium text-[32px] text-white mb-2">
                {studySets.find(s => s.id === selectedMap)?.title}
              </h2>
              <p className="text-white/70">
                {studySets.find(s => s.id === selectedMap)?.description}
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={handleZoomOut}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline"
                onClick={handleZoomIn}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button 
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button 
                onClick={() => setSelectedMap(null)}
                className="bg-white hover:bg-gray-100 text-[#1e3a8a]"
              >
                Back to Maps
              </Button>
            </div>
          </div>

          {/* Concept Map Visualization */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-[16px] p-8 min-h-[600px] relative overflow-hidden">
            <div 
              className="relative w-[800px] h-[600px] mx-auto"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              {/* Connections */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {sampleConceptMap.map(node => 
                  node.connections.map(connectionId => {
                    const connectedNode = sampleConceptMap.find(n => n.id === connectionId);
                    if (!connectedNode) return null;
                    
                    return (
                      <line
                        key={`${node.id}-${connectionId}`}
                        x1={node.x}
                        y1={node.y}
                        x2={connectedNode.x}
                        y2={connectedNode.y}
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth="2"
                        className="transition-all duration-300"
                      />
                    );
                  })
                )}
              </svg>

              {/* Concept Nodes */}
              {sampleConceptMap.map(node => (
                <div
                  key={node.id}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${
                    selectedNode === node.id ? 'scale-110 z-10' : 'hover:scale-105'
                  }`}
                  style={{ left: node.x, top: node.y }}
                  onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                >
                  <div className={`${node.color} rounded-full w-20 h-20 flex items-center justify-center shadow-lg border-4 border-white/20`}>
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  
                  <div className="mt-2 text-center">
                    <div className="font-medium text-white text-sm mb-1 max-w-[120px]">
                      {node.title}
                    </div>
                    
                    {selectedNode === node.id && (
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 w-64 bg-black/90 backdrop-blur-sm rounded-lg p-4 shadow-xl border border-white/20 z-20">
                        <h4 className="font-medium text-white mb-2">{node.title}</h4>
                        <p className="text-sm text-white/80">{node.description}</p>
                        <div className="mt-3 pt-3 border-t border-white/20">
                          <div className="text-xs text-white/60">
                            Connected to {node.connections.length} concepts
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">7</div>
              <div className="text-sm text-white/70">Concepts</div>
            </Card>
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">12</div>
              <div className="text-sm text-white/70">Connections</div>
            </Card>
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">3</div>
              <div className="text-sm text-white/70">Depth Levels</div>
            </Card>
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">85%</div>
              <div className="text-sm text-white/70">Completeness</div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}