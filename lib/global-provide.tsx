import { createContext, ReactNode, useContext, useState, useCallback } from "react";

interface User {
    $id: string;
    name: string;
    email: string;
    avatar: string;
}

interface GlobalContextType {
    isLoggedIn: boolean;
    user: User | null;
    loading: boolean;
    refetch: () => Promise<void>;
    login: () => Promise<void>;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);

    const login = useCallback(async () => {
        setLoading(true);
        try {
            setIsLoggedIn(true);
        } finally {
            setLoading(false);
        }
    }, []);

    const refetch = useCallback(async () => {
        // Placeholder for future refresh logic
    }, []);

    return (
        <GlobalContext.Provider
            value={{
                isLoggedIn,
                user,
                loading,
                refetch,
                login,
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = (): GlobalContextType => {
    const context = useContext(GlobalContext);

    if (!context) {
        throw new Error("useGlobalContext must be used within a GlobalProvider");
    }

    return context;
};

export default GlobalProvider;
