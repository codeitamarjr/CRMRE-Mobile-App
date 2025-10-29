import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import icons from "@/constants/icons";
import Search from "@/components/Search";
import { RegularCard } from "@/components/Cards";
import Filters from "@/components/Filters";
import { useCRMRE, getProperties, Property } from "@/lib/crmre";
import { useCallback, useEffect, useMemo, useState } from "react";
import NoResults from "@/components/NoResults";

export default function Explore() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [aggregatedProperties, setAggregatedProperties] = useState<Property[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const params = useLocalSearchParams<{ query?: string }>();
  const PER_PAGE = 20;

  const allUnitsParams = useMemo(
    () => ({ page, perPage: PER_PAGE }),
    [page]
  );

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

  // Filter locally
  const filteredProperties = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();

    return aggregatedProperties.filter((property) =>
      [
        property.name,
        property.address,
        property.property?.name,
        property.city,
        property.country,
        property.number,
        property.unitCode,
      ]
        .filter(
          (field): field is string =>
            typeof field === "string" && field.trim().length > 0
        )
        .some((field) => field.toLowerCase().includes(searchLower))
    ).filter((property) =>
      selectedFilter !== "All"
        ? property.type?.toLowerCase() === selectedFilter.toLowerCase()
        : true
    );
  }, [aggregatedProperties, searchTerm, selectedFilter]);

  const handleCardPress = useCallback(
    (property: Property) => {
      if (property?.id) {
        router.push(`/properties/${property.id}`);
      } else {
        console.error("Property ID is undefined");
      }
    },
    [router]
  );

  const renderProperty = useCallback(
    ({ item }: { item: Property }) => (
      <RegularCard item={item} onPress={handleCardPress} />
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

  const loadMore = () => {
    if (allProperties || !hasMore) {
      return;
    }

    setPage((prev) => prev + 1);
  };

  return (
    <SafeAreaView className="bg-white h-full">
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
            <ActivityIndicator size="large" className="text-primary-300 mt-5" />
          ) : <NoResults />
        }
        ListHeaderComponent={
          <View className="px-5">
            <View className="flex flex-row items-center justify-between mt-5">

              <TouchableOpacity onPress={() => router.back()} className="flex flex-row size-12">
                <View className="size-11 justify-center items-center bg-primary-200 rounded-full">
                  <Image source={icons.backArrow} className="size-5" />
                </View>
              </TouchableOpacity>

              <Text className="text-base mr-2 text-center font-rubik-medium text-black-300">
                Search for Your Ideal Home
              </Text>

              <Image source={icons.bell} className="size-6" />

            </View>

            <Search onSearch={handleSearch} />

            <View className="mt-5">

              <Filters onFilterChange={handleFilterChange} />

              <Text className="text-xl font-rubik-bold text-black-300 mt-5">
                Found {filteredProperties.length} properties
              </Text>
            </View>
          </View>
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          page > 1 && allProperties ? (
            <ActivityIndicator size="large" className="mt-4" />
          ) : null
        }
      />

    </SafeAreaView>
  );
}
