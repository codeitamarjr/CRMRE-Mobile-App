import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import icons from "@/constants/icons";
import { ThemePreference, useGlobalContext } from "@/lib/global-provide";

const themeOptions: Array<{ key: ThemePreference; label: string; description: string }> = [
  { key: "system", label: "System", description: "Follow your device appearance setting." },
  { key: "light", label: "Light", description: "Always use light mode." },
  { key: "dark", label: "Dark", description: "Always use dark mode." },
];

const Settings = () => {
  const { isDarkTheme, themePreference, setThemePreference } = useGlobalContext();

  return (
    <SafeAreaView className="h-full" style={{ backgroundColor: isDarkTheme ? "#111827" : "#FFFFFF" }}>
      <View className="px-5 pt-5">
        <View className="flex flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="flex flex-row size-12">
            <View className="size-11 justify-center items-center bg-primary-200 rounded-full">
              <Image
                source={icons.backArrow}
                className="size-5"
                style={{ tintColor: isDarkTheme ? "#FFFFFF" : "#111827" }}
              />
            </View>
          </TouchableOpacity>

          <Text className="text-lg font-rubik-bold" style={{ color: isDarkTheme ? "#F3F4F6" : "#111827" }}>
            Settings
          </Text>

          <View className="size-12" />
        </View>

        <View className="mt-8">
          <Text className="text-xl font-rubik-bold" style={{ color: isDarkTheme ? "#F3F4F6" : "#111827" }}>
            Appearance
          </Text>
          <Text className="mt-2 text-sm font-rubik" style={{ color: isDarkTheme ? "#D1D5DB" : "#6B7280" }}>
            Choose how the app looks.
          </Text>
        </View>

        <View className="mt-6 gap-3">
          {themeOptions.map((option) => {
            const selected = option.key === themePreference;

            return (
              <TouchableOpacity
                key={option.key}
                onPress={() => setThemePreference(option.key)}
                className="rounded-xl border p-4"
                style={{
                  borderColor: selected ? "#2563EB" : isDarkTheme ? "#374151" : "#DBEAFE",
                  backgroundColor: selected ? (isDarkTheme ? "#1E3A8A" : "#EFF6FF") : isDarkTheme ? "#1F2937" : "#FFFFFF",
                }}
              >
                <Text className="text-base font-rubik-bold" style={{ color: isDarkTheme ? "#F9FAFB" : "#111827" }}>
                  {option.label}
                </Text>
                <Text className="mt-1 text-sm font-rubik" style={{ color: isDarkTheme ? "#D1D5DB" : "#6B7280" }}>
                  {option.description}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Settings;
