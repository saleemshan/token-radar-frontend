import React from 'react';

const TextLoading = ({ className }: { className?: string }) => {
  return (
    <div
      role="status"
      className={`flex flex-col animate-pulse py-2 ${
        className ?? 'justify-center '
      }`}
    >
      <div
        className={`bg-border rounded-full  w-full ${
          className ?? 'min-h-[.5rem] min-w-16'
        }`}
      />
    </div>
  );
};

export default TextLoading;
