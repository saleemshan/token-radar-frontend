import React from 'react';

const ChatLoading = () => {
  return (
    <div className="flex items-center gap-[2px] mt-2">
      <div className="h-[0.35rem] w-[0.35rem] bg-neutral-500 rounded-full animate-bounce [animation-delay:0.3s]"></div>
      <div className="h-[0.35rem] w-[0.35rem] bg-neutral-500 rounded-full animate-bounce [animation-delay:0.15s]"></div>
      <div className="h-[0.35rem] w-[0.35rem] bg-neutral-500 rounded-full animate-bounce"></div>
    </div>
  );
};

export default ChatLoading;
