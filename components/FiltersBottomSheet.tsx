import React, { useEffect, useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { useGlobalContext } from "@/lib/global-provide";

type AdvancedFilters = {
  bedrooms?: number;
  bathrooms?: number;
  vacant?: boolean;
  minPrice?: number;
  maxPrice?: number;
};

interface FiltersBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  filters: AdvancedFilters;
  onApply: (filters: AdvancedFilters) => void;
  onReset: () => void;
}

const numericValue = (value: string): number | undefined => {
  if (!value.trim()) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
};

const FiltersBottomSheet = ({ visible, onClose, filters, onApply, onReset }: FiltersBottomSheetProps) => {
  const { isDarkTheme } = useGlobalContext();
  const [bedrooms, setBedrooms] = useState<string>("");
  const [bathrooms, setBathrooms] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [vacant, setVacant] = useState<boolean>(false);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setBedrooms(filters.bedrooms ? String(filters.bedrooms) : "");
    setBathrooms(filters.bathrooms ? String(filters.bathrooms) : "");
    setMinPrice(filters.minPrice ? String(filters.minPrice) : "");
    setMaxPrice(filters.maxPrice ? String(filters.maxPrice) : "");
    setVacant(Boolean(filters.vacant));
  }, [visible, filters]);

  const applyFilters = () => {
    onApply({
      bedrooms: numericValue(bedrooms),
      bathrooms: numericValue(bathrooms),
      minPrice: numericValue(minPrice),
      maxPrice: numericValue(maxPrice),
      vacant,
    });
  };

  const sheetBackground = isDarkTheme ? "#111827" : "#FFFFFF";
  const titleColor = isDarkTheme ? "#F3F4F6" : "#191D31";
  const labelColor = isDarkTheme ? "#D1D5DB" : "#666876";
  const inputBackground = isDarkTheme ? "#1F2937" : "#FFFFFF";
  const inputBorder = isDarkTheme ? "#374151" : "#DBEAFE";
  const inputText = isDarkTheme ? "#F3F4F6" : "#191D31";
  const placeholderColor = isDarkTheme ? "#9CA3AF" : "#8C8E98";

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/30 justify-end">
          <TouchableWithoutFeedback onPress={() => undefined}>
            <View className="rounded-t-3xl px-5 pt-6 pb-8" style={{ backgroundColor: sheetBackground }}>
              <View className="flex flex-row items-center justify-between">
                <Text className="text-lg font-rubik-bold" style={{ color: titleColor }}>Advanced Filters</Text>
                <TouchableOpacity onPress={onReset}>
                  <Text className="text-primary-300 font-rubik-medium">Reset</Text>
                </TouchableOpacity>
              </View>

              <View className="mt-5">
                <Text className="text-sm font-rubik mb-2" style={{ color: labelColor }}>Min Bedrooms</Text>
                <TextInput
                  value={bedrooms}
                  onChangeText={setBedrooms}
                  keyboardType="numeric"
                  placeholder="Any"
                  placeholderTextColor={placeholderColor}
                  className="border rounded-lg px-3 py-2 font-rubik"
                  style={{ borderColor: inputBorder, backgroundColor: inputBackground, color: inputText }}
                />
              </View>

              <View className="mt-4">
                <Text className="text-sm font-rubik mb-2" style={{ color: labelColor }}>Min Bathrooms</Text>
                <TextInput
                  value={bathrooms}
                  onChangeText={setBathrooms}
                  keyboardType="numeric"
                  placeholder="Any"
                  placeholderTextColor={placeholderColor}
                  className="border rounded-lg px-3 py-2 font-rubik"
                  style={{ borderColor: inputBorder, backgroundColor: inputBackground, color: inputText }}
                />
              </View>

              <View className="mt-4">
                <Text className="text-sm font-rubik mb-2" style={{ color: labelColor }}>Monthly Price Range</Text>
                <View className="flex flex-row gap-3">
                  <TextInput
                    value={minPrice}
                    onChangeText={setMinPrice}
                    keyboardType="numeric"
                    placeholder="Min"
                    placeholderTextColor={placeholderColor}
                    className="flex-1 border rounded-lg px-3 py-2 font-rubik"
                    style={{ borderColor: inputBorder, backgroundColor: inputBackground, color: inputText }}
                  />
                  <TextInput
                    value={maxPrice}
                    onChangeText={setMaxPrice}
                    keyboardType="numeric"
                    placeholder="Max"
                    placeholderTextColor={placeholderColor}
                    className="flex-1 border rounded-lg px-3 py-2 font-rubik"
                    style={{ borderColor: inputBorder, backgroundColor: inputBackground, color: inputText }}
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setVacant((previous) => !previous)}
                className="mt-5 rounded-lg border px-3 py-3"
                style={{
                  borderColor: vacant ? "#0061FF" : inputBorder,
                  backgroundColor: vacant ? (isDarkTheme ? "#1E3A8A" : "#EFF6FF") : inputBackground,
                }}
              >
                <Text className="font-rubik-medium" style={{ color: vacant ? "#2563EB" : inputText }}>
                  {vacant ? "Vacant only: ON" : "Vacant only: OFF"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={applyFilters} className="mt-6 bg-primary-300 rounded-full py-3">
                <Text className="text-center text-white font-rubik-bold text-base">Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default FiltersBottomSheet;
