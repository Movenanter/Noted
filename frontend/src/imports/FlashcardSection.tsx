import svgPaths from "./svg-na90tjux75";
import imgImageWithFallback from "figma:asset/8c5d33af00ba7b4772c2e1b9b49fa791ef32fe29.png";
import imgImageWithFallback1 from "figma:asset/3d234e2ec59df58ca77976db261aa74ace2450f0.png";
import imgImageWithFallback2 from "figma:asset/82448058d4515c94b49e273a8b75c2b5fd856ca4.png";

function Container() {
  return <div className="absolute bg-[#f7f7f7] h-[400px] left-0 rounded-[8px] top-0 w-[1135px]" data-name="Container" />;
}

function ImageWithFallback() {
  return (
    <div className="absolute h-[400px] left-0 opacity-80 rounded-[8px] top-0 w-[1135px]" data-name="ImageWithFallback">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[8px] size-full" src={imgImageWithFallback} />
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute h-[400px] left-0 rounded-[8px] top-0 w-[1135px]" data-name="Container">
      <Container />
      <ImageWithFallback />
    </div>
  );
}

function Container2() {
  return <div className="absolute bg-[rgba(0,0,0,0.2)] h-[400px] left-0 rounded-[8px] top-0 w-[1135px]" data-name="Container" />;
}

