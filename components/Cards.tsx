import icons from '@/constants/icons'
import images from '@/constants/images'
import { View, Text, TouchableOpacity, Image } from 'react-native'
import { MarketplaceUnit } from '@/types/marketplace'
import { GestureResponderEvent } from 'react-native'
import { useGlobalContext } from '@/lib/global-provide'

interface Props {
    item: MarketplaceUnit;
    onPress?: () => void;
    isFavorite?: boolean;
    onToggleFavorite?: () => void;
}

const fallbackImage = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&auto=format&fit=crop';

const getCardImage = (item: MarketplaceUnit): string =>
    item.gallery?.cover || item.property?.gallery?.cover || fallbackImage;

const getAddressLabel = (item: MarketplaceUnit): string =>
    [item.location?.address_line_1, item.location?.city].filter(Boolean).join(', ') || item.property?.address || 'Address unavailable';

const getPriceLabel = (item: MarketplaceUnit): string =>
    item.rate?.formatted || 'Price on request';

const getCardTitle = (item: MarketplaceUnit): string => {
    if (item.name) {
        return item.name;
    }

    if (item.number && item.property?.name) {
        return `${item.property.name} - Unit ${item.number}`;
    }

    if (item.number) {
        return `Unit ${item.number}`;
    }

    return item.property?.name || 'Unit';
};

const getFeaturedCardTitle = (item: MarketplaceUnit): string => {
    if (item.property?.name) {
        return item.property.name;
    }

    if (item.name) {
        return item.name.replace(/\s*-\s*Unit\s+\S+$/i, "");
    }

    return 'Unit';
};

const getFeaturedCardSubtitle = (item: MarketplaceUnit): string => {
    const unitType = item.type || 'Unit';
    const unitNumber = item.number ? ` ${item.number}` : '';

    return `${unitType}${unitNumber}`;
};

const handleFavoritePress = (event: GestureResponderEvent, callback?: () => void) => {
    event.stopPropagation();
    callback?.();
};

export const FeaturedCard = ({ item, onPress, isFavorite = false, onToggleFavorite }: Props) => {
    return (
        <TouchableOpacity onPress={onPress} className='flex flex-col items-start w-60 h-80 relative'>
            <Image source={{ uri: getCardImage(item) }} className='size-full rounded-2xl' />
            <Image source={images.cardGradient} className='size-full rounded-2xl absolute bottom-0' />
            <View className='flex flex-row items-center bg-white/90 px-3 py-1.5 rounded-full absolute top-5 right-5'>
                <Image source={icons.bed} className='size-3.5' />
                <Text className='text-xs font-rubik-bold text-primary-300 ml-1'>{item.bedrooms ?? '-'}</Text>
            </View>

            <View className='flex flex-col items-start absolute bottom-5 inset-x-5'>
                <Text className='text-xl font-rubik-extra-bold text-white' numberOfLines={1}>{getFeaturedCardTitle(item)}</Text>
                <Text className='text-base font-rubik text-white'>
                    {getFeaturedCardSubtitle(item)}
                </Text>
                <View className='flex flex-row items-center justify-between w-full'>
                    <Text className='text-xl font-rubik-extra-bold text-white'>
                        {getPriceLabel(item)}
                    </Text>
                    <TouchableOpacity onPress={(event) => handleFavoritePress(event, onToggleFavorite)}>
                        <Image source={icons.heart} className='size-5' tintColor={isFavorite ? '#EF4444' : '#FFFFFF'} />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    )
}

export const RegularCard = ({ item, onPress, isFavorite = false, onToggleFavorite }: Props) => {
    const { isDarkTheme } = useGlobalContext();
    const cardBackground = isDarkTheme ? '#1F2937' : '#FFFFFF';
    const titleColor = isDarkTheme ? '#F3F4F6' : '#191D31';
    const subtitleColor = isDarkTheme ? '#9CA3AF' : '#666876';
    const heartColor = isFavorite ? '#EF4444' : (isDarkTheme ? '#F3F4F6' : '#191d31');

    return (
        <TouchableOpacity
            onPress={onPress}
            className='flex-1 w-full mt-4 px-3 py-4 rounded-lg shadow-lg shadow-black-100/70 relative'
            style={{ backgroundColor: cardBackground }}
        >
            <View className='flex flex-row items-center absolute px-2 top-5 right-5 p-1 rounded-full z-50' style={{ backgroundColor: isDarkTheme ? 'rgba(31,41,55,0.92)' : 'rgba(255,255,255,0.9)' }}>
                <Image source={icons.bed} className='size-2.5' />
                <Text className='text-xs font-rubik-bold text-primary-300 ml-0.5'>{item.bedrooms ?? '-'}</Text>
            </View>

            <Image source={{ uri: getCardImage(item) }} className='w-full h-40 rounded-lg' />

            <View className='flex flex-col mt-2'>
                <Text className='text-base font-rubik-bold' style={{ color: titleColor }}>{getCardTitle(item)}</Text>
                <Text className='text-xs font-rubik' style={{ color: subtitleColor }}>
                    {getAddressLabel(item)}
                </Text>
                <View className='flex flex-row items-center justify-between mt-2'>
                    <Text className='text-base font-rubik-bold text-primary-300'>
                        {getPriceLabel(item)}
                    </Text>
                    <TouchableOpacity onPress={(event) => handleFavoritePress(event, onToggleFavorite)}>
                        <Image source={icons.heart} className='size-5 mr-2' tintColor={heartColor} />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    )
}
