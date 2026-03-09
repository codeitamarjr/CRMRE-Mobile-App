import { Appearance, ColorSchemeName, useColorScheme } from "react-native";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MarketplaceUnit } from "@/types/marketplace";

export type ThemePreference = "system" | "light" | "dark";

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
    themePreference: ThemePreference;
    setThemePreference: (theme: ThemePreference) => void;
    colorScheme: ColorSchemeName;
    isDarkTheme: boolean;
    favorites: MarketplaceUnit[];
    isFavorite: (unitId: number) => boolean;
    toggleFavorite: (unit: MarketplaceUnit) => Promise<void>;
    removeFavorite: (unitId: number) => Promise<void>;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);
const FAVORITES_STORAGE_KEY = "crmre.marketplace.favorites";
const THEME_STORAGE_KEY = "crmre.marketplace.theme";

const guestUser: User = {
    $id: "guest",
    name: "Marketplace User",
    email: "",
    avatar: "https://ui-avatars.com/api/?name=Marketplace+User&background=0061FF&color=fff",
};

export const GlobalProvider = ({children}: {children: ReactNode}) => {
    const systemColorScheme = useColorScheme();
    const [themePreference, setThemePreference] = useState<ThemePreference>("system");
    const [favorites, setFavorites] = useState<MarketplaceUnit[]>([]);
    const [themeHydrated, setThemeHydrated] = useState(false);

    const colorScheme = useMemo<ColorSchemeName>(() => {
        if (themePreference === "system") {
            return systemColorScheme ?? "light";
        }

        return themePreference;
    }, [themePreference, systemColorScheme]);
    const isDarkTheme = colorScheme === "dark";

    useEffect(() => {
        Appearance.setColorScheme(themePreference === "system" ? null : themePreference);
    }, [themePreference]);

    useEffect(() => {
        const loadFavorites = async () => {
            try {
                const rawFavorites = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);

                if (!rawFavorites) {
                    return;
                }

                const parsed = JSON.parse(rawFavorites);

                if (Array.isArray(parsed)) {
                    setFavorites(parsed as MarketplaceUnit[]);
                }
            } catch (error) {
                console.log("Failed to load favorites", error);
            }
        };

        loadFavorites();
    }, []);

    useEffect(() => {
        const loadThemePreference = async () => {
            try {
                const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);

                if (storedTheme === "system" || storedTheme === "light" || storedTheme === "dark") {
                    setThemePreference(storedTheme);
                }
            } catch (error) {
                console.log("Failed to load theme preference", error);
            } finally {
                setThemeHydrated(true);
            }
        };

        loadThemePreference();
    }, []);

    const persistFavorites = async (nextFavorites: MarketplaceUnit[]) => {
        setFavorites(nextFavorites);
        await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(nextFavorites));
    };

    const isFavorite = (unitId: number): boolean => favorites.some((item) => item.id === unitId);

    const toggleFavorite = async (unit: MarketplaceUnit): Promise<void> => {
        const existingFavorite = favorites.some((item) => item.id === unit.id);

        if (existingFavorite) {
            const nextFavorites = favorites.filter((item) => item.id !== unit.id);
            await persistFavorites(nextFavorites);
            return;
        }

        await persistFavorites([unit, ...favorites]);
    };

    const removeFavorite = async (unitId: number): Promise<void> => {
        const nextFavorites = favorites.filter((item) => item.id !== unitId);
        await persistFavorites(nextFavorites);
    };

    const updateThemePreference = (theme: ThemePreference) => {
        setThemePreference(theme);
    };

    useEffect(() => {
        if (!themeHydrated) {
            return;
        }

        const persistThemePreference = async () => {
            try {
                await AsyncStorage.setItem(THEME_STORAGE_KEY, themePreference);
            } catch (error) {
                console.log("Failed to save theme preference", error);
            }
        };

        persistThemePreference();
    }, [themePreference, themeHydrated]);

    return (
        <GlobalContext.Provider value={{
            isLoggedIn: true,
            user: guestUser,
            loading: false,
            refetch: async () => undefined,
            themePreference,
            setThemePreference: updateThemePreference,
            colorScheme,
            isDarkTheme,
            favorites,
            isFavorite,
            toggleFavorite,
            removeFavorite,
        }}>
            {children}
        </GlobalContext.Provider>
    )
}

export const useGlobalContext = ():GlobalContextType => {
    const context = useContext(GlobalContext);

    if(!context) {
        throw new Error('useGlobalContext must be used within a GlobalProvider');
    }

    return context;
}

export default GlobalProvider;
