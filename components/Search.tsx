import { View, Text, Image, TextInput, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import icons from '@/constants/icons';
import { useDebouncedCallback } from 'use-debounce';
import { useGlobalContext } from '@/lib/global-provide';

const Search = ({ onFilterPress }: { onFilterPress?: () => void }) => {
    const params = useLocalSearchParams<{ query?: string }>();
    const [search, setSearch] = useState(params.query ?? "");
    const { isDarkTheme } = useGlobalContext();

    useEffect(() => {
        setSearch(params.query ?? "");
    }, [params.query]);

    const debouncedSearch = useDebouncedCallback((text: string) => router.setParams({ query: text }), 500);

    const handleSearch = (text: string) => {
        setSearch(text);
        debouncedSearch(text);
    }

    const containerStyle = {
        backgroundColor: isDarkTheme ? '#1F2937' : '#FBFBFD',
        borderColor: isDarkTheme ? '#374151' : '#DBEAFE',
    };
    const iconTint = isDarkTheme ? '#F3F4F6' : '#191D31';
    const inputColor = isDarkTheme ? '#F3F4F6' : '#191D31';
    const placeholderColor = isDarkTheme ? '#9CA3AF' : '#666876';

    return (
        <View className='flex flex-row items-center justify-between w-full px-4 rounded-lg border mt-5 py-2' style={containerStyle}>
            <View className='flex flex-row flex-1 items-center justify-start z-50'>
                <Image source={icons.search} className='size-5 ml-2' tintColor={iconTint} />
                <TextInput
                    value={search}
                    onChangeText={handleSearch}
                    placeholder='Search for anything'
                    placeholderTextColor={placeholderColor}
                    className='flex-1 ml-2 text-sm font-rubik'
                    style={{ color: inputColor }}
                />
            </View>

            <TouchableOpacity onPress={onFilterPress} className='flex flex-row items-center justify-end z-50'>
                <Image source={icons.filter} className='size-5' tintColor={iconTint} />
            </TouchableOpacity>
        </View>
    )
}

export default Search
