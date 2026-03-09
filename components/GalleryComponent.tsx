import React, { useState } from "react";
import {
    FlatList,
    Image,
    Modal,
    TouchableOpacity,
    View,
    Text,
    Dimensions,
    TouchableWithoutFeedback,
} from "react-native";

const GalleryComponent = ({ gallery }: { gallery: string[] }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const screenWidth = Dimensions.get("window").width;
    const screenHeight = Dimensions.get("window").height;

    const handleImagePress = (image: string) => {
        setSelectedImage(image);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setSelectedImage(null);
    };

    return (
        <View className="mt-7">
            <Text className="text-black-300 text-xl font-rubik-bold">Gallery</Text>
            <FlatList
                contentContainerStyle={{ paddingRight: 20 }}
                data={gallery}
                keyExtractor={(_, index) => index.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleImagePress(item)}>
                        <Image
                            source={{ uri: item }}
                            className="size-40 rounded-xl"
                        />
                    </TouchableOpacity>
                )}
                contentContainerClassName="flex gap-4 mt-3"
            />

            {modalVisible && selectedImage && (
                <Modal visible={modalVisible} transparent={true} animationType="fade">
                    <TouchableWithoutFeedback onPress={closeModal}>
                        <View className="flex-1 justify-center items-center bg-black/70">
                            <Image
                                source={{ uri: selectedImage }}
                                style={{
                                    width: screenWidth,
                                    height: screenHeight * 0.7,
                                }}
                                resizeMode="contain"
                            />
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            )}
        </View>
    );
};

export default GalleryComponent;
