import { View, Text, ScrollView, Image, TouchableOpacity, ImageSourcePropType, Alert } from 'react-native'
import React from 'react'
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import icons from '@/constants/icons';
import { settings } from '@/constants/data';
import { useGlobalContext } from '@/lib/global-provide';

interface SettingsItemProps {
  icon: ImageSourcePropType;
  title: string;
  onPress?: () => void;
  textColor?: string;
  showArrow?: boolean;
  darkMode?: boolean;
}

const SettingsItem = ({ icon, title, onPress, textColor, showArrow = true, darkMode = false }: SettingsItemProps) => (
  <TouchableOpacity className='flex flex-row items-center justify-between py-3' onPress={onPress}>
    <View className='flex flex-row items-center gap-3'>
      <Image source={icon} className='size-6' />
      <Text className='text-lg font-rubik-medium' style={{ color: textColor ?? (darkMode ? '#F3F4F6' : '#1F2937') }}>{title}</Text>
    </View>
    {showArrow && <Image source={icons.rightArrow} className='size-5' />}
  </TouchableOpacity>
)

const Profile = () => {
  const { user, isDarkTheme } = useGlobalContext();
  const userInitials = (user?.name ?? "U")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <SafeAreaView className='h-full' style={{ backgroundColor: isDarkTheme ? '#111827' : '#FFFFFF' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32 px-7">
        <View className='flex flex-row items-center justify-between mt-5'>
          <Text className='text-xl font-rubik-bold' style={{ color: isDarkTheme ? '#F3F4F6' : '#111827' }}>Profile</Text>
          <Image source={icons.bell} className='size-5' />
        </View>

        <View className='flex flex-row justify-center mt-5'>
          <View className='flex flex-col items-center relative mt-5'>
            <View
              className='size-44 rounded-full items-center justify-center'
              style={{ backgroundColor: isDarkTheme ? '#1E3A8A' : '#DBEAFE' }}
            >
              <Text
                className='font-rubik-bold'
                style={{ color: isDarkTheme ? '#F3F4F6' : '#1E3A8A', fontSize: 48 }}
              >
                {userInitials}
              </Text>
            </View>
            <Text className='text-2xl font-rubik-bold mt-2' style={{ color: isDarkTheme ? '#F3F4F6' : '#111827' }}>{user?.name}</Text>
          </View>
        </View>

        <View className='flex flex-col mt-10'>
          <SettingsItem icon={icons.calendar} title='My Bookings' darkMode={isDarkTheme} />
          <SettingsItem icon={icons.wallet} title='Payments' darkMode={isDarkTheme} />
          <SettingsItem icon={icons.shield} title='Settings' onPress={() => router.push('/settings')} darkMode={isDarkTheme} />
        </View>

        <View className='flex flex-col mt-5 border-t pt-5 border-primary-200'>
          {settings.slice(2).map((item, index) => (
            <SettingsItem key={index} {...item} darkMode={isDarkTheme} />
          ))}
        </View>

        <View className='flex flex-col mt-5 border-t pt-5 border-primary-200'>
          <SettingsItem icon={icons.info} title='No account login required' onPress={() => Alert.alert('Info', 'This app now uses the CRM marketplace API directly without Appwrite login.')} textColor={isDarkTheme ? '#F3F4F6' : '#111827'} showArrow={false} darkMode={isDarkTheme} />
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

export default Profile