function Heading1() {
  return (
    <div className="h-[115.188px] relative shrink-0 w-full" data-name="Heading 1">
      <p className="absolute font-['Inter:Semi_Bold',_sans-serif] font-semibold leading-[57.6px] left-[276.49px] not-italic text-[48px] text-center text-white top-[-0.5px] tracking-[-0.96px] translate-x-[-50%] w-[452px]">Master Your Studies with Flashcards</p>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[60px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[30px] left-[276.1px] not-italic text-[20px] text-[rgba(255,255,255,0.9)] text-center top-[-0.5px] translate-x-[-50%] w-[503px]">Interactive study sessions that adapt to your learning pace</p>
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute box-border content-stretch flex flex-col gap-[16px] h-[191.188px] items-start left-[267.5px] px-[24px] py-0 top-[104.41px] w-[600px]" data-name="Container">
      <Heading1 />
      <Paragraph />
    </div>
  );
}

function Container4() {
  return (
    <div className="h-[400px] overflow-clip relative rounded-[8px] shrink-0 w-full" data-name="Container">
      <Container1 />
      <Container2 />
      <Container3 />
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="h-[36px] relative shrink-0 w-[298.328px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[36px] relative w-[298.328px]">
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[36px] left-0 not-italic text-[24px] text-black text-nowrap top-[-1px] whitespace-pre">Interactive Learning</p>
      </div>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[298.328px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-full relative w-[298.328px]">
        <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[30px] left-0 not-italic text-[#828282] text-[20px] top-[-0.5px] w-[287px]">Flip cards to test your knowledge and track progress</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[4px] h-[100px] items-start left-0 top-[224px] w-[298.328px]" data-name="Container">
      <Paragraph1 />
      <Paragraph2 />
    </div>
  );
}

function Container6() {
  return <div className="absolute bg-[#f7f7f7] h-[200px] left-0 rounded-[8px] top-0 w-[298.328px]" data-name="Container" />;
}

function ImageWithFallback1() {
  return (
    <div className="absolute h-[200px] left-0 rounded-[8px] top-0 w-[298.328px]" data-name="ImageWithFallback">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[8px] size-full" src={imgImageWithFallback1} />
    </div>
  );
}

function Container7() {
  return (
    <div className="h-[200px] relative rounded-[8px] shrink-0 w-full" data-name="Container">
      <Container6 />
      <ImageWithFallback1 />
    </div>
  );
}

function Container8() {
  return (
    <div className="absolute content-stretch flex flex-col h-[200px] items-start left-0 rounded-[8px] top-0 w-[298.328px]" data-name="Container">
      <Container7 />
    </div>
  );
}

function Container9() {
  return (
    <div className="absolute h-[324px] left-0 top-0 w-[298.328px]" data-name="Container">
      <Container5 />
      <Container8 />
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="h-[36px] relative shrink-0 w-[298.336px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[36px] relative w-[298.336px]">
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[36px] left-0 not-italic text-[24px] text-black text-nowrap top-[-1px] whitespace-pre">Organized Study</p>
      </div>
    </div>
  );
}

function Paragraph4() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[298.336px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-full relative w-[298.336px]">
        <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[30px] left-0 not-italic text-[#828282] text-[20px] top-[-0.5px] w-[281px]">Structured flashcard sessions for effective learning</p>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[4px] h-[100px] items-start left-0 top-[224px] w-[298.336px]" data-name="Container">
      <Paragraph3 />
      <Paragraph4 />
    </div>
  );
}

function Container11() {
  return <div className="absolute bg-[#f7f7f7] h-[200px] left-0 rounded-[8px] top-0 w-[298.336px]" data-name="Container" />;
}

function ImageWithFallback2() {
  return (
    <div className="absolute h-[200px] left-0 rounded-[8px] top-0 w-[298.336px]" data-name="ImageWithFallback">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[8px] size-full" src={imgImageWithFallback2} />
    </div>
  );
}

function Container12() {
  return (
    <div className="h-[200px] relative rounded-[8px] shrink-0 w-full" data-name="Container">
      <Container11 />
      <ImageWithFallback2 />
    </div>
  );
}

function Container13() {
  return (
    <div className="absolute content-stretch flex flex-col h-[200px] items-start left-0 rounded-[8px] top-0 w-[298.336px]" data-name="Container">
      <Container12 />
    </div>
  );
}

function Container14() {
  return (
    <div className="absolute h-[324px] left-[338.33px] top-0 w-[298.336px]" data-name="Container">
      <Container10 />
      <Container13 />
    </div>
  );
}

function Paragraph5() {
  return (
    <div className="h-[36px] relative shrink-0 w-[298.336px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[36px] relative w-[298.336px]">
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[36px] left-0 not-italic text-[24px] text-black text-nowrap top-[-1px] whitespace-pre">Track Progress</p>
      </div>
    </div>
  );
}

function Paragraph6() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[298.336px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-full relative w-[298.336px]">
        <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[30px] left-0 not-italic text-[#828282] text-[20px] top-[-0.5px] w-[256px]">Monitor your study session advancement</p>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[4px] h-[100px] items-start left-0 top-[224px] w-[298.336px]" data-name="Container">
      <Paragraph5 />
      <Paragraph6 />
    </div>
  );
}

function Container16() {
  return (
    <div className="h-[72px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Bold',_sans-serif] font-bold leading-[72px] left-[47.26px] not-italic text-[48px] text-center text-nowrap text-white top-[0.5px] tracking-[0.3516px] translate-x-[-50%] whitespace-pre">1</p>
    </div>
  );
}

function Container17() {
  return (
    <div className="h-[30px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[30px] left-[47.14px] not-italic text-[20px] text-center text-white top-0 tracking-[-0.4492px] translate-x-[-50%] w-[35px]">of 6</p>
    </div>
  );
}

function Container18() {
  return (
    <div className="h-[24px] opacity-80 relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[24px] left-[47.5px] not-italic text-[16px] text-center text-nowrap text-white top-[-0.5px] tracking-[-0.3125px] translate-x-[-50%] whitespace-pre">Current Card</p>
    </div>
  );
}

function Container19() {
  return (
    <div className="h-[190px] relative shrink-0 w-[141.906px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[8px] h-[190px] items-start pb-0 pt-[24px] px-[24px] relative w-[141.906px]">
        <Container16 />
        <Container17 />
        <Container18 />
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="absolute bg-gradient-to-b box-border content-stretch flex from-[#030213] h-[200px] items-center justify-center left-0 pl-0 pr-[0.008px] py-0 rounded-[8px] to-[#454545] top-0 w-[298.336px]" data-name="Container">
      <Container19 />
    </div>
  );
}

function Container21() {
  return (
    <div className="absolute h-[324px] left-[676.66px] top-0 w-[298.336px]" data-name="Container">
      <Container15 />
      <Container20 />
    </div>
  );
}

function Container22() {
  return (
    <div className="h-[324px] relative shrink-0 w-full" data-name="Container">
      <Container9 />
      <Container14 />
      <Container21 />
    </div>
  );
}

function Heading2() {
  return (
    <div className="absolute h-[57.594px] left-0 top-0 w-[975px]" data-name="Heading 2">
      <p className="absolute font-['Inter:Semi_Bold',_sans-serif] font-semibold leading-[57.6px] left-[488.4px] not-italic text-[48px] text-black text-center text-nowrap top-[-0.5px] tracking-[-0.96px] translate-x-[-50%] whitespace-pre">Study Session</p>
    </div>
  );
}

function Paragraph7() {
  return (
    <div className="absolute h-[60px] left-[187.5px] top-[73.59px] w-[600px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[30px] left-[300.26px] not-italic text-[#828282] text-[20px] text-center top-[-0.5px] translate-x-[-50%] w-[597px]">Test your knowledge with these interactive flashcards. Click on a card to reveal the answer.</p>
    </div>
  );
}

function Container23() {
  return (
    <div className="absolute h-[133.594px] left-0 top-0 w-[975px]" data-name="Container">
      <Heading2 />
      <Paragraph7 />
    </div>
  );
}

function Text() {
  return (
    <div className="h-[24px] relative shrink-0 w-[67.953px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[67.953px]">
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[24px] left-0 not-italic text-[#828282] text-[16px] text-nowrap top-[-1px] whitespace-pre">Progress</p>
      </div>
    </div>
  );
}

function Text1() {
  return (
    <div className="h-[24px] relative shrink-0 w-[41.766px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[41.766px]">
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[24px] left-0 not-italic text-[#828282] text-[16px] top-[-1px] w-[42px]">1 of 6</p>
      </div>
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Text />
      <Text1 />
    </div>
  );
}

function Container25() {
  return <div className="bg-[#030213] h-[8px] shrink-0 w-full" data-name="Container" />;
}

function PrimitiveDiv() {
  return (
    <div className="bg-[rgba(3,2,19,0.2)] box-border content-stretch flex flex-col h-[8px] items-start overflow-clip pr-[500px] py-0 relative rounded-[1.67772e+07px] shrink-0 w-full" data-name="Primitive.div">
      <Container25 />
    </div>
  );
}

function Container26() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[8px] h-[40px] items-start left-[187.5px] top-[181.59px] w-[600px]" data-name="Container">
      <Container24 />
      <PrimitiveDiv />
    </div>
  );
}

function Container27() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[24px] left-[170.12px] not-italic text-[#828282] text-[16px] text-center text-nowrap top-[-1px] translate-x-[-50%] whitespace-pre">Question</p>
    </div>
  );
}

function Paragraph8() {
  return (
    <div className="h-[33.594px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[33.6px] left-[170.5px] not-italic text-[24px] text-black text-center text-nowrap top-[-1px] translate-x-[-50%] whitespace-pre">What is the capital of France?</p>
    </div>
  );
}

function Container28() {
  return (
    <div className="h-[21px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[21px] left-[170.53px] not-italic text-[#828282] text-[14px] text-center text-nowrap top-0 translate-x-[-50%] whitespace-pre">Click to reveal answer</p>
    </div>
  );
}

function Container29() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] h-[118.594px] items-start relative shrink-0 w-full" data-name="Container">
      <Container27 />
      <Paragraph8 />
      <Container28 />
    </div>
  );
}

