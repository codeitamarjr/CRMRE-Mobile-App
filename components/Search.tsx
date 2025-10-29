import { View, Image, TextInput, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import icons from '@/constants/icons';
import { useDebouncedCallback } from 'use-debounce';
import { useGlobalContext } from '@/lib/global-provide';

interface SearchProps {
    initialQuery?: string;
    onSearch: (query: string) => void;
    onFilterPress?: () => void;
}

const Search: React.FC<SearchProps> = ({ initialQuery = '', onSearch, onFilterPress }) => {
    const [searchText, setSearchText] = useState(initialQuery);
    const { theme } = useGlobalContext();
    const placeholderColor = theme === "dark" ? "#94A3B8" : "#666876";

    const debouncedSearch = useDebouncedCallback((text: string) => {
        onSearch(text);
    }, 500);

    const handleTextChange = (text: string) => {
        setSearchText(text);
        debouncedSearch(text);
    };

    return (
        <View className='flex flex-row items-center justify-between w-full px-4 rounded-lg bg-accent-100 dark:bg-slate-900 border border-primary-100 dark:border-slate-700 mt-5 py-2'>
            <View className='flex flex-row flex-1 items-center justify-start z-50'>
                <Image
                    source={icons.search}
                    className='size-5 ml-2'
                    style={theme === "dark" ? { tintColor: "#CBD5F5" } : undefined}
                />
                <TextInput
                    value={searchText}
                    onChangeText={handleTextChange}
                    placeholder='Search for anything'
                    placeholderTextColor={placeholderColor}
                    className='flex-1 ml-2 text-sm font-rubik text-black-300 dark:text-slate-100'
                />
            </View>

            <TouchableOpacity
                onPress={onFilterPress}
                className='flex items-center justify-center ml-3 rounded-lg bg-primary-200 dark:bg-primary-300/40 p-3 z-50'
            >
                <Image
                    source={icons.filter}
                    className='size-6'
                    style={theme === "dark" ? { tintColor: "#CBD5F5" } : undefined}
                />
            </TouchableOpacity>
        </View>
    )
}

export default Search
