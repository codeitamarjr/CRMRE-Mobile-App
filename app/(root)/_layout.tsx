import { useGlobalContext } from "@/lib/global-provide";
import { Redirect, Slot } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AppLayout() {
    const { loading, isLoggedIn } = useGlobalContext();
    const insets = useSafeAreaInsets();

    if (loading) {
        return (
            <View
                className="bg-white h-full flex justify-center items-center"
                style={{
                    paddingTop: insets.top,
                    paddingBottom: insets.bottom,
                    paddingLeft: insets.left,
                    paddingRight: insets.right,
                }}
            >
                <ActivityIndicator className="text-primary-300" size="large" />
            </View>
        )
    }

    if (!isLoggedIn) return <Redirect href="/sign-in" />

    return <Slot />
}
