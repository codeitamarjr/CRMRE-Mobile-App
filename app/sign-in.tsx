import React from 'react'
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { Redirect } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import ThemeToggle from '@/components/ThemeToggle'
import { useGlobalContext } from '@/lib/global-provide'
import InfinityScrollScreen from '../components/InfinityScrollScreen'
import icons from '../constants/icons'

const images = [
  'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=800&q=60',
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=60',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=60',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=60',
  'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=800&q=60',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=60',
]

const SignIn = () => {
  const { login, loading, isLoggedIn } = useGlobalContext();
  const insets = useSafeAreaInsets();

  if (!loading && isLoggedIn) return <Redirect href="/" />

  const handleLogin = async () => {
    await login();
  };

  return (
    <View
      className='bg-white dark:bg-slate-950 h-full'
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <ScrollView>
        <View className='px-10 mt-4 flex flex-row justify-end'>
          <ThemeToggle />
        </View>
        <InfinityScrollScreen data={images} />
        {/* <Image source={require('../assets/images/icon.png')} className='size-40 my-40 mx-auto' resizeMode='contain' /> */}
        <View className='px-10'>
          <Text className='text-base text-center uppercase text-black-200 dark:text-slate-400 font-rubik my-5'>Real Enquiries Marketplace</Text>
          <Text className='text-3xl font-rubik-bold text-black-300 dark:text-slate-100 text-center mt-2'>
            Let{"'"}s get you close to {"\n"}
            <Text className='text-primary-300'>
              Your Dream Property
            </Text>
          </Text>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            className='bg-white dark:bg-slate-900 shadow-md shadow-zinc-300 dark:shadow-black/40 rounded-full w-full py-4 mt-5'
          >
            <View className='flex flex-row items-center justify-center'>
              <Image source={icons.google} className='size-5' resizeMode='contain' />
              <Text className='text-lg font-rubik-medium text-black-300 dark:text-slate-100 ml-2'>Continue with Google</Text>
            </View>
          </TouchableOpacity>

          <View className='flex flex-row items-center justify-center mt-5'>
            <View className='w-1/2 h-1 bg-black-100 dark:bg-slate-700' />
            <Text className='text-lg font-rubik text-black-200 dark:text-slate-400 mx-2'>or</Text>
            <View className='w-1/2 h-1 bg-black-100 dark:bg-slate-700' />
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            className='bg-white dark:bg-slate-900 shadow-md shadow-zinc-300 dark:shadow-black/40 rounded-full w-full py-4 mt-5 mb-5'
          >
            <View className='flex flex-row items-center justify-center'>
              <Text className='text-2xl font-rubik-medium text-black-300 dark:text-slate-100'>@</Text>
              <Text className='text-lg font-rubik-medium text-black-300 dark:text-slate-100 ml-2'>Continue with Email</Text>
            </View>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  )
}

export default SignIn
