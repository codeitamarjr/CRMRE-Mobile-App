import icons from '@/constants/icons'
import images from '@/constants/images'
import { Property } from '@/lib/crmre';
import { View, Text, TouchableOpacity, Image } from 'react-native'


interface Props {
    item: Property;
    onPress?: () => void;
}

// Utility function for selecting the best image URI
const getImageUri = (gallery: Property['gallery'], property: Property['property']) => {
    return (
        gallery.cover ||
        gallery.images?.[0] ||
        property.gallery.cover ||
        null
    );
};

// Reusable Rating Badge Component
const RatingBadge = () => (
    <View className="flex flex-row items-center bg-white/90 px-3 py-1.5 rounded-full absolute top-5 right-5">
        <Image source={icons.star} className="size-3.5" />
        <Text className="text-xs font-rubik-bold text-primary-300 ml-1">5</Text>
    </View>
);

// Reusable Favorite Icon Component
const FavoriteIcon = () => (
    <Image source={icons.heart} className="size-5" tintColor="#191d31" />
);

export const FeaturedCard = ({ item: { gallery, address, rate, city, property }, onPress }: Props) => {
    const imageUri = getImageUri(gallery, property);

    return (
        <TouchableOpacity onPress={onPress} className='flex flex-col items-start w-60 h-80 relative'>
            {imageUri ? (
                <Image source={{ uri: imageUri }} className='size-full rounded-2xl' />
            ) : (
                <Image source={images.iconRE} className='size-full rounded-2xl' />
            )}

            <Image source={images.cardGradient} className='size-full rounded-2xl absolute bottom-0' />
            <RatingBadge />

            <View className='flex flex-col items-start absolute bottom-5 inset-x-5'>
                <Text className='text-xl font-rubik-extra-bold text-white' numberOfLines={1}>{city}</Text>
                <Text className='text-base font-rubik text-white'
                    numberOfLines={1}
                    ellipsizeMode='tail'>
                    {address}
                </Text>
                <View className='flex flex-row items-center justify-between w-full'>
                    <Text className='text-xl font-rubik-extra-bold text-white'>
                        {rate}
                    </Text>
                    <Image source={icons.heart} className='size-5' />
                </View>
            </View>
        </TouchableOpacity>
    )
}

export const RegularCard = ({ item: { gallery, address, rate, type, number, property }, onPress }: Props) => {
    const imageUri = getImageUri(gallery, property);

    return (
        <TouchableOpacity onPress={onPress} className='flex-1 w-full mt-4 px-3 py-4 rounded-lg bg-white shadow-lg shadow-black-100/70 relative'>
            <View className='flex flex-row items-center absolute px-2 top-5 right-5 bg-white/90 p-1 rounded-full z-50'>
                <Image source={icons.star} className='size-2.5' />
                <Text className='text-xs font-rubik-bold text-primary-300 ml-0.5'>5</Text>
            </View>

            {imageUri ? (
                <Image source={{ uri: imageUri }} className='w-full h-40 rounded-lg' />
            ) : (
                <Image source={images.iconRE} className='w-full h-40 rounded-lg' />
            )}

            <View className='flex flex-col mt-2'>
                <Text className='text-base font-rubik-bold text-black-300'>{type} {number}</Text>
                <Text className='text-xs font-rubik text-black-200'>
                    {address}
                </Text>
                <View className='flex flex-row items-center justify-between mt-2'>
                    <Text className='text-base font-rubik-bold text-primary-300'>
                        {rate}
                    </Text>
                    <Image source={icons.heart} className='size-5 mr-2' tintColor="#191d31" />
                </View>
            </View>
        </TouchableOpacity>
    )
}