function Container30() {
  return (
    <div className="absolute bg-white box-border content-stretch flex flex-col h-[320px] items-start left-0 pb-[2px] pt-[100.703px] px-[129.922px] rounded-[8px] top-0 w-[600px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-2 border-[#e6e6e6] border-solid inset-0 pointer-events-none rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <Container29 />
    </div>
  );
}

function Container31() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[24px] left-[54.93px] not-italic text-[16px] text-[rgba(255,255,255,0.8)] text-center text-nowrap top-[-1px] translate-x-[-50%] whitespace-pre">Answer</p>
    </div>
  );
}

function Paragraph9() {
  return (
    <div className="h-[33.594px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[33.6px] left-[54.87px] not-italic text-[24px] text-center text-nowrap text-white top-[-1px] translate-x-[-50%] whitespace-pre">Paris</p>
    </div>
  );
}

function Container32() {
  return (
    <div className="h-[21px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[21px] left-[55px] not-italic text-[14px] text-[rgba(255,255,255,0.8)] text-center text-nowrap top-0 translate-x-[-50%] whitespace-pre">Click to flip back</p>
    </div>
  );
}

function Container33() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] h-[118.594px] items-start relative shrink-0 w-full" data-name="Container">
      <Container31 />
      <Paragraph9 />
      <Container32 />
    </div>
  );
}

