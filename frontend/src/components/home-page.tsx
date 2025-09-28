import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  Clock, 
  Bookmark,
  Zap,
  Sparkles,
  ArrowRight,
  Search,
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
  const heroRef = useRef(null);
  const problemRef = useRef(null);
  const solutionRef = useRef(null);
  const featuresRef = useRef(null);
  const transformRef = useRef(null);
  
  const heroInView = useInView(heroRef, { once: true });
  const problemInView = useInView(problemRef, { once: true });
  const solutionInView = useInView(solutionRef, { once: true });
  const featuresInView = useInView(featuresRef, { once: true });
  const transformInView = useInView(transformRef, { once: true });

  const features = [
    {
      id: 'timeline' as ViewType,
      title: 'Timeline Search',
      description: 'Jump to any moment like YouTube chapters.',
      icon: Clock,
      color: 'from-blue-500 to-cyan-500',
      stat: '10x faster',
      detail: 'than scrolling through recordings'
    },
    {
      id: 'highlights' as ViewType,
      title: 'Voice Bookmarks',
      description: 'Say "Mark this" to save important moments.',
      icon: Bookmark,
      color: 'from-purple-500 to-pink-500',
      stat: 'Instant',
      detail: 'capture without interruption'
    },
    {
      id: 'summary' as ViewType,
      title: 'AI Summaries',
      description: 'Get key insights and action items instantly.',
      icon: Zap,
      color: 'from-green-500 to-emerald-500',
      stat: '90% less',
      detail: 'time spent reviewing'
    }
  ];

  const useCases = [
    {
      title: 'Students',
      scenario: 'Reviewing equation derivations with board snapshots',
      imageUrl: 'https://images.unsplash.com/photo-1758685733737-71f8945decf1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwc3R1ZHlpbmclMjBlcXVhdGlvbnMlMjBibGFja2JvYXJkfGVufDF8fHx8MTc1OTAyMzMyNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      gradient: 'from-blue-500/20 to-cyan-500/20'
    },
    {
      title: 'Professionals', 
      scenario: 'Revisiting client decisions with whiteboard notes',
      imageUrl: 'https://images.unsplash.com/photo-1758873268998-2f77c2d38862?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHByb2Zlc3Npb25hbCUyMG1lZXRpbmclMjB3aGl0ZWJvYXJkfGVufDF8fHx8MTc1OTAyMzMyNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      gradient: 'from-purple-500/20 to-pink-500/20'
    },
    {
      title: 'Journalists',
      scenario: 'Finding exact quotes with image references',
      imageUrl: 'https://images.unsplash.com/photo-1554446422-d05db23719d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqb3VybmFsaXN0JTIwaW50ZXJ2aWV3JTIwcmVjb3JkaW5nfGVufDF8fHx8MTc1OTAyMzMyNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      gradient: 'from-green-500/20 to-emerald-500/20'
    }
  ];

  return (
    <div className="space-y-40">
      {/* Hero - The Big Moment */}
      <motion.div 
        ref={heroRef}
        initial={{ opacity: 0 }}
        animate={heroInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1.2 }}
        className="text-center py-24"
      >
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mb-12"
        >
          <h1 className="font-bold text-[72px] leading-[86px] text-white text-center tracking-[-1.5px] mb-8">
            Turn Every Moment
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Into Insight
            </span>
          </h1>
          
          <p className="text-[28px] leading-[38px] text-white/80 max-w-4xl mx-auto font-light">
            Your <span className="text-white font-medium">Mentra Live glasses</span> now powered by AI that never forgets
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={heroInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-wrap justify-center gap-6"
        >
          <Button 
            onClick={() => onViewChange('timeline')}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-xl px-12 py-4 shadow-2xl hover:scale-105 transition-all duration-300 border-0"
          >
            Experience the Magic
            <ArrowRight className="w-6 h-6 ml-3" />
          </Button>
        </motion.div>
      </motion.div>

      {/* The Problem - What We're Solving */}
      <motion.div 
        ref={problemRef}
        initial={{ opacity: 0 }}
        animate={problemInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-16"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={problemInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2 className="text-[52px] leading-[62px] text-white/90 font-medium tracking-[-1px] mb-8">
            Brilliant moments happen fast.
            <br />
            <span className="text-white/60">Most get lost forever.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {useCases.map((useCase, index) => (
            <motion.div
              key={useCase.title}
              initial={{ opacity: 0, y: 40 }}
              animate={problemInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.8, delay: 0.4 + (index * 0.2) }}
              className="flex"
            >
              <Card className={`bg-gradient-to-br ${useCase.gradient} backdrop-blur-sm border border-white/10 p-8 hover:scale-105 transition-all duration-500 flex flex-col h-full w-full`}>
                <div className="flex flex-col h-full">
                  <div className="flex-grow flex flex-col justify-center items-center text-center">
                    <div className="w-20 h-20 rounded-xl overflow-hidden mb-6 shadow-lg">
                      <ImageWithFallback 
                        src={useCase.imageUrl}
                        alt={useCase.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-2xl font-medium text-white mb-4">{useCase.title}</h3>
                  </div>
                  <div className="mt-auto">
                    <p className="text-white/70 text-lg leading-relaxed text-center">{useCase.scenario}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* The Solution - Meet Noted */}
      <motion.div 
        ref={solutionRef}
        initial={{ opacity: 0 }}
        animate={solutionInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-20"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={solutionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="flex justify-center mb-12">
            <motion.div 
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-32 h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/30"
            >
              <Sparkles className="w-16 h-16 text-white" />
            </motion.div>
          </div>
          
          <h2 className="text-[56px] leading-[67px] text-white font-bold tracking-[-1.2px] mb-8">
            Meet <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Noted</span>
          </h2>
          <p className="text-[24px] leading-[34px] text-white/80 max-w-4xl mx-auto font-light">
            The AI that turns your Mentra Live glasses into the smartest learning tool ever created
          </p>
        </motion.div>
      </motion.div>

      {/* Features - The Magic */}
      <motion.div 
        ref={featuresRef}
        initial={{ opacity: 0 }}
        animate={featuresInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="space-y-20"
      >
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center"
        >
          <h2 className="font-bold text-[48px] leading-[58px] text-white text-center tracking-[-1px] mb-6">
            Three Superpowers
          </h2>
          <p className="text-[22px] text-white/70 max-w-3xl mx-auto">
            Each feature designed to capture brilliance effortlessly
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 60, rotateX: 20 }}
                animate={featuresInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 60, rotateX: 20 }}
                transition={{ duration: 1, delay: 0.3 + (index * 0.2) }}
                whileHover={{ y: -15, scale: 1.03 }}
                className="cursor-pointer"
                onClick={() => onViewChange(feature.id)}
              >
                <Card className="bg-white/5 backdrop-blur-sm border border-white/10 p-10 hover:bg-white/10 transition-all duration-700 group relative overflow-hidden h-full">
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  />
                  
                  <div className="text-center relative z-10">
                    <motion.div 
                      className={`w-24 h-24 bg-gradient-to-r ${feature.color} rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl`}
                      whileHover={{ scale: 1.15, rotate: 10 }}
                      transition={{ duration: 0.4, type: "spring" }}
                    >
                      <IconComponent className="w-12 h-12 text-white" />
                    </motion.div>
                    
                    <div className="mb-6">
                      <div className="text-4xl font-bold text-white mb-2">{feature.stat}</div>
                      <div className="text-white/60 text-sm uppercase tracking-wider">{feature.detail}</div>
                    </div>
                    
                    <h3 className="font-bold text-[26px] text-white mb-4">
                      {feature.title}
                    </h3>
                    
                    <p className="text-white/70 text-[18px] leading-[26px] mb-8">
                      {feature.description}
                    </p>
                    
                    <Button 
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white hover:text-slate-900 transition-all duration-300"
                    >
                      Try it now
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* The Transformation - What You Get */}
      <motion.div 
        ref={transformRef}
        initial={{ opacity: 0 }}
        animate={transformInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="relative"
      >
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={transformInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-center py-24 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-3xl border border-white/10 relative overflow-hidden"
        >
          {/* Animated Background */}
          <motion.div 
            animate={{ 
              background: [
                "radial-gradient(circle at 20% 20%, rgba(96, 165, 250, 0.15) 0%, transparent 50%)",
                "radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)",
                "radial-gradient(circle at 50% 50%, rgba(34, 211, 238, 0.15) 0%, transparent 50%)",
                "radial-gradient(circle at 20% 80%, rgba(236, 72, 153, 0.15) 0%, transparent 50%)"
              ]
            }}
            transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
            className="absolute inset-0"
          />
          
          {/* Floating Elements */}
          <motion.div
            animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-10 left-10 w-6 h-6 bg-blue-400/30 rounded-full"
          />
          <motion.div
            animate={{ y: [10, -10, 10], rotate: [0, -5, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 right-20 w-4 h-4 bg-purple-400/30 rounded-full"
          />
          <motion.div
            animate={{ y: [-5, 15, -5], rotate: [0, 10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-20 left-20 w-8 h-8 bg-cyan-400/30 rounded-full"
          />
          
          <div className="relative z-10 max-w-4xl mx-auto">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={transformInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mb-12"
            >
              <h2 className="font-bold text-[52px] leading-[62px] text-white text-center tracking-[-1.2px] mb-8">
                Never Miss Brilliance
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Ever Again
                </span>
              </h2>
              
              <p className="text-[22px] leading-[32px] text-white/80 max-w-3xl mx-auto font-light mb-12">
                Transform every lecture, meeting, and conversation into searchable knowledge that grows with you
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={transformInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap justify-center gap-6"
            >
              <Button 
                onClick={() => onViewChange('timeline')}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-xl px-12 py-4 shadow-2xl hover:scale-110 transition-all duration-300 border-0"
              >
                Start Your Journey
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
              <Button 
                onClick={() => onViewChange('summary')}
                variant="outline"
                className="bg-white/10 backdrop-blur-sm border border-white/30 text-white hover:bg-white hover:text-slate-900 text-xl px-12 py-4 hover:scale-110 transition-all duration-300"
              >
                See It In Action
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}