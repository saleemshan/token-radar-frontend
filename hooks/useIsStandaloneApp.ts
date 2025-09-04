import { useState, useEffect } from 'react';

const useIsStandAloneApp = () => {
  const [isStandAloneApp, setIsStandAloneApp] = useState<boolean>(false);

  useEffect(() => {
    const getDisplayMode = () => {
      const isStandalone =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'standalone' in navigator && (navigator as any).standalone;
      if (isStandalone) {
        return true;
      }
      if (window.matchMedia('(display-mode: standalone)').matches) {
        return true;
      }
      return false;
    };
    const isStandAlone = getDisplayMode();
    setIsStandAloneApp(isStandAlone);
  }, []);

  return isStandAloneApp;
};

export default useIsStandAloneApp;
