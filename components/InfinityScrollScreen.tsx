import React, { useRef, useEffect } from "react";
import {
    View,
    Image,
    Dimensions,
    FlatList as RNFlatList,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const InfinityScrollGrid = ({ data }: { data: string[] }) => {

    const flatListRef = useRef<RNFlatList<string>>(null);
    const scrollOffset = useRef(0);
    const itemHeight = screenWidth / 3 - 15 + 10;
    const totalHeight = (data.length / 3) * itemHeight;

    const duplicatedData = Array(10).fill(data).flat();

    useEffect(() => {
        const interval = setInterval(() => {
            if (flatListRef.current) {
                scrollOffset.current += 0.0003 * screenWidth;

                if (scrollOffset.current >= totalHeight) {
                    scrollOffset.current = 0;
                    flatListRef.current.scrollToOffset({ offset: 0, animated: false });
                } else {
                    flatListRef.current.scrollToOffset({
                        offset: scrollOffset.current,
                        animated: false,
                    });
                }
            }
        }, 1);

        return () => clearInterval(interval);
    }, [totalHeight]);

    const renderItem = ({ item }: { item: string }) => (
        <View
            style={{
                margin: 5,
                borderRadius: 10,
                overflow: "hidden",
                backgroundColor: "white",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 5,
            }}
        >
            <Image
                source={{ uri: item }}
                style={{
                    width: screenWidth / 3 - 15,
                    height: screenWidth / 3 - 15,
                }}
                resizeMode="cover"
            />
        </View>
    );

    return (
        <View style={{ height: screenHeight * 0.57, backgroundColor: "#f3f3f3" }}>
            <LinearGradient
                colors={['rgba(255,255,255,1)', 'rgba(255,255,255,0)']}
                style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 0,
                    height: 200,
                    zIndex: 1,
                }}
            />
            <LinearGradient
                colors={['rgba(255,255,255,0)', 'rgba(255,255,255,1)']}
                style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: 200,
                    zIndex: 1,
                }}
            />
            <RNFlatList
                ref={flatListRef}
                data={duplicatedData}
                keyExtractor={(item, index) => `${item}-${index}`}
                renderItem={renderItem}
                numColumns={3}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    justifyContent: "center",
                    alignItems: "center",
                }}
            />
        </View>
    );
};

export default InfinityScrollGrid;