function Container34() {
  return (
    <div className="absolute bg-[#030213] box-border content-stretch flex flex-col h-[320px] items-start left-0 pb-[2px] pl-[245.164px] pr-[245.156px] pt-[100.703px] rounded-[8px] top-0 w-[600px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-2 border-[#030213] border-solid inset-0 pointer-events-none rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <Container33 />
    </div>
  );
}

function Flashcard() {
  return (
    <div className="absolute h-[320px] left-[187.5px] top-[269.59px] w-[600px]" data-name="Flashcard">
      <Container30 />
      <Container34 />
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M10 12L6 8L10 4" id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-white relative rounded-[8px] shrink-0 size-[48px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-2 border-[#e6e6e6] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-center justify-center p-[2px] relative size-[48px]">
        <Icon />
      </div>
    </div>
  );
}

function Icon4() {
  return (
    <div className="absolute left-[14px] size-[16px] top-[10px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p12949080} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d="M2 2V5.33333H5.33333" id="Vector_2" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-white h-[36px] relative rounded-[8px] shrink-0 w-[103.539px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-2 border-[#e6e6e6] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[36px] relative w-[103.539px]">
        <Icon4 />
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[24px] left-[46px] not-italic text-[16px] text-neutral-950 text-nowrap top-[5px] whitespace-pre">Reset</p>
      </div>
    </div>
  );
}

function Icon5() {
  return (
    <div className="absolute left-[14px] size-[16px] top-[10px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_1_361)" id="Icon">
          <path d={svgPaths.p1752de80} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p75099c0} id="Vector_2" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p32631f00} id="Vector_3" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p2cb7000} id="Vector_4" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p3f75c9c0} id="Vector_5" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
        <defs>
          <clipPath id="clip0_1_361">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button3() {
  return (
    <div className="basis-0 bg-white grow h-[36px] min-h-px min-w-px relative rounded-[8px] shrink-0" data-name="Button">
      <div aria-hidden="true" className="absolute border-2 border-[#e6e6e6] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[36px] relative w-full">
        <Icon5 />
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[24px] left-[46px] not-italic text-[16px] text-neutral-950 text-nowrap top-[5px] whitespace-pre">Shuffle</p>
      </div>
    </div>
  );
}

function Container35() {
  return (
    <div className="h-[36px] relative shrink-0 w-[226.172px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[8px] h-[36px] items-center relative w-[226.172px]">
        <Button1 />
        <Button3 />
      </div>
    </div>
  );
}

function Icon6() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d="M6 12L10 8L6 4" id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Button4() {
  return (
    <div className="bg-white relative rounded-[8px] shrink-0 size-[48px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-2 border-[#e6e6e6] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-center justify-center p-[2px] relative size-[48px]">
        <Icon6 />
      </div>
    </div>
  );
}

function Container36() {
  return (
    <div className="absolute content-stretch flex gap-[16px] h-[48px] items-center justify-center left-0 top-[637.59px] w-[975px]" data-name="Container">
      <Button />
      <Container35 />
      <Button4 />
    </div>
  );
}

function Button5() {
  return (
    <div className="bg-[#030213] relative rounded-[1.67772e+07px] shrink-0 size-[12px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border size-[12px]" />
    </div>
  );
}

function Button6() {
  return (
    <div className="bg-[#e6e6e6] relative rounded-[1.67772e+07px] shrink-0 size-[12px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border size-[12px]" />
    </div>
  );
}

function Container37() {
  return (
    <div className="absolute content-stretch flex gap-[8px] h-[12px] items-start justify-center left-0 top-[717.59px] w-[975px]" data-name="Container">
      <Button5 />
      {[...Array(5).keys()].map((_, i) => (
        <Button6 key={i} />
      ))}
    </div>
  );
}

