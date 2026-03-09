import {
  Image,
  Share,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import RenderHTML from "react-native-render-html";

import icons from "@/constants/icons";
import images from "@/constants/images";

import { useApiQuery } from "@/lib/useApiQuery";
import { getPropertyById } from "@/lib/api";
import { useGlobalContext } from "@/lib/global-provide";
import { MapCard } from "@/components/Maps";
import Carrousel from "@/components/Carrousel";
import GalleryComponent from "@/components/GalleryComponent";
import FacilityIcon from "@/components/FacilityIcon";

const fallbackImage = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&auto=format&fit=crop";

const Property = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { isFavorite, toggleFavorite, isDarkTheme } = useGlobalContext();

  const windowHeight = Dimensions.get("window").height;
  const contentWidth = Dimensions.get("window").width - 40;

  const { data: property } = useApiQuery({
    fn: getPropertyById,
    params: {
      id: id ?? "",
    },
  });

  const coverImage = property?.gallery?.cover || property?.property?.gallery?.cover || fallbackImage;
  const locationLabel = [
    property?.location?.address_line_1,
    property?.location?.city,
    property?.location?.country,
  ]
    .filter(Boolean)
    .join(", ");
  const areaLabel = property?.area_sq_m ? `${property.area_sq_m} m2` : "N/A";
  const priceLabel = property?.rate?.formatted || "Price on request";
  const facilityItems = property?.property?.facilities ?? [];
  const galleryImages = [
    ...(property?.gallery?.cover ? [property.gallery.cover] : []),
    ...(property?.gallery?.images ?? []),
  ];
  const primaryAgent = property?.property?.client?.agents?.[0];
  const agentInitials = (primaryAgent?.name ?? "A")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
  const propertyLabel = property?.name || property?.property?.name || "Unit";
  const shareUrl = property?.links?.self;
  const hasCoordinates = Boolean(
    property?.property?.coordinates?.latitude &&
    property?.property?.coordinates?.longitude
  );
  const pageBackground = isDarkTheme ? "#111827" : "#FFFFFF";
  const titleColor = isDarkTheme ? "#F3F4F6" : "#191D31";
  const textColor = isDarkTheme ? "#D1D5DB" : "#666876";
  const borderColor = isDarkTheme ? "#374151" : "#DBEAFE";
  const panelBackground = isDarkTheme ? "#111827" : "#FFFFFF";

  const handleShare = async () => {
    try {
      await Share.share({
        message: shareUrl
          ? `Check out this listing: ${propertyLabel}\n${shareUrl}`
          : `Check out this listing: ${propertyLabel}`,
      });
    } catch (error) {
      console.log("Failed to share listing", error);
    }
  };

  return (
    <View style={{ backgroundColor: pageBackground }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32"
        contentContainerStyle={{ backgroundColor: pageBackground }}
      >
        <View className="relative w-full" style={{ height: windowHeight / 2 }}>
          {galleryImages.length > 0 ? (
            <Carrousel images={galleryImages} />
          ) : (
            <Image
              source={{ uri: coverImage }}
              className="size-full"
              resizeMode="cover"
            />
          )}
          <Image
            source={images.whiteGradient}
            className="absolute top-0 w-full z-40"
          />

          <View
            className="z-50 absolute inset-x-7"
            style={{
              top: Platform.OS === "ios" ? 70 : 20,
            }}
          >
            <View className="flex flex-row items-center w-full justify-between">
              <TouchableOpacity
                onPress={() => router.back()}
                className="flex flex-row items-center justify-center"
              >
                <View className="size-11 justify-center items-center bg-primary-300/70 rounded-full">
                  <Image source={icons.backArrow} className="size-5" style={{ tintColor: "white" }} />
                </View>
              </TouchableOpacity>

                <View className="flex flex-row items-center gap-3">
                <TouchableOpacity onPress={() => property && toggleFavorite(property)}>
                  <Image
                    source={icons.heart}
                    className="size-7"
                    tintColor={property && isFavorite(property.id) ? "#EF4444" : "#FFFFFF"}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleShare}>
                  <Image source={icons.send} className="size-7" tintColor="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View className="px-5 mt-7 flex gap-2">
          <Text className="text-2xl font-rubik-extrabold" style={{ color: titleColor }}>
            {property?.name || property?.property?.name || "Unit"}
          </Text>

          <View className="flex flex-row items-center gap-3">
            <View className="flex flex-row items-center px-4 py-2 bg-primary-100 rounded-full">
              <Text className="text-xs font-rubik-bold text-primary-300">
                {property?.type || "Unit"}
              </Text>
            </View>

            <View className="flex flex-row items-center gap-2">
              <Image source={icons.star} className="size-5" />
              <Text className="text-sm mt-1 font-rubik-medium" style={{ color: textColor }}>
                Available
              </Text>
            </View>
          </View>

          <View className="flex flex-row items-center mt-5">
            <View className="flex flex-row items-center justify-center bg-primary-100 rounded-full size-10">
              <Image source={icons.bed} className="size-4" />
            </View>
            <Text className="text-sm font-rubik-medium ml-2" style={{ color: titleColor }}>
              {property?.bedrooms ?? "N/A"} Beds
            </Text>
            <View className="flex flex-row items-center justify-center bg-primary-100 rounded-full size-10 ml-7">
              <Image source={icons.bath} className="size-4" />
            </View>
            <Text className="text-sm font-rubik-medium ml-2" style={{ color: titleColor }}>
              {property?.bathrooms ?? "N/A"} Baths
            </Text>
            <View className="flex flex-row items-center justify-center bg-primary-100 rounded-full size-10 ml-7">
              <Image source={icons.area} className="size-4" />
            </View>
            <Text className="text-sm font-rubik-medium ml-2" style={{ color: titleColor }}>
              {areaLabel}
            </Text>
          </View>

          {primaryAgent && (
            <View className="w-full border-t pt-7 mt-5" style={{ borderColor }}>
              <Text className="text-xl font-rubik-bold" style={{ color: titleColor }}>
                Agent
              </Text>

              <View className="flex flex-row items-center justify-between mt-4">
                <View className="flex flex-row items-center">
                  <View
                    className="size-14 rounded-full items-center justify-center"
                    style={{ backgroundColor: isDarkTheme ? "#1E3A8A" : "#DBEAFE" }}
                  >
                    <Text
                      className="font-rubik-bold"
                      style={{ color: isDarkTheme ? "#F3F4F6" : "#1E3A8A", fontSize: 20 }}
                    >
                      {agentInitials}
                    </Text>
                  </View>

                  <View className="flex flex-col items-start justify-center ml-3">
                    <Text className="text-lg text-start font-rubik-bold" style={{ color: titleColor }}>
                      {primaryAgent.name}
                    </Text>
                    <Text className="text-sm text-start font-rubik-medium" style={{ color: textColor }}>
                      {primaryAgent.email || ""}
                    </Text>
                  </View>
                </View>

                <View className="flex flex-row items-center gap-3">
                  <Image source={icons.chat} className="size-7" />
                  <Image source={icons.phone} className="size-7" />
                </View>
              </View>
            </View>
          )}

          <View className="mt-7">
            <Text className="text-xl font-rubik-bold" style={{ color: titleColor }}>
              Overview
            </Text>
            {property?.property?.description ? (
              <View className="mt-2">
                <RenderHTML
                  contentWidth={contentWidth}
                  source={{ html: property.property.description }}
                  baseStyle={{ color: textColor, fontSize: 16, lineHeight: 22 }}
                />
              </View>
            ) : (
              <Text className="text-base font-rubik mt-2" style={{ color: textColor }}>
                No description available.
              </Text>
            )}
          </View>

          {facilityItems.length > 0 && (
            <View className="mt-7">
              <Text className="text-xl font-rubik-bold" style={{ color: titleColor }}>
                Facilities
              </Text>

              <View className="flex flex-row flex-wrap items-start justify-start mt-2 gap-5">
                {facilityItems.map((item) => (
                  <View
                    key={item.identifier}
                    className="flex flex-1 flex-col items-center min-w-16 max-w-20"
                  >
                    <View className="size-14 bg-primary-100 rounded-full flex items-center justify-center">
                      <FacilityIcon identifier={item.identifier} />
                    </View>

                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      className="text-sm text-center font-rubik mt-1.5"
                      style={{ color: titleColor }}
                    >
                      {item.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {galleryImages.length > 0 && <GalleryComponent gallery={galleryImages} />}

          <View className="mt-7">
            <Text className="text-xl font-rubik-bold" style={{ color: titleColor }}>
              Location
            </Text>
            <View className="flex flex-row items-center justify-start mt-4 gap-2">
              <Image source={icons.location} className="w-7 h-7" />
              <Text className="text-sm font-rubik-medium" style={{ color: textColor }}>
                {locationLabel || "Location unavailable"}
              </Text>
            </View>

            <MapCard unit={property} />

            {!hasCoordinates ? (
              <Image
                source={images.map}
                className="h-52 w-full mt-5 rounded-xl"
              />
            ) : null}
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-0 w-full rounded-t-2xl border-t border-r border-l p-7" style={{ backgroundColor: panelBackground, borderColor }}>
        <View className="flex flex-row items-center justify-between gap-10">
          <View className="flex flex-col items-start">
            <Text className="text-xs font-rubik-medium" style={{ color: textColor }}>
              Price
            </Text>
            <Text
              numberOfLines={1}
              className="text-primary-300 text-start text-2xl font-rubik-bold"
            >
              {priceLabel}
            </Text>
          </View>

          <TouchableOpacity className="flex-1 flex flex-row items-center justify-center bg-primary-300 py-3 rounded-full shadow-md shadow-zinc-400">
            <Text className="text-white text-lg text-center font-rubik-bold">
              Apply Now
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Property;
