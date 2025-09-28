import { Button } from './ui/button';
import { Glasses, Brain, Zap } from 'lucide-react';

interface HeroSectionProps {
  onStartQuiz: () => void;
  onStartFlashcards: () => void;
  showQuizButton: boolean;
}

export function HeroSection({ onStartQuiz, onStartFlashcards, showQuizButton }: HeroSectionProps) {
  return (
    <div className="h-[400px] relative rounded-[8px] overflow-hidden mb-[80px]">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#030213] via-[#1a1a2e] to-[#16213e] rounded-[8px]" />
      
      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-center items-center px-[24px]">
        <div className="text-center max-w-[600px]">
          <h1 className="font-semibold text-[48px] leading-[57.6px] text-white text-center tracking-[-0.96px] mb-[16px]">
            Master Your Studies with AI-Powered Quizzes
          </h1>
          <p className="font-normal text-[20px] leading-[30px] text-white/90 text-center mb-[32px]">
            Transform your Mentra Live glasses notes into interactive study sessions with intelligent quiz generation
          </p>
          
          {showQuizButton && (
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={onStartQuiz}
                className="bg-white hover:bg-gray-100 text-[#1e3a8a] font-medium text-[18px] px-[32px] py-[16px] h-auto rounded-[8px]"
              >
                Start Practice Quiz
              </Button>
              <Button 
                onClick={onStartFlashcards}
                variant="outline"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-slate-900 font-medium text-[18px] px-[32px] py-[16px] h-auto rounded-[8px]"
              >
                Study Flashcards
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}