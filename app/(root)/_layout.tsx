import { useGlobalContext } from "@/lib/global-provide";
import { Redirect, Slot } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AppLayout() {
    const { loading, isLoggedIn, theme } = useGlobalContext();
    const insets = useSafeAreaInsets();

    if (loading) {
        return (
            <View
                className="bg-white dark:bg-slate-950 h-full flex justify-center items-center"
                style={{
                    paddingTop: insets.top,
                    paddingBottom: insets.bottom,
                    paddingLeft: insets.left,
                    paddingRight: insets.right,
                }}
            >
                <ActivityIndicator
                    size="large"
                    color={theme === "dark" ? "#93C5FD" : "#0061FF"}
                />
            </View>
        )
    }

    if (!isLoggedIn) return <Redirect href="/sign-in" />

    return <Slot />
}
