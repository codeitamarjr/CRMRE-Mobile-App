import React, { memo, useCallback } from "react";
import icons from "@/constants/icons";
import images from "@/constants/images";
import { Property } from "@/lib/crmre";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  GestureResponderEvent,
} from "react-native";
import { useGlobalContext } from "@/lib/global-provide";

interface Props {
  item: Property;
  onPress?: (item: Property) => void;
}

const getImageUri = (property: Property) =>
  property.gallery.cover ||
  property.gallery.images?.[0] ||
  property.property?.gallery?.cover ||
  null;

const ViewsBadge = ({
  number,
  isDark,
}: {
  number?: number | null;
  isDark: boolean;
}) => (
  <View className="flex flex-row items-center bg-white/90 dark:bg-slate-900/80 px-3 py-1.5 rounded-full absolute top-5 right-5">
    <Image
      source={icons.view}
      className="size-3.5"
      style={isDark ? { tintColor: "#CBD5F5" } : undefined}
    />
    <Text className="text-xs font-rubik-bold text-primary-300 ml-1">
      {(number ?? 0).toLocaleString()}
    </Text>
  </View>
);

const FavoriteIcon = ({ tintColor }: { tintColor?: string }) => (
  <Image source={icons.heart} className="size-5" style={{ tintColor }} />
);

const buildSubtitle = (property: Property) => {
  if (property.address) {
    return property.address;
  }

  const parts = [property.property?.name, property.city, property.country]
    .filter(Boolean)
    .join(", ");

  return parts || "—";
};

const FeaturedCardComponent = ({ item, onPress }: Props) => {
  const imageUri = getImageUri(item);
  const handlePress = useCallback(() => {
    onPress?.(item);
  }, [onPress, item]);
  const { isFavorite, toggleFavorite, theme } = useGlobalContext();
  const isDark = theme === "dark";
  const isItemFavorite = item?.id ? isFavorite(item.id) : false;
  const handleFavoritePress = useCallback(
    (event: GestureResponderEvent) => {
      event.stopPropagation?.();
      toggleFavorite(item);
    },
    [toggleFavorite, item]
  );

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="flex flex-col items-start w-60 h-80 relative"
    >
      {imageUri ? (
        <Image source={{ uri: imageUri }} className="size-full rounded-2xl" />
      ) : (
        <Image source={images.iconRE} className="size-full rounded-2xl" />
      )}

      <Image
        source={images.cardGradient}
        className="size-full rounded-2xl absolute bottom-0"
      />
      <ViewsBadge number={item.views} isDark={isDark} />

      <View className="flex flex-col items-start absolute bottom-5 inset-x-5">
        <Text className="text-xl font-rubik-extra-bold text-white" numberOfLines={1}>
          {item.city || item.property?.city || item.country || "Featured"}
        </Text>
        <Text
          className="text-base font-rubik text-white"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {buildSubtitle(item)}
        </Text>
        <View className="flex flex-row items-center justify-between w-full">
          <Text className="text-xl font-rubik-extra-bold text-white">
            {item.rate}
          </Text>
          <TouchableOpacity onPress={handleFavoritePress} activeOpacity={0.8}>
            <FavoriteIcon
              tintColor={isItemFavorite ? "#F75555" : isDark ? "#E2E8F0" : "#191d31"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const RegularCardComponent = ({ item, onPress }: Props) => {
  const imageUri = getImageUri(item);
  const title =
    item.name ||
    [item.type, item.number ?? item.unitCode].filter(Boolean).join(" ") ||
    "Property";
  const { isFavorite, toggleFavorite, theme } = useGlobalContext();
  const isItemFavorite = item?.id ? isFavorite(item.id) : false;
  const isDark = theme === "dark";
  const handleFavoritePress = useCallback(
    (event: GestureResponderEvent) => {
      event.stopPropagation?.();
      toggleFavorite(item);
    },
    [toggleFavorite, item]
  );

  const handlePress = useCallback(() => {
    onPress?.(item);
  }, [onPress, item]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="flex-1 w-full mt-4 px-3 py-4 rounded-lg bg-white dark:bg-slate-900 shadow-lg shadow-black-100/70 dark:shadow-black/40 relative"
    >
      <View className="flex flex-row items-center absolute px-2 top-5 right-5 bg-white/90 dark:bg-slate-900/80 p-1 rounded-full z-50">
        <Image
          source={icons.view}
          className="size-2.5"
          style={isDark ? { tintColor: "#CBD5F5" } : undefined}
        />
        <Text className="text-xs font-rubik-bold text-primary-300 ml-0.5">
          {(item.views ?? 0).toLocaleString()}
        </Text>
      </View>

      {imageUri ? (
        <Image source={{ uri: imageUri }} className="w-full h-40 rounded-lg" />
      ) : (
        <Image source={images.iconRE} className="w-full h-40 rounded-lg" />
      )}

      <View className="flex flex-col mt-2">
        <Text className="text-base font-rubik-bold text-black-300 dark:text-slate-100" numberOfLines={1}>
          {title}
        </Text>
        <Text className="text-xs font-rubik text-black-200 dark:text-slate-400" numberOfLines={2}>
          {buildSubtitle(item)}
        </Text>
        <View className="flex flex-row items-center justify-between mt-2">
          <Text className="text-base font-rubik-bold text-primary-300">
            {item.rate}
          </Text>
          <TouchableOpacity onPress={handleFavoritePress} activeOpacity={0.8}>
            <FavoriteIcon
              tintColor={isItemFavorite ? "#F75555" : isDark ? "#E2E8F0" : "#191d31"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

FeaturedCardComponent.displayName = "FeaturedCard";
RegularCardComponent.displayName = "RegularCard";

export const FeaturedCard = memo(FeaturedCardComponent);
export const RegularCard = memo(RegularCardComponent);
