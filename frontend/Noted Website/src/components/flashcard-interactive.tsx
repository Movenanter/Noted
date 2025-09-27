import { useState } from 'react';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, RotateCcw, Shuffle } from 'lucide-react';

interface Flashcard {
  id: number;
  question: string;
  answer: string;
}

const sampleFlashcards: Flashcard[] = [
  { id: 1, question: "What is the capital of France?", answer: "Paris" },
  { id: 2, question: "What is 2 + 2?", answer: "4" },
  { id: 3, question: "Who wrote Romeo and Juliet?", answer: "William Shakespeare" },
  { id: 4, question: "What is the largest planet?", answer: "Jupiter" },
  { id: 5, question: "What is H2O?", answer: "Water" },
  { id: 6, question: "What year did WWII end?", answer: "1945" }
];

export function FlashcardInteractive() {
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cards, setCards] = useState(sampleFlashcards);

  const progress = ((currentCard + 1) / cards.length) * 100;

  const handleNext = () => {
    if (currentCard < cards.length - 1) {
      setCurrentCard(currentCard + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setIsFlipped(false);
    }
  };

  const handleReset = () => {
    setCurrentCard(0);
    setIsFlipped(false);
  };

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentCard(0);
    setIsFlipped(false);
  };

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-[48px]">
        <h2 className="font-semibold text-[48px] leading-[57.6px] text-white tracking-[-0.96px] mb-[16px]">
          Study Session
        </h2>
        <p className="font-normal text-[20px] leading-[30px] text-[#828282] text-center max-w-[600px] mx-auto">
          Test your knowledge with these interactive flashcards generated from your Mentra Live glasses notes. Click on a card to reveal the answer.
        </p>
      </div>

      {/* Progress */}
      <div className="max-w-[600px] mx-auto mb-[40px]">
        <div className="flex justify-between items-center mb-[8px]">
          <span className="font-medium text-[16px] text-[#828282]">Progress</span>
          <span className="font-medium text-[16px] text-[#828282]">{currentCard + 1} of {cards.length}</span>
        </div>
        <div className="bg-[rgba(3,2,19,0.2)] rounded-full h-[8px] overflow-hidden">
          <div 
            className="bg-[#030213] h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div className="max-w-[600px] mx-auto mb-[48px]">
        <div 
          className="h-[320px] rounded-[8px] cursor-pointer relative shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
          onClick={handleCardClick}
        >
          {!isFlipped ? (
            // Question Side
            <div className="absolute inset-0 bg-white border-2 border-[#e6e6e6] rounded-[8px] flex flex-col justify-center items-center p-[24px]">
              <div className="text-center">
                <div className="font-medium text-[16px] text-[#828282] mb-[16px]">Question</div>
                <div className="font-medium text-[24px] leading-[33.6px] text-black mb-[16px]">
                  {cards[currentCard].question}
                </div>
                <div className="font-normal text-[14px] text-[#828282]">Click to reveal answer</div>
              </div>
            </div>
          ) : (
            // Answer Side
            <div className="absolute inset-0 bg-[#030213] border-2 border-[#030213] rounded-[8px] flex flex-col justify-center items-center p-[24px]">
              <div className="text-center">
                <div className="font-medium text-[16px] text-white/80 mb-[16px]">Answer</div>
                <div className="font-medium text-[24px] leading-[33.6px] text-white mb-[16px]">
                  {cards[currentCard].answer}
                </div>
                <div className="font-normal text-[14px] text-white/80">Click to flip back</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center items-center gap-[16px] mb-[32px]">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentCard === 0}
          className="bg-white border-2 border-[#e6e6e6] h-[48px] w-[48px] p-[2px] rounded-[8px]"
        >
          <ChevronLeft className="h-[16px] w-[16px] text-black" />
        </Button>

        <div className="flex gap-[8px]">
          <Button
            variant="outline"
            onClick={handleReset}
            className="bg-white border-2 border-[#e6e6e6] h-[36px] px-[16px] rounded-[8px] flex items-center gap-[8px]"
          >
            <RotateCcw className="h-[16px] w-[16px] text-black" />
            <span className="font-medium text-[16px] text-black">Reset</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={handleShuffle}
            className="bg-white border-2 border-[#e6e6e6] h-[36px] px-[16px] rounded-[8px] flex items-center gap-[8px]"
          >
            <Shuffle className="h-[16px] w-[16px] text-black" />
            <span className="font-medium text-[16px] text-black">Shuffle</span>
          </Button>
        </div>

        <Button
          variant="outline"
          onClick={handleNext}
          disabled={currentCard === cards.length - 1}
          className="bg-white border-2 border-[#e6e6e6] h-[48px] w-[48px] p-[2px] rounded-[8px]"
        >
          <ChevronRight className="h-[16px] w-[16px] text-black" />
        </Button>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-[8px]">
        {cards.map((_, index) => (
          <button
            key={index}
            onClick={() => { setCurrentCard(index); setIsFlipped(false); }}
            className={`w-[12px] h-[12px] rounded-full transition-colors ${
              index === currentCard ? 'bg-[#030213]' : 'bg-[#e6e6e6]'
            }`}
          />
        ))}
      </div>
    </div>
  );
}