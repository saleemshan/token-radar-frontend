import { useEffect, useState } from 'react';

const getDisplayMode = () => {
  const isStandalone =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    'standalone' in navigator && (navigator as any).standalone;
  if (isStandalone) {
    return 'standalone';
  }
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return 'standalone';
  }
  return 'browser';
};

const useAddToHomeScreenPrompt = () => {
  const [promptVisible, setPromptVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDisplayMode = () => {
      const displayMode = getDisplayMode();
      if (displayMode === 'standalone') {
        // localStorage.setItem('add-to-homescreen', 'false');
        setPromptVisible(false);
      }
    };

    const handleMobileDetection = () => {
      if (typeof window !== 'undefined') {
        const userAgent = window.navigator.userAgent.toLowerCase();
        const mobile =
          /mobile|android|iphone|ipad|opera mini|iemobile|windows phone/i.test(
            userAgent,
          );
        setIsMobile(mobile);
      }
    };

    const checkPromptDisplay = () => {
      const shouldPrompt =
        localStorage.getItem('addToHomeScreenPrompt') === null;
      setPromptVisible(shouldPrompt);
    };

    handleMobileDetection();
    checkPromptDisplay();
    checkDisplayMode();
  }, []);

  const closePrompt = () => setPromptVisible(false);

  const dontShowAgain = () => {
    localStorage.setItem('addToHomeScreenPrompt', 'false');
    setPromptVisible(false);
  };

  return { promptVisible, isMobile, closePrompt, dontShowAgain };
};

export default useAddToHomeScreenPrompt;
