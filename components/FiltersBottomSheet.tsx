import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ScrollView,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface FiltersState {
  bedrooms: number[];
  minPrice?: string;
  maxPrice?: string;
}

interface FiltersBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  filters: FiltersState;
  onApply: (filters: FiltersState) => void;
  onReset: () => void;
}

const bedroomOptions = [1, 2, 3, 4, 5];

const FiltersBottomSheet: React.FC<FiltersBottomSheetProps> = ({
  visible,
  onClose,
  filters,
  onApply,
  onReset,
}) => {
  const [selectedBedrooms, setSelectedBedrooms] = useState<number[]>([]);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      setSelectedBedrooms(filters.bedrooms ?? []);
      setMinPrice(filters.minPrice ?? "");
      setMaxPrice(filters.maxPrice ?? "");
    }
  }, [visible, filters]);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const handleKeyboardShow = (event: any) => {
      setKeyboardHeight(event.endCoordinates?.height ?? 0);
    };

    const handleKeyboardHide = () => {
      setKeyboardHeight(0);
    };

    const showSubscription = Keyboard.addListener(showEvent, handleKeyboardShow);
    const hideSubscription = Keyboard.addListener(hideEvent, handleKeyboardHide);

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const toggleBedroom = (value: number) => {
    setSelectedBedrooms((prev) => {
      if (prev.includes(value)) {
        return prev.filter((item) => item !== value);
      }
      return [...prev, value].sort((a, b) => a - b);
    });
  };

  const handleApply = () => {
    onApply({
      bedrooms: selectedBedrooms,
      minPrice: minPrice.trim() || undefined,
      maxPrice: maxPrice.trim() || undefined,
    });
  };

  const hasActiveFilters = useMemo(() => {
    return (
      selectedBedrooms.length > 0 ||
      minPrice.trim().length > 0 ||
      maxPrice.trim().length > 0
    );
  }, [selectedBedrooms, minPrice, maxPrice]);

  const handleReset = () => {
    setSelectedBedrooms([]);
    setMinPrice("");
    setMaxPrice("");
    onReset();
  };

  const keyboardInset =
    Platform.OS === "ios"
      ? Math.max(0, keyboardHeight - (insets.bottom || 0))
      : keyboardHeight;

  const sheetPaddingBottom = (insets.bottom || 0) + keyboardInset;

  const sheetContent = (
    <>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>
      <View style={[styles.sheet, { paddingBottom: sheetPaddingBottom }]}>
        <View style={styles.sheetInner}>
          <View className="flex flex-row items-center justify-between">
            <Text className="text-lg font-rubik-bold text-black-300">Filters</Text>
            {hasActiveFilters && (
              <TouchableOpacity onPress={handleReset}>
                <Text className="text-primary-300 text-base font-rubik-medium">
                  Reset
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="pt-4 pb-6"
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            <View className="mt-2">
              <Text className="text-base font-rubik-medium text-black-300">
                Bedrooms
              </Text>
              <View className="flex flex-row flex-wrap gap-2 mt-3">
                {bedroomOptions.map((option) => {
                  const selected = selectedBedrooms.includes(option);
                  return (
                    <TouchableOpacity
                      key={option}
                      onPress={() => toggleBedroom(option)}
                      className={`px-4 py-2 rounded-full border ${
                        selected
                          ? "bg-primary-300 border-primary-300"
                          : "border-primary-200"
                      }`}
                    >
                      <Text
                        className={`text-sm font-rubik-medium ${
                          selected ? "text-white" : "text-black-300"
                        }`}
                      >
                        {option} Beds
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View className="mt-6">
              <Text className="text-base font-rubik-medium text-black-300">
                Monthly Price Range (€)
              </Text>
              <View className="flex flex-row items-center justify-between mt-3 gap-4">
                <View className="flex-1">
                  <Text className="text-xs font-rubik text-black-200 mb-1">Min</Text>
                  <TextInput
                    className="border border-primary-200 rounded-lg px-3 py-2 text-sm font-rubik text-black-300"
                    placeholder="0"
                    keyboardType="numeric"
                    value={minPrice}
                    onChangeText={setMinPrice}
                    returnKeyType="done"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-rubik text-black-200 mb-1">Max</Text>
                  <TextInput
                    className="border border-primary-200 rounded-lg px-3 py-2 text-sm font-rubik text-black-300"
                    placeholder="Any"
                    keyboardType="numeric"
                    value={maxPrice}
                    onChangeText={setMaxPrice}
                    returnKeyType="done"
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity
            onPress={handleApply}
            className="bg-primary-300 py-3 rounded-full shadow-md shadow-zinc-300"
          >
            <Text className="text-white text-center text-base font-rubik-bold">
              Apply Filters
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.container}>{sheetContent}</View>
    </Modal>
  );
};

export default FiltersBottomSheet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "transparent",
  },
  sheet: {
    backgroundColor: "rgba(0, 97, 255, 0.08)",
    paddingTop: 2,
    paddingHorizontal: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopStartRadius: 28,
    borderTopEndRadius: 28,
    overflow: "hidden",
  },
  sheetInner: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderTopStartRadius: 22,
    borderTopEndRadius: 22,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    marginHorizontal: 2,
    marginTop: 2,
    overflow: "hidden",
  },
});
