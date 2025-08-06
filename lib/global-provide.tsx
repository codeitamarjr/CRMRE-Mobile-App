import { createContext, ReactNode, useContext } from "react";

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
    refetch: () => Promise<void>; // noop
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
    const isLoggedIn = true;
    const user = null;
    const loading = false;

    const refetch = async () => {
        // no-op (placeholder for future login logic or refresh)
    };

    return (
        <GlobalContext.Provider
            value={{
                isLoggedIn,
                user,
                loading,
                refetch
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
