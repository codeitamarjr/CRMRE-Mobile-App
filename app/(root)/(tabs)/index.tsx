import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import icons from "@/constants/icons";
import Search from "@/components/Search";
import { FeaturedCard, RegularCard } from "@/components/Cards";
import Filters from "@/components/Filters";
import { useGlobalContext } from "@/lib/global-provide";
import { useApiQuery } from "@/lib/useApiQuery";
import { getLatestProperties, getProperties } from "@/lib/api";
import { useEffect, useMemo, useRef, useState } from "react";
import NoResults from "@/components/NoResults";
import FiltersBottomSheet from "@/components/FiltersBottomSheet";
import { MarketplaceUnit } from "@/types/marketplace";

const PER_PAGE = 12;
const HOME_CACHE_TTL_MS = 5 * 60 * 1000;

type HomeViewCache = {
  key: string;
  page: number;
  units: MarketplaceUnit[];
  hasMore: boolean;
  latestProperties: MarketplaceUnit[] | null;
  cachedAt: number;
};

let homeViewCache: HomeViewCache | null = null;

export default function Index() {
  const { user, isFavorite, toggleFavorite, isDarkTheme } = useGlobalContext();
  const params = useLocalSearchParams<{
    query?: string;
    filter?: string;
    bedrooms?: string;
    bathrooms?: string;
    vacant?: string;
    minPrice?: string;
    maxPrice?: string;
  }>();
  const [showFilters, setShowFilters] = useState(false);

  const parsedFilters = useMemo(() => ({
    bedrooms: params.bedrooms ? Number(params.bedrooms) : undefined,
    bathrooms: params.bathrooms ? Number(params.bathrooms) : undefined,
    vacant: params.vacant === "true",
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
  }), [params.bedrooms, params.bathrooms, params.vacant, params.minPrice, params.maxPrice]);

  const homeQueryKey = useMemo(() => JSON.stringify({
    filter: params.filter ?? "All",
    query: params.query ?? "",
    bedrooms: parsedFilters.bedrooms,
    bathrooms: parsedFilters.bathrooms,
    vacant: parsedFilters.vacant ? true : undefined,
    minPrice: parsedFilters.minPrice,
    maxPrice: parsedFilters.maxPrice,
  }), [params.filter, params.query, parsedFilters]);

  const hasValidHomeCache = Boolean(
    homeViewCache &&
    homeViewCache.key === homeQueryKey &&
    Date.now() - homeViewCache.cachedAt < HOME_CACHE_TTL_MS
  );

  const [page, setPage] = useState<number>(() => (hasValidHomeCache && homeViewCache ? homeViewCache.page : 1));
  const [units, setUnits] = useState<MarketplaceUnit[]>(() => (hasValidHomeCache && homeViewCache ? homeViewCache.units : []));
  const [hasMore, setHasMore] = useState<boolean>(() => (hasValidHomeCache && homeViewCache ? homeViewCache.hasMore : true));
  const skipFirstRefetch = useRef(hasValidHomeCache);
  const skipFirstReset = useRef(hasValidHomeCache);

  const { data: latestProperties, loading: latestPropertiesLoading } = useApiQuery({
    fn: getLatestProperties,
    params: {},
    initialData: hasValidHomeCache && homeViewCache ? homeViewCache.latestProperties : undefined,
  });

  const requestParams = useMemo(() => ({
    filter: params.filter ?? "All",
    query: params.query ?? "",
    page,
    limit: PER_PAGE,
    bedrooms: parsedFilters.bedrooms,
    bathrooms: parsedFilters.bathrooms,
    vacant: parsedFilters.vacant ? true : undefined,
    minPrice: parsedFilters.minPrice,
    maxPrice: parsedFilters.maxPrice,
  }), [params.filter, params.query, page, parsedFilters]);

  const { data: properties, loading, refetch } = useApiQuery({
    fn: getProperties,
    params: requestParams,
    skip: true,
  })

  const handleCardPress = (id: string) => router.push(`/properties/${id}`);

  useEffect(() => {
    if (skipFirstRefetch.current) {
      skipFirstRefetch.current = false;
      return;
    }

    refetch(requestParams);
  }, [requestParams]);

  useEffect(() => {
    if (!Array.isArray(properties)) {
      return;
    }

    if (page === 1) {
      setUnits(properties);
    } else {
      setUnits((previous) => {
        const existing = new Set(previous.map((item) => item.id));
        const next = properties.filter((item) => !existing.has(item.id));
        return [...previous, ...next];
      });
    }

    setHasMore(properties.length >= PER_PAGE);
  }, [properties, page]);

  useEffect(() => {
    if (skipFirstReset.current) {
      skipFirstReset.current = false;
      return;
    }

    setPage(1);
    setUnits([]);
    setHasMore(true);
    skipFirstRefetch.current = false;
  }, [params.query, params.filter, parsedFilters]);

  useEffect(() => {
    homeViewCache = {
      key: homeQueryKey,
      page,
      units,
      hasMore,
      latestProperties: latestProperties ?? null,
      cachedAt: Date.now(),
    };
  }, [homeQueryKey, page, units, hasMore, latestProperties]);

  const loadMore = () => {
    if (loading || !hasMore) {
      return;
    }

    setPage((previous) => previous + 1);
  };

  const date = new Date();
  const hours = date.getHours();
  const greeting = hours < 12 && hours >= 6 ? "Good morning" : hours < 18 && hours >= 12 ? "Good afternoon" : "Good evening";
  const screenBackground = isDarkTheme ? "#111827" : "#FFFFFF";
  const titleColor = isDarkTheme ? "#F3F4F6" : "#191D31";
  const subtitleColor = isDarkTheme ? "#9CA3AF" : "#8C8E98";

  return (
    <SafeAreaView className="h-full" style={{ backgroundColor: screenBackground }}>
      <FlatList
        style={{ backgroundColor: screenBackground }}
        data={units}
        renderItem={({ item }) => (
          <RegularCard
            item={item}
            onPress={() => handleCardPress(String(item.id))}
            isFavorite={isFavorite(item.id)}
            onToggleFavorite={() => toggleFavorite(item)}
          />
        )}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        contentContainerClassName="pb-32"
        columnWrapperClassName="flex gap-5 px-5"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" className="text-primary-300 mt-5" />
          ) : <NoResults />
        }
        ListHeaderComponent={
          <View className="px-5" style={{ backgroundColor: screenBackground }}>
            <View className="flex flex-row items-center justify-between mt-5">

              <View className="flex flex-row items-center">
                <Image source={{ uri: user?.avatar }} className="size-12 rounded-full" />
                <View className="flex flex-col items-start ml-2 justify-center">
                  <Text className="text-xs font-rubik" style={{ color: subtitleColor }}>{greeting},</Text>
                  <Text className="text-base font-rubik-medium" style={{ color: titleColor }}>{user?.name}</Text>
                </View>
              </View>

              <Image source={icons.bell} className="size-6" tintColor={titleColor} />

            </View>

            <Search onFilterPress={() => setShowFilters(true)} />

            <View className="my-5">
              <View className="flex flex-row items-center justify-between">
                <Text className="text-xl font-rubik-bold" style={{ color: titleColor }}>
                  Featured
                </Text>
                <TouchableOpacity>
                  <Text className="text-base font-rubik-bold text-primary-300">
                    See all
                  </Text>
                </TouchableOpacity>
              </View>

              {latestPropertiesLoading ?
                <ActivityIndicator size="large" className="text-primary-300" /> :
                !latestProperties || latestProperties.length === 0 ? <NoResults /> : (

                  <FlatList
                    data={latestProperties}
                    renderItem={({ item }) => (
                      <FeaturedCard
                        item={item}
                        onPress={() => handleCardPress(String(item.id))}
                        isFavorite={isFavorite(item.id)}
                        onToggleFavorite={() => toggleFavorite(item)}
                      />
                    )}
                    keyExtractor={(item) => String(item.id)}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    bounces={false}
                    contentContainerClassName="flex gap-5 mt-5"
                  />

                )}
            </View>

            <View className="flex flex-row items-center justify-between">
              <Text className="text-xl font-rubik-bold" style={{ color: titleColor }}>
                Our Recommendation
              </Text>
              <TouchableOpacity>
                <Text className="text-base font-rubik-bold text-primary-300">
                  See all
                </Text>
              </TouchableOpacity>
            </View>

            <Filters />

          </View>
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          page > 1 && loading ? (
            <ActivityIndicator size="large" className="text-primary-300 mt-4" />
          ) : null
        }
      />

      <FiltersBottomSheet
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        filters={parsedFilters}
        onApply={(filters) => {
          setShowFilters(false);
          router.setParams({
            bedrooms: filters.bedrooms ? String(filters.bedrooms) : undefined,
            bathrooms: filters.bathrooms ? String(filters.bathrooms) : undefined,
            vacant: filters.vacant ? "true" : undefined,
            minPrice: filters.minPrice ? String(filters.minPrice) : undefined,
            maxPrice: filters.maxPrice ? String(filters.maxPrice) : undefined,
          });
        }}
        onReset={() => {
          setShowFilters(false);
          router.setParams({
            bedrooms: undefined,
            bathrooms: undefined,
            vacant: undefined,
            minPrice: undefined,
            maxPrice: undefined,
          });
        }}
      />

    </SafeAreaView>
  );
}
