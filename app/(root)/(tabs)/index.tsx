import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import icons from "@/constants/icons";
import Search from "@/components/Search";
import { FeaturedCard, RegularCard } from "@/components/Cards";
import Filters from "@/components/Filters";
import { useGlobalContext } from "@/lib/global-provide";
import { useCRMRE, getProperties, Property } from "@/lib/crmre";
import NoResults from "@/components/NoResults";
import { useCallback, useEffect, useMemo, useState } from "react";
import FiltersBottomSheet from "@/components/FiltersBottomSheet";
import ThemeToggle from "@/components/ThemeToggle";

export default function Index() {
  const { user, theme } = useGlobalContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [aggregatedProperties, setAggregatedProperties] = useState<Property[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<{
    bedrooms: number[];
    minPrice?: string;
    maxPrice?: string;
  }>({ bedrooms: [] });

  const PER_PAGE = 20;

  const apiFilters = useMemo(() => {
    const result: Record<string, string | number | boolean | undefined> = {};

    if (appliedFilters.bedrooms.length > 0) {
      result.bedrooms = Math.min(...appliedFilters.bedrooms);
    }

    return result;
  }, [appliedFilters]);

  const allUnitsParams = useMemo(
    () => ({
      page,
      perPage: PER_PAGE,
      ...(Object.keys(apiFilters).length ? { filters: apiFilters } : {}),
    }),
    [page, PER_PAGE, apiFilters]
  );
  const featuredUnitsParams = useMemo(
    () => ({ featured: true, perPage: 10 }),
    []
  );

  // Fetch featured properties
  const {
    data: featuredProperties,
    loading: featuredLoading,
  } = useCRMRE({
    fn: getProperties,
    params: featuredUnitsParams,
  });

  // Fetch regular properties
  const {
    data: properties,
    loading: allProperties,
  } = useCRMRE({
    fn: getProperties,
    params: allUnitsParams,
  });

  useEffect(() => {
    if (!Array.isArray(properties)) {
      if (page === 1) {
        setAggregatedProperties([]);
        setHasMore(true);
      }
      return;
    }

    setAggregatedProperties((prev) => {
      if (page === 1) {
        return properties;
      }

      const existingIds = new Set(prev.map((item) => item.id));
      const newItems = properties.filter((item) => !existingIds.has(item.id));
      return [...prev, ...newItems];
    });

    setHasMore(properties.length >= PER_PAGE);
  }, [properties, page, PER_PAGE]);

  useEffect(() => {
    setPage(1);
    setAggregatedProperties([]);
    setHasMore(true);
  }, [apiFilters]);

  // Filter locally
  const filteredProperties = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    const bedroomsFilter = appliedFilters.bedrooms;

    const minPriceValue = appliedFilters.minPrice
      ? Number(appliedFilters.minPrice)
      : NaN;
    const maxPriceValue = appliedFilters.maxPrice
      ? Number(appliedFilters.maxPrice)
      : NaN;

    const normalizedMinPrice = Number.isFinite(minPriceValue)
      ? minPriceValue
      : null;
    const normalizedMaxPrice = Number.isFinite(maxPriceValue)
      ? maxPriceValue
      : null;

    return aggregatedProperties.filter((property) => {
      const searchFields = [
        property.name,
        property.address,
        property.property?.name,
        property.city,
        property.country,
        property.number,
        property.unitCode,
      ].filter(
        (field): field is string =>
          typeof field === "string" && field.trim().length > 0
      );

      const matchesSearch = searchFields.some((field) =>
        field.toLowerCase().includes(searchLower)
      );

      const matchesType =
        selectedFilter === "All" ||
        property.type?.toLowerCase() === selectedFilter.toLowerCase();

      const matchesBedrooms =
        bedroomsFilter.length === 0 ||
        (property.bedrooms !== null &&
          property.bedrooms !== undefined &&
          bedroomsFilter.includes(Number(property.bedrooms)));

      let priceValue: number | null = null;
      if (
        property.rateInfo?.price !== undefined &&
        property.rateInfo?.price !== null
      ) {
        const numericPrice = Number(property.rateInfo.price);
        if (!Number.isNaN(numericPrice)) {
          priceValue = numericPrice;
        }
      }

      const matchesMinPrice =
        normalizedMinPrice === null ||
        (priceValue !== null && priceValue >= normalizedMinPrice);

      const matchesMaxPrice =
        normalizedMaxPrice === null ||
        (priceValue !== null && priceValue <= normalizedMaxPrice);

      const matchesPrice = matchesMinPrice && matchesMaxPrice;

      return matchesSearch && matchesType && matchesBedrooms && matchesPrice;
    });
  }, [aggregatedProperties, searchTerm, selectedFilter, appliedFilters]);

  const handleCardPress = useCallback(
    (property: Property) => {
      if (property?.id) {
        router.push(`/properties/${property.id}`);
      } else {
        console.error("Property ID is undefined");
      }
    },
    []
  );

  const renderProperty = useCallback(
    ({ item }: { item: Property }) => (
      <RegularCard item={item} onPress={handleCardPress} />
    ),
    [handleCardPress]
  );

  const renderFeatured = useCallback(
    ({ item }: { item: Property }) => (
      <FeaturedCard item={item} onPress={handleCardPress} />
    ),
    [handleCardPress]
  );

  const handleSearch = (query: string) => {
    setSearchTerm(query);
  };

  // Callback function to update the selected filter
  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
  };

  const handleFilterPress = useCallback(() => {
    setFiltersVisible(true);
  }, []);

  const handleApplyFilters = useCallback(
    (filters: { bedrooms: number[]; minPrice?: string; maxPrice?: string }) => {
      setFiltersVisible(false);
      setAppliedFilters(filters);
      setPage(1);
    },
    []
  );

  const handleResetFilters = useCallback(() => {
    setAppliedFilters({ bedrooms: [] });
    setPage(1);
  }, []);

  const loadMore = () => {
    if (allProperties || !hasMore) {
      return;
    }

    setPage((prev) => prev + 1);
  };

  const greeting = (() => {
    const hours = new Date().getHours();
    if (hours < 12 && hours >= 6) return "Good morning";
    if (hours < 18 && hours >= 12) return "Good afternoon";
    return "Good evening";
  })();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-white dark:bg-slate-950 h-full"
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <FlatList
        data={filteredProperties}
        renderItem={renderProperty}
        keyExtractor={(item) => `property-${item.id}`}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews
        numColumns={2}
        contentContainerClassName="pb-32"
        columnWrapperClassName="flex gap-5 px-5"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          allProperties ? (
            <ActivityIndicator
              size="large"
              color={theme === "dark" ? "#93C5FD" : "#0061FF"}
              style={{ marginTop: 20 }}
            />
          ) : <NoResults />
        }
        ListHeaderComponent={
          <View className="px-5">
            <View className="flex flex-row items-center justify-between mt-5">
              <View className="flex flex-row items-center">
                <Image source={{ uri: user?.avatar }} className="size-12 rounded-full" />
                <View className="flex flex-col items-start ml-2 justify-center">
                  <Text className="text-xs font-rubik text-black-100 dark:text-slate-400">
                    {greeting},
                  </Text>
                  <Text className="text-base font-rubik-medium text-black-300 dark:text-slate-100">
                    {user?.name}
                  </Text>
                </View>
              </View>
              <View className="flex flex-row items-center gap-3">
                <ThemeToggle />
                <Image
                  source={icons.bell}
                  className="size-6"
                  style={theme === "dark" ? { tintColor: "#E2E8F0" } : undefined}
                />
              </View>
            </View>

            <Search onSearch={handleSearch} onFilterPress={handleFilterPress} />

            {/* Conditionally render the featured section */}
            {!searchTerm && (
              <View className="mt-5">
                <View className="flex flex-row items-center justify-between">
                  <Text className="text-xl font-rubik-bold text-black-300 dark:text-slate-100">
                    Featured
                  </Text>
                  <TouchableOpacity>
                    <Text className="text-base font-rubik-bold text-primary-300">
                      See all
                    </Text>
                  </TouchableOpacity>
                </View>

                {featuredLoading ? (
                  <ActivityIndicator
                    size="large"
                    color={theme === "dark" ? "#93C5FD" : "#0061FF"}
                  />
                ) : !Array.isArray(featuredProperties) || featuredProperties.length === 0 ? (
                  <NoResults />
                ) : (
                  <FlatList
                    data={featuredProperties}
                    renderItem={renderFeatured}
                    keyExtractor={(item) => `featured-${item.id}`}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    bounces={false}
                    contentContainerClassName="flex gap-5 mt-5"
                    removeClippedSubviews
                  />
                )}
              </View>
            )}

            <View className="mt-5 flex flex-row items-center justify-between">
              <Text className="text-xl font-rubik-bold text-black-300 dark:text-slate-100">
                Our Recommendation
              </Text>
              <TouchableOpacity>
                <Text onPress={() => setSelectedFilter('All')}
                className="text-base font-rubik-bold text-primary-300">
                  See all
                </Text>
              </TouchableOpacity>
            </View>

            <Filters onFilterChange={handleFilterChange} />

          </View>
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          page > 1 && allProperties ? (
            <ActivityIndicator
              size="large"
              color={theme === "dark" ? "#93C5FD" : "#0061FF"}
              style={{ marginTop: 16 }}
            />
          ) : null
        }
      />

      <FiltersBottomSheet
        visible={filtersVisible}
        onClose={() => setFiltersVisible(false)}
        filters={appliedFilters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
    </View>
  );
}
