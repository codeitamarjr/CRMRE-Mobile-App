import { Property } from "@/lib/crmre";
import MapView, { Marker } from "react-native-maps";

export const MapCard = ({ property }: { property: Property }) => {
  const latitude = property?.coordinates?.latitude;
  const longitude = property?.coordinates?.longitude;

  if (
    latitude === null ||
    latitude === undefined ||
    longitude === null ||
    longitude === undefined
  ) {
    return null;
  }

  return (
    <MapView
      style={{ height: 200, width: "100%", marginTop: 20, borderRadius: 15 }}
      initialRegion={{
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
    >
      <Marker
        key={property?.id}
        coordinate={{
          latitude,
          longitude,
        }}
        title={
          property?.name ||
          [property?.type, property?.number ?? property?.unitCode]
            .filter(Boolean)
            .join(" ") ||
          "Property"
        }
        description={property?.address || "Location"}
      />
    </MapView>
  );
};
