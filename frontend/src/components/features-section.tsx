import { Glasses, Brain, TrendingUp } from 'lucide-react';

export function FeaturesSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-[40px] mb-[80px]">
      {/* Smart Analysis */}
      <div className="flex flex-col">
        <div className="h-[200px] relative rounded-[8px] overflow-hidden mb-[24px]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#030213] to-[#454545] rounded-[8px]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Glasses className="h-[48px] w-[48px] text-white" />
          </div>
        </div>
        <h3 className="font-medium text-[24px] leading-[36px] text-white mb-[4px]">
          Smart Analysis
        </h3>
        <p className="font-normal text-[20px] leading-[30px] text-[#828282]">
          AI analyzes your Mentra Live glasses notes to extract key concepts automatically
        </p>
      </div>

      {/* Interactive Learning */}
      <div className="flex flex-col">
        <div className="h-[200px] relative rounded-[8px] overflow-hidden mb-[24px]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#030213] to-[#454545] rounded-[8px]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain className="h-[48px] w-[48px] text-white" />
          </div>
        </div>
        <h3 className="font-medium text-[24px] leading-[36px] text-white mb-[4px]">
          Interactive Learning
        </h3>
        <p className="font-normal text-[20px] leading-[30px] text-[#828282]">
          Flip cards to test your knowledge and track progress dynamically
        </p>
      </div>

      {/* Progress Tracking */}
      <div className="flex flex-col">
        <div className="h-[200px] relative rounded-[8px] overflow-hidden mb-[24px]">
          <div className="absolute inset-0 bg-gradient-to-b from-[#030213] to-[#454545] rounded-[8px] flex flex-col items-center justify-center px-[24px] py-[24px]">
            <div className="text-center">
              <div className="font-bold text-[48px] leading-[72px] text-white text-center tracking-[0.3516px] mb-[8px]">
                1
              </div>
              <div className="font-normal text-[20px] leading-[30px] text-white text-center tracking-[-0.4492px] mb-[8px]">
                of 6
              </div>
              <div className="font-normal text-[16px] leading-[24px] text-white/80 text-center tracking-[-0.3125px]">
                Current Card
              </div>
            </div>
          </div>
        </div>
        <h3 className="font-medium text-[24px] leading-[36px] text-white mb-[4px]">
          Track Progress
        </h3>
        <p className="font-normal text-[20px] leading-[30px] text-[#828282]">
          Monitor your study session advancement in real-time
        </p>
      </div>
    </div>
  );
}