function Container38() {
  return (
    <div className="h-[729.594px] relative shrink-0 w-full" data-name="Container">
      <Container23 />
      <Container26 />
      <Flashcard />
      <Container36 />
      <Container37 />
    </div>
  );
}

function Container39() {
  return (
    <div className="h-[1133.59px] relative shrink-0 w-full" data-name="Container">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-[80px] h-[1133.59px] items-start px-[80px] py-0 relative w-full">
          <Container22 />
          <Container38 />
        </div>
      </div>
    </div>
  );
}

function FlashcardSection() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col gap-[80px] h-[1613.59px] items-start left-0 top-0 w-[1135px]" data-name="FlashcardSection">
      <Container4 />
      <Container39 />
    </div>
  );
}

function Paragraph10() {
  return (
    <div className="h-[24px] relative shrink-0 w-[187px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[187px]">
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[24px] left-0 not-italic text-[16px] text-black text-nowrap top-[-1px] whitespace-pre">Features</p>
      </div>
    </div>
  );
}

function Paragraph11() {
  return (
    <div className="h-[24px] relative shrink-0 w-[187px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[187px]">
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[24px] left-0 not-italic text-[#454545] text-[16px] text-nowrap top-[-1px] whitespace-pre">Flashcards</p>
      </div>
    </div>
  );
}

function Paragraph12() {
  return (
    <div className="h-[24px] relative shrink-0 w-[187px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[187px]">
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[24px] left-0 not-italic text-[#454545] text-[16px] text-nowrap top-[-1px] whitespace-pre">Analytics</p>
      </div>
    </div>
  );
}

function Paragraph13() {
  return (
    <div className="h-[24px] relative shrink-0 w-[187px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[187px]">
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[24px] left-0 not-italic text-[#454545] text-[16px] text-nowrap top-[-1px] whitespace-pre">Quizzes</p>
      </div>
    </div>
  );
}

function Items1() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[24px] h-[168px] items-end justify-center left-[532.67px] top-[48px] w-[187px]" data-name="Items1">
      <Paragraph10 />
      <Paragraph11 />
      <Paragraph12 />
      <Paragraph13 />
    </div>
  );
}

function Paragraph14() {
  return (
    <div className="h-[24px] relative shrink-0 w-[187px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[187px]">
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[24px] left-0 not-italic text-[16px] text-black text-nowrap top-[-1px] whitespace-pre">Resources</p>
      </div>
    </div>
  );
}

function Paragraph15() {
  return (
    <div className="h-[24px] relative shrink-0 w-[187px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[187px]">
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[24px] left-0 not-italic text-[#454545] text-[16px] text-nowrap top-[-1px] whitespace-pre">Study Guide</p>
      </div>
    </div>
  );
}

function Paragraph16() {
  return (
    <div className="h-[24px] relative shrink-0 w-[187px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[187px]">
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[24px] left-0 not-italic text-[#454545] text-[16px] text-nowrap top-[-1px] whitespace-pre">Templates</p>
      </div>
    </div>
  );
}

function Paragraph17() {
  return (
    <div className="h-[24px] relative shrink-0 w-[187px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[187px]">
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[24px] left-0 not-italic text-[#454545] text-[16px] text-nowrap top-[-1px] whitespace-pre">Help</p>
      </div>
    </div>
  );
}

function Items2() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[24px] h-[168px] items-end justify-center left-[700.84px] top-[48px] w-[187px]" data-name="Items2">
      <Paragraph14 />
      <Paragraph15 />
      <Paragraph16 />
      <Paragraph17 />
    </div>
  );
}

function Paragraph18() {
  return (
    <div className="h-[24px] relative shrink-0 w-[187px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[187px]">
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[24px] left-0 not-italic text-[16px] text-black text-nowrap top-[-1px] whitespace-pre">Company</p>
      </div>
    </div>
  );
}

function Paragraph19() {
  return (
    <div className="h-[24px] relative shrink-0 w-[187px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[187px]">
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[24px] left-0 not-italic text-[#454545] text-[16px] text-nowrap top-[-1px] whitespace-pre">About</p>
      </div>
    </div>
  );
}

function Paragraph20() {
  return (
    <div className="h-[24px] relative shrink-0 w-[187px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[187px]">
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[24px] left-0 not-italic text-[#454545] text-[16px] text-nowrap top-[-1px] whitespace-pre">Contact</p>
      </div>
    </div>
  );
}

function Paragraph21() {
  return (
    <div className="h-[24px] relative shrink-0 w-[187px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[187px]">
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[24px] left-0 not-italic text-[#454545] text-[16px] text-nowrap top-[-1px] whitespace-pre">Privacy</p>
      </div>
    </div>
  );
}

function Items3() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[24px] h-[168px] items-end justify-center left-[868px] top-[48px] w-[187px]" data-name="Items3">
      <Paragraph18 />
      <Paragraph19 />
      <Paragraph20 />
      <Paragraph21 />
    </div>
  );
}

function Paragraph22() {
  return (
    <div className="absolute h-[36px] left-[80px] top-[52px] w-[69.859px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[36px] left-0 not-italic text-[24px] text-black text-nowrap top-[-1px] whitespace-pre">Noted</p>
    </div>
  );
}

function Icon7() {
  return (
    <div className="absolute contents inset-[8.5%_8.33%]" data-name="Icon">
      <div className="absolute inset-[8.5%_8.33%]" data-name="Icon_2">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
          <path d={svgPaths.p20002400} fill="var(--fill-0, #828282)" id="Icon_2" />
        </svg>
      </div>
    </div>
  );
}

function Icon8() {
  return (
    <div className="h-[24px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <Icon7 />
    </div>
  );
}

function Icon9() {
  return (
    <div className="content-stretch flex flex-col h-[24px] items-start relative shrink-0 w-full" data-name="Icon">
      <Icon8 />
    </div>
  );
}

function ButtonsIcon() {
  return (
    <div className="absolute box-border content-stretch flex flex-col items-start left-0 pb-0 pt-[8px] px-[8px] rounded-[4px] size-[40px] top-0" data-name="ButtonsIcon">
      <Icon9 />
    </div>
  );
}

function Icon10() {
  return (
    <div className="absolute contents inset-[12.5%]" data-name="Icon">
      <div className="absolute inset-[12.5%]" data-name="Icon_2">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
          <path d={svgPaths.pffeab80} fill="var(--fill-0, #828282)" id="Icon_2" />
        </svg>
      </div>
    </div>
  );
}

function Icon11() {
  return (
    <div className="h-[24px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <Icon10 />
    </div>
  );
}

function Icon1() {
  return (
    <div className="content-stretch flex flex-col h-[24px] items-start relative shrink-0 w-full" data-name="Icon1">
      <Icon11 />
    </div>
  );
}

function ButtonsIcon1() {
  return (
    <div className="absolute box-border content-stretch flex flex-col items-start left-[48px] pb-0 pt-[8px] px-[8px] rounded-[4px] size-[40px] top-0" data-name="ButtonsIcon1">
      <Icon1 />
    </div>
  );
}

function Icon12() {
  return (
    <div className="absolute contents inset-[20.83%_8.33%]" data-name="Icon">
      <div className="absolute inset-[20.83%_8.33%]" data-name="Icon_2">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 14">
          <path d={svgPaths.p23f4a440} fill="var(--fill-0, #828282)" id="Icon_2" />
        </svg>
      </div>
    </div>
  );
}

function Icon13() {
  return (
    <div className="h-[24px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <Icon12 />
    </div>
  );
}

function Icon2() {
  return (
    <div className="content-stretch flex flex-col h-[24px] items-start relative shrink-0 w-full" data-name="Icon2">
      <Icon13 />
    </div>
  );
}

function ButtonsIcon2() {
  return (
    <div className="absolute box-border content-stretch flex flex-col items-start left-[96px] pb-0 pt-[8px] px-[8px] rounded-[4px] size-[40px] top-0" data-name="ButtonsIcon2">
      <Icon2 />
    </div>
  );
}

function Icon14() {
  return (
    <div className="absolute contents inset-[8.333%]" data-name="Icon">
      <div className="absolute inset-[8.333%]" data-name="Icon_2">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
          <path d={svgPaths.p1347bd80} fill="var(--fill-0, #828282)" id="Icon_2" />
        </svg>
      </div>
    </div>
  );
}

function Icon15() {
  return (
    <div className="h-[24px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <Icon14 />
    </div>
  );
}

function Icon3() {
  return (
    <div className="content-stretch flex flex-col h-[24px] items-start relative shrink-0 w-full" data-name="Icon3">
      <Icon15 />
    </div>
  );
}

function ButtonsIcon3() {
  return (
    <div className="absolute box-border content-stretch flex flex-col items-start left-[144px] pb-0 pt-[8px] px-[8px] rounded-[4px] size-[40px] top-0" data-name="ButtonsIcon3">
      <Icon3 />
    </div>
  );
}

function SocialIcons() {
  return (
    <div className="absolute h-[40px] left-[80px] top-[176px] w-[184px]" data-name="SocialIcons">
      <ButtonsIcon />
      <ButtonsIcon1 />
      <ButtonsIcon2 />
      <ButtonsIcon3 />
    </div>
  );
}

function Icon16() {
  return (
    <div className="h-px overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute bottom-1/2 left-0 right-0 top-1/2" data-name="Divider">
        <div className="absolute bottom-[-0.5px] left-0 right-0 top-[-0.5px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1280 2">
            <path d="M0 1H1280" id="Divider" stroke="var(--stroke-0, #E6E6E6)" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container40() {
  return (
    <div className="absolute content-stretch flex flex-col h-px items-start left-[80px] top-0 w-[1280px]" data-name="Container">
      <Icon16 />
    </div>
  );
}

function NotedFooter() {
  return (
    <div className="absolute bg-white h-[264px] left-0 overflow-clip top-[1693.59px] w-[1135px]" data-name="NotedFooter">
      <Items1 />
      <Items2 />
      <Items3 />
      <Paragraph22 />
      <SocialIcons />
      <Container40 />
    </div>
  );
}

function Paragraph23() {
  return (
    <div className="absolute h-[30px] left-0 top-[11px] w-[76.109px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[30px] left-0 not-italic text-[20px] text-nowrap text-white top-[-0.5px] whitespace-pre">Analyze</p>
    </div>
  );
}

function Paragraph24() {
  return (
    <div className="absolute h-[30px] left-[124.11px] top-[11px] w-[88.609px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[30px] left-0 not-italic text-[20px] text-nowrap text-white top-[-0.5px] whitespace-pre">Notecard</p>
    </div>
  );
}

function Paragraph25() {
  return (
    <div className="absolute h-[30px] left-[260.72px] top-[11px] w-[78.273px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[30px] left-0 not-italic text-[20px] text-nowrap text-white top-[-0.5px] whitespace-pre">Quiz Me</p>
    </div>
  );
}

function Paragraph26() {
  return (
    <div className="h-[24px] relative shrink-0 w-[42.086px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[42.086px]">
        <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[24px] left-0 not-italic text-[16px] text-nowrap text-white top-[-1px] whitespace-pre">Login</p>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="absolute bg-black box-border content-stretch flex h-[52px] items-center justify-center left-[386.99px] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] top-0 w-[90.086px]" data-name="Button2">
      <Paragraph26 />
    </div>
  );
}

function Items() {
  return (
    <div className="absolute h-[52px] left-[575.92px] top-[56px] w-[477.078px]" data-name="Items">
      <Paragraph23 />
      <Paragraph24 />
      <Paragraph25 />
      <Button2 />
    </div>
  );
}

function Paragraph27() {
  return (
    <div className="absolute h-[30px] left-[80px] top-[67px] w-[58.57px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[30px] left-0 not-italic text-[20px] text-nowrap text-white top-[-0.5px] whitespace-pre">Noted</p>
    </div>
  );
}

function NotedNavigation() {
  return (
    <div className="absolute h-[164px] left-0 overflow-clip top-0 w-[1133px]" data-name="NotedNavigation">
      <Items />
      <Paragraph27 />
    </div>
  );
}

function App() {
  return (
    <div className="bg-white h-[1957.59px] overflow-clip relative shrink-0 w-full" data-name="App">
      <FlashcardSection />
      <NotedFooter />
      <NotedNavigation />
    </div>
  );
}

export default function FlashcardSection1() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start relative size-full" data-name="Flashcard Section">
      <App />
    </div>
  );
}