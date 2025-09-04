'use client';
import { useEffect } from 'react';

const useDisablePWAInstallPrompt = () => {
  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      event.preventDefault();
      // Optionally, you can store the event and decide when to prompt manually
      // window.deferredPrompt = event;
    };

    // Add the event listener
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt,
      );
    };
  }, []);
};

export default useDisablePWAInstallPrompt;
