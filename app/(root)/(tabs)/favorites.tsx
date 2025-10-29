import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGlobalContext } from "@/lib/global-provide";
import { RegularCard } from "@/components/Cards";
import { router } from "expo-router";
import { useCallback } from "react";
import { Property } from "@/lib/crmre";
import icons from "@/constants/icons";
import ThemeToggle from "@/components/ThemeToggle";

const Favorites = () => {
  const { favorites, theme } = useGlobalContext();
  const insets = useSafeAreaInsets();

  const handlePress = useCallback((property: Property) => {
    if (property?.id) {
      router.push(`/properties/${property.id}`);
    }
  }, []);

  return (
    <View className="bg-white dark:bg-slate-950 h-full" style={{
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    }}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => `${item.id}`}
        renderItem={({ item }) => (
          <RegularCard item={item} onPress={handlePress} />
        )}
        contentContainerClassName="pb-32"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="px-5">
            <View className="flex flex-row items-center justify-between mt-5">
              <TouchableOpacity
                onPress={() => router.back()}
                className="flex flex-row size-12"
                activeOpacity={0.8}
              >
                <View className="size-11 justify-center items-center bg-primary-200 dark:bg-primary-300/40 rounded-full">
                  <Image source={icons.backArrow} className="size-5" />
                </View>
              </TouchableOpacity>

              <Text className="text-base mr-2 text-center font-rubik-medium text-black-300 dark:text-slate-100">
                Favourites
              </Text>

              <View className="flex flex-row items-center gap-3">
                <ThemeToggle />
                <Image
                  source={icons.bell}
                  className="size-6"
                  style={theme === "dark" ? { tintColor: "#E2E8F0" } : undefined}
                />
              </View>
            </View>

            {favorites.length === 0 ? (
              <View className="py-24 items-center justify-center">
                <Text className="text-lg font-rubik-bold text-black-300 dark:text-slate-100">
                  No favourites yet
                </Text>
                <Text className="text-sm font-rubik text-black-200 dark:text-slate-400 text-center mt-2">
                  Tap the heart on any property to add it to your favourites list.
                </Text>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={null}
      />
    </View>
  );
};

export default Favorites;
