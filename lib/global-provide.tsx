import {
    createContext,
    ReactNode,
    useContext,
    useState,
    useCallback,
    useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Property } from "@/lib/crmre";

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
    favorites: Property[];
    toggleFavorite: (property: Property) => void;
    isFavorite: (propertyId: number) => boolean;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);
const FAVORITES_STORAGE_KEY = "crmre:favorites";

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [favorites, setFavorites] = useState<Property[]>([]);
    const [favoritesHydrated, setFavoritesHydrated] = useState(false);

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

    const toggleFavorite = useCallback((property: Property) => {
        if (!property?.id) return;

        setFavorites((prev) => {
            const exists = prev.some((item) => item.id === property.id);
            if (exists) {
                return prev.filter((item) => item.id !== property.id);
            }
            return [...prev, property];
        });
    }, []);

    const isFavorite = useCallback(
        (propertyId: number) => favorites.some((item) => item.id === propertyId),
        [favorites]
    );

    useEffect(() => {
        const loadFavorites = async () => {
            try {
                const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
                if (stored) {
                    const parsed: unknown = JSON.parse(stored);
                    if (Array.isArray(parsed)) {
                        setFavorites(parsed as Property[]);
                    }
                }
            } catch (error) {
                console.warn("Failed to load favorites", error);
            } finally {
                setFavoritesHydrated(true);
            }
        };

        loadFavorites();
    }, []);

    useEffect(() => {
        if (!favoritesHydrated) return;

        const persistFavorites = async () => {
            try {
                await AsyncStorage.setItem(
                    FAVORITES_STORAGE_KEY,
                    JSON.stringify(favorites)
                );
            } catch (error) {
                console.warn("Failed to save favorites", error);
            }
        };

        persistFavorites();
    }, [favorites, favoritesHydrated]);

    return (
        <GlobalContext.Provider
            value={{
                isLoggedIn,
                user,
                loading,
                refetch,
                login,
                favorites,
                toggleFavorite,
                isFavorite,
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
