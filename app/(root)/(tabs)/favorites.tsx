import React from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import icons from "@/constants/icons";
import { RegularCard } from "@/components/Cards";
import { useGlobalContext } from "@/lib/global-provide";

const Favorites = () => {
  const { user, favorites, isFavorite, toggleFavorite, isDarkTheme } = useGlobalContext();
  const date = new Date();
  const hours = date.getHours();
  const greeting = hours < 12 && hours >= 6 ? "Good morning" : hours < 18 && hours >= 12 ? "Good afternoon" : "Good evening";
  const screenBackground = isDarkTheme ? "#111827" : "#FFFFFF";
  const titleColor = isDarkTheme ? "#F3F4F6" : "#191D31";
  const subtitleColor = isDarkTheme ? "#9CA3AF" : "#8C8E98";

  const EmptyFavorites = () => (
    <View className="items-center justify-center px-8 mt-20">
      <View
        className="size-16 rounded-full items-center justify-center"
        style={{ backgroundColor: isDarkTheme ? "#1F2937" : "#EFF6FF" }}
      >
        <Image source={icons.heart} className="size-8" tintColor="#EF4444" />
      </View>
      <Text className="mt-5 text-xl font-rubik-bold text-center" style={{ color: titleColor }}>
        No favorites yet
      </Text>
      <Text className="mt-2 text-base font-rubik text-center" style={{ color: subtitleColor }}>
        Tap the heart icon on any listing to save it here and build your shortlist.
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="h-full" style={{ backgroundColor: screenBackground }}>
      <FlatList
        style={{ backgroundColor: screenBackground }}
        data={favorites}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperClassName="flex gap-5 px-5"
        contentContainerClassName="pb-32"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={(
          <View className="px-5 mt-5" style={{ backgroundColor: screenBackground }}>
            <View className="flex flex-row items-center justify-between">
              <View className="flex flex-row items-center">
                <Image source={{ uri: user?.avatar }} className="size-12 rounded-full" />
                <View className="flex flex-col items-start ml-2 justify-center">
                  <Text className="text-xs font-rubik" style={{ color: subtitleColor }}>{greeting},</Text>
                  <Text className="text-base font-rubik-medium" style={{ color: titleColor }}>{user?.name}</Text>
                </View>
              </View>
              <Image source={icons.heart} className="size-6" tintColor="#EF4444" />
            </View>

          </View>
        )}
        ListEmptyComponent={<EmptyFavorites />}
        renderItem={({ item }) => (
          <RegularCard
            item={item}
            onPress={() => router.push(`/properties/${item.id}`)}
            isFavorite={isFavorite(item.id)}
            onToggleFavorite={() => toggleFavorite(item)}
          />
        )}
      />
    </SafeAreaView>
  );
};

export default Favorites;
