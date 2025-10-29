import { FlatList, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGlobalContext } from "@/lib/global-provide";
import { RegularCard } from "@/components/Cards";
import { router } from "expo-router";
import { useCallback } from "react";
import { Property } from "@/lib/crmre";

const Favorites = () => {
  const { favorites } = useGlobalContext();
  const insets = useSafeAreaInsets();

  const handlePress = useCallback((property: Property) => {
    if (property?.id) {
      router.push(`/properties/${property.id}`);
    }
  }, []);

  if (favorites.length === 0) {
    return (
      <View
        className="flex-1 bg-white items-center justify-center px-6"
        style={{
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        }}
      >
        <Text className="text-lg font-rubik-bold text-black-300">
          No favourites yet
        </Text>
        <Text className="text-sm font-rubik text-black-200 text-center mt-2">
          Tap the heart on any property to add it to your favourites list.
        </Text>
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-white"
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <FlatList
        data={favorites}
        keyExtractor={(item) => `${item.id}`}
        renderItem={({ item }) => (
          <RegularCard item={item} onPress={handlePress} />
        )}
        contentContainerClassName="pb-10 pt-4"
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default Favorites;
