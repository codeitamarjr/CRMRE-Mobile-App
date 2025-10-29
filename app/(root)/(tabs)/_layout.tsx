import { View, Text, Image } from "react-native";
import React, { useMemo } from "react";
import { Tabs } from "expo-router";

import icons from "@/constants/icons";
import { useGlobalContext } from "@/lib/global-provide";

const TabIcon = ({
  focused,
  icon,
  title,
  isDark,
}: {
  focused: boolean;
  icon: any;
  title: string;
  isDark: boolean;
}) => (
  <View className="flex flex-col flex-1 mt-2 items-center">
    <Image
      source={icon}
      resizeMode="contain"
      className="size-6"
      style={{
        tintColor: focused
          ? "#0061FF"
          : isDark
          ? "#94A3B8"
          : "#666876",
      }}
    />
    <Text
      className={`${focused ? "text-primary-300 font-rubik-medium" : "text-gray-500 dark:text-slate-400 font-rubik"} text-sm text-center mt-1`}
    >
      {title}
    </Text>
  </View>
);

function TabsLayout() {
  const { theme } = useGlobalContext();
  const isDark = theme === "dark";

  const tabBarStyle = useMemo(
    () => ({
      backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
      position: "absolute" as const,
      borderTopColor: isDark ? "#1E293B" : "#0061FF1A",
      borderTopWidth: 1,
      minHeight: 70,
    }),
    [isDark]
  );

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={icons.home}
              focused={focused}
              title="Home"
              isDark={isDark}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={icons.search}
              focused={focused}
              title="Explore"
              isDark={isDark}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favourites",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={icons.heart}
              focused={focused}
              title="Favourites"
              isDark={isDark}
            />
          ),
        }}
      />
    </Tabs>
  );
}

export default TabsLayout;
