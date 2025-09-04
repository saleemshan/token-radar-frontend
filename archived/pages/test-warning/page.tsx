import React from 'react';

export default function TestWarningPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Warning Banner Test Page</h1>
      <p className="text-lg">
        This page is used to test the warning banner that appears at the top of the page
        when the NEXT_PUBLIC_SHOW_WARNING environment variable is set.
      </p>
      <p className="mt-4">
        The warning banner should be visible at the top of this page with a clickable link
        to https://www.crush.xyz/.
      </p>
    </div>
  );
}