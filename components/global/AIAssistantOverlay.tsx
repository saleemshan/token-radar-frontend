'use client';
import React from 'react';
import AIAssistantPanel from '@/components/panel/AIAssistantPanel';
import { useUser } from '@/context/UserContext';
import { FaRobot } from 'react-icons/fa6';

const AIAssistantOverlay = () => {
  const { showAIAssistant, toggleAIAssistant } = useUser();

  if (!(process.env.NEXT_PUBLIC_ENABLE_AI_COMPANION === 'true')) return;
  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col items-end justify-end z-[100]  md:p-3 mb-[4.65rem] md:mb-0">
      {showAIAssistant && (
        <div
          className={`overflow-hidden w-full lg:w-[22rem]  lg:max-h-[500px] bg-black h-full rounded-lg`}
        >
          <AIAssistantPanel />
        </div>
      )}
      {!showAIAssistant && (
        <button
          className="hidden md:flex group pointer-events-auto relative size-14 border border-border bg-neutral-900 hover:bg-neutral-800 apply-transition rounded-full   items-center justify-center  hover:text-neutral-text text-neutral-text-dark"
          onClick={toggleAIAssistant}
        >
          {/* group-hover:animate-bounce */}
          <FaRobot className="text-2xl " />
        </button>
      )}
    </div>
  );
};

export default AIAssistantOverlay;
