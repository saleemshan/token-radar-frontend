import React from 'react';

const WarningBanner = () => {
  // Get the warning message from environment variable
  const warningMessage = process.env.NEXT_PUBLIC_SHOW_WARNING;

  // If the environment variable is not set or empty, don't render anything
  if (!warningMessage) {
    return null;
  }

  // Function to safely render HTML content with only allowed tags and attributes
  const renderSafeHTML = (content: string) => {
    // Replace URLs to crush.xyz with actual links
    // This regex matches https://www.crush.xyz/ followed by any path
    const safeContent = content.replace(
      /(https:\/\/www\.crush\.xyz(?:\/[^\s<>"']*)?)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-400 underline hover:text-blue-300">$1</a>'
    );

    // const safeContent = content.replace(
    //   /(https:\/\/(?:www\.crush\.xyz|crush-token-radar\.vercel\.app)(?:\/[^\s<>"']*)?)/g,

    //   '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-400 underline hover:text-blue-300">$1</a>'
    // );

    return { __html: safeContent };
  };

  return (
    <div className="bg-red-600 text-white py-3 px-4 w-full text-center font-medium z-50">
      <div dangerouslySetInnerHTML={renderSafeHTML(warningMessage)} />
    </div>
  );
};

export default WarningBanner;