import { View, Image } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'

import icons from '@/constants/icons'
import { useGlobalContext } from '@/lib/global-provide'

const TabIcon = ({ focused, icon }: {
    focused: boolean,
    icon: any,
}) => (
    <View className='flex flex-col flex-1 mt-2 items-center'>
        <Image source={icon} tintColor={focused ? '#0061FF' : '#666876'} resizeMode='contain' className='size-6' />
    </View>
)

function TabsLayout() {
    const { isDarkTheme } = useGlobalContext();

    return (
        <Tabs
            screenOptions={{
                tabBarShowLabel: false,
                tabBarStyle: {
                    backgroundColor: isDarkTheme ? '#111827' : 'white',
                    position: 'absolute',
                    borderTopColor: isDarkTheme ? '#1F2937' : '#0061FF1A',
                    borderTopWidth: 1,
                    minHeight: 70,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            icon={icons.home}
                            focused={focused}
                        />
                    )
                }} />
                <Tabs.Screen
                name="explore"
                options={{
                    title: 'Explore',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            icon={icons.search}
                            focused={focused}
                        />
                    )
                }} />
                <Tabs.Screen
                name="favorites"
                options={{
                    title: 'Favorites',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            icon={icons.heart}
                            focused={focused}
                        />
                    )
                }} />
                <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            icon={icons.person}
                            focused={focused}
                        />
                    )
                }} />
        </Tabs>
    )
}

export default TabsLayout
