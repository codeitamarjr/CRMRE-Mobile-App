import MapView, { Marker } from "react-native-maps";
import { MarketplaceUnit } from "@/types/marketplace";

export const MapCard = ({ unit }: { unit: MarketplaceUnit | null }) => {
  if (!unit) {
    return null;
  }

  const latitude = unit?.property?.coordinates?.latitude;
  const longitude = unit?.property?.coordinates?.longitude;

  const numericLatitude = latitude !== null && latitude !== undefined ? Number(latitude) : null;
  const numericLongitude = longitude !== null && longitude !== undefined ? Number(longitude) : null;

  if (
    numericLatitude === null ||
    numericLongitude === null ||
    Number.isNaN(numericLatitude) ||
    Number.isNaN(numericLongitude)
  ) {
    return null;
  }

  return (
    <MapView
      style={{ height: 200, width: "100%", marginTop: 20, borderRadius: 15 }}
      initialRegion={{
        latitude: numericLatitude,
        longitude: numericLongitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
    >
      <Marker
        key={unit?.id}
        coordinate={{
          latitude: numericLatitude,
          longitude: numericLongitude,
        }}
        title={unit?.name || unit?.property?.name || "Property"}
        description={unit?.property?.address || unit?.location?.address_line_1 || "Location"}
      />
    </MapView>
  );
};
