import React, { createContext, useContext, useState, useCallback } from 'react';

type LoaderContextType = {
    isLoading: boolean;
    showLoader: () => void;
    hideLoader: () => void;
    withLoader: <T>(fn: () => Promise<T>) => Promise<T>;
};

const LoaderContext = createContext<LoaderContextType | null>(null);

export const LoaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);

    const showLoader = useCallback(() => setIsLoading(true), []);
    const hideLoader = useCallback(() => setIsLoading(false), []);

    const withLoader = useCallback(async <T,>(fn: () => Promise<T>): Promise<T> => {
        setIsLoading(true);
        try {
            return await fn();
        } finally {
            setIsLoading(false);
        }
    }, []);

    return (
        <LoaderContext.Provider value={{ isLoading, showLoader, hideLoader, withLoader }}>
            {children}
        </LoaderContext.Provider>
    );
};

export const useLoader = (): LoaderContextType => {
    const ctx = useContext(LoaderContext);
    if (!ctx) throw new Error('useLoader must be used within a LoaderProvider');
    return ctx;
};
