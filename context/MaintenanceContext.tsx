'use client';
import { toast } from 'react-toastify';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface MaintenanceContextType {
  isMaintenance: boolean;
  setIsMaintenance: React.Dispatch<React.SetStateAction<boolean>>;
}

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(
  undefined,
);

export const MaintenanceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isMaintenance, setIsMaintenance] = useState<boolean>(false);

  useEffect(() => {
    const maintenanceMode =
      process.env.NEXT_PUBLIC_SHOW_MAINTENANCE_TOAST === 'true';
    setIsMaintenance(maintenanceMode);

    if (maintenanceMode) {
      toast.info(`Crush is currently undergoing maintenance.`, {
        autoClose: false,
      });
    }
  }, []);

  return (
    <MaintenanceContext.Provider value={{ isMaintenance, setIsMaintenance }}>
      {children}
    </MaintenanceContext.Provider>
  );
};

export const useMaintenance = () => {
  const context = useContext(MaintenanceContext);
  if (context === undefined) {
    throw new Error('useMaintenance must be used within a MaintenanceProvider');
  }
  return context;
};
