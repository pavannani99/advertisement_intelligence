import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Toast, UIContextValue } from '../types';

const UIContext = createContext<UIContextValue | undefined>(undefined);

interface UIProviderProps {
  children: ReactNode;
}

export const UIProvider: React.FC<UIProviderProps> = ({ children }) => {
  const [darkMode, setDarkMode] = useState<boolean>(true); // Default to dark mode
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    }
    
    // Apply theme to document
    updateDocumentTheme(darkMode);
  }, []);

  // Update document class when theme changes
  useEffect(() => {
    updateDocumentTheme(darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const updateDocumentTheme = (isDark: boolean) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = generateId();
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration || 4000,
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-remove toast after duration
    setTimeout(() => {
      removeToast(id);
    }, newToast.duration);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  const value: UIContextValue = {
    darkMode,
    toggleDarkMode,
    addToast,
    removeToast,
    isLoading,
    setLoading,
  };

  return (
    <UIContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </UIContext.Provider>
  );
};

export const useUI = (): UIContextValue => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};

// Toast Container Component
interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-4">
      {toasts.map((toast) => (
        <ToastComponent key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

// Individual Toast Component
interface ToastComponentProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastComponent: React.FC<ToastComponentProps> = ({ toast, onRemove }) => {
  const getToastIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  const getToastClasses = () => {
    const baseClasses = 'toast toast-enter';
    switch (toast.type) {
      case 'success':
        return `${baseClasses} toast-success`;
      case 'error':
        return `${baseClasses} toast-error`;
      case 'warning':
        return `${baseClasses} toast-warning`;
      case 'info':
      default:
        return `${baseClasses} toast-info`;
    }
  };

  return (
    <div className={getToastClasses()}>
      <div className="flex-shrink-0 text-lg">
        {getToastIcon()}
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-dark-text-primary">{toast.title}</h4>
        {toast.message && (
          <p className="text-sm text-dark-text-secondary mt-1">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 text-dark-text-muted hover:text-dark-text-secondary transition-colors ml-3"
      >
        ✕
      </button>
    </div>
  );
};

// Helper function to generate unique IDs
function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}
