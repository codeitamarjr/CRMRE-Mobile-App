import React, { useState } from "react";
import { FlatList, Image, View, Dimensions } from "react-native";

const Carrousel = ({ images }: { images: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const screenWidth = Dimensions.get("window").width;

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    setCurrentIndex(index);
  };

  return (
    <View className="relative">
      <FlatList
        data={images}
        keyExtractor={(item, index) => `${item}-${index}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        renderItem={({ item }) => (
          <View style={{ width: screenWidth, height: "100%" }}>
            <Image
              source={{ uri: item }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
        )}
      />
      <View className="absolute bottom-2 w-full flex-row justify-center items-center">
        {images.map((_, index) => (
          <View
            key={index}
            className={`w-2.5 h-2.5 rounded-full mx-1 ${index === currentIndex ? "bg-blue-500" : "bg-white"}`}
          />
        ))}
      </View>
    </View>
  );
};

export default Carrousel;
