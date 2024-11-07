import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface PopupContextType {
  isLoginPopupOpen: boolean;
  setIsLoginPopupOpen: (isOpen: boolean) => void;
  isRegisterPopupOpen: boolean;
  setIsRegisterPopupOpen: (isOpen: boolean) => void;
  isPostPopupOpen: boolean;
  setIsPostPopupOpen: (isOpen: boolean) => void;
  isExportPopupOpen: boolean;
  setIsExportPopupOpen: (isOpen: boolean) => void;
  isSearchPopupOpen: boolean;
  setIsSearchPopupOpen: (isOpen: boolean) => void;
  isAnyPopupOpen: boolean;
  setIsAnyPopupOpen: (isOpen: boolean) => void;
}

export const PopupContext = React.createContext<PopupContextType | undefined>(undefined);

export const PopupProvider = ({ children }: { children: ReactNode }) => {
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const [isRegisterPopupOpen, setIsRegisterPopupOpen] = useState(false);
  const [isPostPopupOpen, setIsPostPopupOpen] = useState(false);
  const [isExportPopupOpen, setIsExportPopupOpen] = useState(false);
  const [isSearchPopupOpen, setIsSearchPopupOpen] = useState(false);
  const [isAnyPopupOpen, setIsAnyPopupOpen] = useState(false);

  useEffect(() => {
    setIsAnyPopupOpen(isLoginPopupOpen || isRegisterPopupOpen || isPostPopupOpen || isExportPopupOpen || isSearchPopupOpen);
  }, [isLoginPopupOpen, isRegisterPopupOpen, isPostPopupOpen, isExportPopupOpen, isSearchPopupOpen]);

  return (
    <PopupContext.Provider value={{ isAnyPopupOpen, setIsAnyPopupOpen, isLoginPopupOpen, setIsLoginPopupOpen, isRegisterPopupOpen, setIsRegisterPopupOpen, isPostPopupOpen, setIsPostPopupOpen, isExportPopupOpen, setIsExportPopupOpen, isSearchPopupOpen, setIsSearchPopupOpen }}>
      {children}
    </PopupContext.Provider>
  );
};

export const usePopup = () => {
  const context = useContext(PopupContext);
  if (context === undefined) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return context;
};