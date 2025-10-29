import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Platform,
  ActivityIndicator,
  Linking,
  Share,
  Alert,
} from "react-native";
import type { ShareContent } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import icons from "@/constants/icons";
import images from "@/constants/images";
import Comment from "@/components/Comment";

import { useMemo, useCallback } from "react";
import { getProperties, useCRMRE, Property } from "@/lib/crmre";
import { MapCard } from "@/components/Maps";
import Carrousel from "@/components/Carrousel";
import GalleryComponent from "@/components/GalleryComponent";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGlobalContext } from "@/lib/global-provide";

const PropertyDetails = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const windowHeight = Dimensions.get("window").height;
  const insets = useSafeAreaInsets();
  const { toggleFavorite, isFavorite } = useGlobalContext();

  const params = useMemo(() => ({ id: Number(id) }), [id]);

  const { data, loading, error } = useCRMRE<Property, typeof params>({
    fn: getProperties,
    params,
  });

  const property = data && !Array.isArray(data) ? data : null;

  const agent = property?.agent ?? property?.agents?.[0] ?? null;
  const gallery = property?.gallery?.images ?? [];

  const propertyHeading = property
    ? [
        property.type,
        property.number ?? property.unitCode ?? property.property?.code,
      ]
        .filter(Boolean)
        .join(" ")
    : "";

  const handleShare = useCallback(async () => {
    const shareUrl =
      property?.application_url ??
      property?.property?.application_url ??
      "https://realenquiries.com";

    const messageBase = propertyHeading
      ? `Check out ${propertyHeading} on the Real Enquiries app.`
      : "Check out this property on the Real Enquiries app.";
    const message = `${messageBase} ${shareUrl}`;

    const shareContent: ShareContent =
      Platform.OS === "ios"
        ? { url: shareUrl, message }
        : { message };

    try {
      await Share.share(shareContent);
    } catch (error) {
      console.warn("Property share failed", error);
      Alert.alert(
        "Sharing unavailable",
        `We couldn't open the share sheet. You can manually share this link:\n\n${shareUrl}`
      );
    }
  }, [
    property?.application_url,
    property?.property?.application_url,
    propertyHeading,
  ]);

  const isPropertyFavorite = property?.id ? isFavorite(property.id) : false;

  const handleToggleFavorite = useCallback(() => {
    if (property) {
      toggleFavorite(property);
    }
  }, [property, toggleFavorite]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error || !property) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">Failed to load property details.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-blue-500 mt-5">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getImageUri = (
    gallery?: Property["gallery"],
    propertyDetails?: Property["property"]
  ): string => {
    return (
      gallery?.cover ??
      gallery?.images?.[0] ??
      propertyDetails?.gallery?.cover ??
      ""
    );
  };

  const coverUri = getImageUri(property?.gallery, property?.property);

  const propertyDescription =
    property?.description?.trim() ||
    property?.property?.description?.trim() ||
    null;

  const contactSubject = property
    ? `Enquiry from Real Enquiries App - ${
        propertyHeading || property.name || `Unit ${property.id}`
      }`
    : "Enquiry from Real Enquiries App";

  interface ImageWrapperProps {
    uri: string | null;
    fallback: any;
    className: string;
  }

  const ImageWrapper = ({ uri, fallback, className }: ImageWrapperProps) => {
    return uri ? (
      <Image source={{ uri }} className={className} />
    ) : (
      <Image source={fallback} className={className} />
    );
  };

  return (
    <View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32 bg-white"
      >
        <View className="relative w-full" style={{ height: windowHeight / 2 }}>

          {property?.gallery?.images?.length > 0 ? (
            <Carrousel images={property?.gallery?.images} />
          ) : (
            <ImageWrapper
              uri={coverUri ?? ''}
              fallback={images.iconRE}
              className="size-full rounded-2xl"
            />
          )}

          <Image
            source={images.whiteGradient}
            className="absolute top-0 w-full z-40"
          />

          <View
            className="z-50 absolute inset-x-7"
            style={{
              top: Platform.OS === "ios" ? Math.max(insets.top + 20, 70) : insets.top + 16,
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
                <TouchableOpacity
                  onPress={handleToggleFavorite}
                  className={`size-12 justify-center items-center rounded-full ${
                    isPropertyFavorite ? "bg-danger" : "bg-primary-300/70"
                  }`}
                  activeOpacity={0.8}
                >
                  <Image
                    source={icons.heart}
                    className="size-6"
                    style={{ tintColor: "white" }}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleShare}
                  className="size-12 justify-center items-center bg-primary-300/70 rounded-full"
                  activeOpacity={0.8}
                >
                  <Image source={icons.send} className="size-6" style={{ tintColor: "white" }} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View className="px-5 mt-7 flex gap-2">
          <Text className="text-2xl font-rubik-extrabold">
            {[propertyHeading, property?.property?.name || property?.name]
              .filter(Boolean)
              .join(" - ")}
          </Text>

          <View className="flex flex-row items-center gap-3">
            <View className="flex flex-row items-center px-4 py-2 bg-primary-100 rounded-full">
              <Text className="text-xs font-rubik-bold text-primary-300">
                {property?.type}
              </Text>
            </View>

            <View className="flex flex-row items-center gap-2">
              <Image source={icons.star} className="size-5" />
              <Text className="text-black-200 text-sm mt-1 font-rubik-medium">
                5 (9 reviews)
              </Text>
            </View>
          </View>

          <View className="flex flex-row items-center mt-5">
            <View className="flex flex-row items-center justify-center bg-primary-100 rounded-full size-10">
              <Image source={icons.bed} className="size-4" />
            </View>
            <Text className="text-black-300 text-sm font-rubik-medium ml-2">
              {property?.bedrooms ?? "—"} Beds
            </Text>
            <View className="flex flex-row items-center justify-center bg-primary-100 rounded-full size-10 ml-7">
              <Image source={icons.bath} className="size-4" />
            </View>
            <Text className="text-black-300 text-sm font-rubik-medium ml-2">
              {property?.bathrooms ?? "—"} Baths
            </Text>
            <View className="flex flex-row items-center justify-center bg-primary-100 rounded-full size-10 ml-7">
              <Image source={icons.area} className="size-4" />
            </View>
            <Text className="text-black-300 text-sm font-rubik-medium ml-2">
              {property?.area ?? "—"} Sqm
            </Text>
          </View>

          <View className="w-full border-t border-primary-200 pt-7 mt-5">
            <Text className="text-black-300 text-xl font-rubik-bold">
              Agent
            </Text>

            {agent ? (
              <View className="flex flex-row items-center justify-between mt-4">
                <View className="flex flex-row items-center">
                  <View className="inline-flex size-14 items-center justify-center rounded-full bg-gray-500">
                    <Text className="text-xs font-medium text-white">
                      {agent.name
                        ?.split(" ")
                        .map((part) => part.charAt(0))
                        .join("")
                        .slice(0, 2)}
                    </Text>
                  </View>

                  <View className="flex flex-col items-start justify-center ml-3">
                    <Text className="text-lg text-black-300 text-start font-rubik-bold">
                      {agent.name}
                    </Text>
                    {agent.email ? (
                      <TouchableOpacity
                        onPress={() =>
                          Linking.openURL(
                            `mailto:${agent.email}?subject=${encodeURIComponent(
                              contactSubject
                            )}`
                          )
                        }
                      >
                        <Text className="text-sm text-black-200 text-start font-rubik-medium">
                          {agent.email}
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>
                <View className="flex flex-row items-center gap-3">
                  {agent.email ? (
                    <TouchableOpacity
                      onPress={() =>
                        Linking.openURL(
                          `mailto:${agent.email}?subject=${encodeURIComponent(
                            contactSubject
                          )}`
                        )
                      }
                    >
                      <Image source={icons.chat} className="size-7" />
                    </TouchableOpacity>
                  ) : null}
                  {agent.phone ? (
                    <TouchableOpacity
                      onPress={() => Linking.openURL(`tel:${agent.phone}`)}
                    >
                      <Image source={icons.phone} className="size-7" />
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            ) : (
              <Text className="text-black-200 text-sm font-rubik mt-4">
                Agent details are not available for this unit.
              </Text>
            )}
          </View>

          <View className="mt-7">
            <Text className="text-black-300 text-xl font-rubik-bold">
              Overview
            </Text>
            <Text className="text-black-200 text-base font-rubik mt-2">
              {propertyDescription || "No description available"}
            </Text>
          </View>

          <View className="mt-7">
            <Text className="text-black-300 text-xl font-rubik-bold">
              Facilities
            </Text>

            {/* Render facilities */}
            {Array.isArray(property?.facilities) && property.facilities.length > 0 && (
              <View className="flex flex-row flex-wrap items-start justify-start mt-2 gap-5">
                {property.facilities.map((item, index) => {
                  const iconKey = (item.identifier ?? "info") as keyof typeof icons;
                  const iconSource = icons[iconKey] ?? icons.info;

                  return (
                    <View
                      key={`${item.identifier ?? "facility"}-${index}`}
                      className="flex flex-1 flex-col items-center min-w-16 max-w-20"
                    >
                      <View className="size-14 bg-primary-100 rounded-full flex items-center justify-center">
                        <Image source={iconSource} className="size-6" />
                      </View>

                      <Text className="text-black-300 text-sm text-center font-rubik mt-1.5">
                        {item.facility}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}

          </View>

          {gallery.length > 0 && (
            <GalleryComponent gallery={gallery} />
          )}

          <View className="mt-7">
            <Text className="text-black-300 text-xl font-rubik-bold">
              Location
            </Text>
            <View className="flex flex-row items-center justify-start mt-4 gap-2">
              <Image source={icons.location} className="w-7 h-7" />
              <Text className="text-black-200 text-sm font-rubik-medium">
                {property?.address ||
                  [property?.city, property?.country].filter(Boolean).join(", ")}
              </Text>
            </View>

            {property?.coordinates &&
              property.coordinates.latitude !== null &&
              property.coordinates.longitude !== null && (
                <MapCard property={property} />
              )}


          </View>

          {/* {false && property?.reviews.length > 0 && (
            <View className="mt-7">
              <View className="flex flex-row items-center justify-between">
                <View className="flex flex-row items-center">
                  <Image source={icons.star} className="size-6" />
                  <Text className="text-black-300 text-xl font-rubik-bold ml-2">
                    {property?.rating} ({property?.reviews.length} reviews)
                  </Text>
                </View>

                <TouchableOpacity>
                  <Text className="text-primary-300 text-base font-rubik-bold">
                    View All
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="mt-5">
                <Comment item={property?.reviews[0]} />
              </View>
            </View>
          )} */}
        </View>
      </ScrollView>

      <View className="absolute bg-white bottom-0 w-full rounded-t-2xl border-t border-r border-l border-primary-200 p-7">
        <View className="flex flex-row items-center justify-between gap-10">
          <View className="flex flex-col items-start">
            <Text className="text-black-200 text-xs font-rubik-medium">
              Price
            </Text>
            <Text
              numberOfLines={1}
              className="text-primary-300 text-start text-2xl font-rubik-bold"
            >
              {property?.rate}
            </Text>
          </View>

          <TouchableOpacity
            className="flex-1 flex flex-row items-center justify-center bg-primary-300 py-3 rounded-full shadow-md shadow-zinc-400"
            onPress={() => {
              if (property?.application_url) {
                Linking.openURL(property.application_url);
              } else {
                Alert.alert(
                  "Application link unavailable",
                  "We couldn't find a link to apply for this property just yet."
                );
              }
            }}
          >
            <Text className="text-white text-lg text-center font-rubik-bold">
              Apply Now
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default PropertyDetails;
