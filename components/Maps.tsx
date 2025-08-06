import { Property } from '@/lib/crmre';
import MapView, { Marker } from 'react-native-maps';


export const MapCard = ({ property }: { property: Property }) => {

    return (
        <MapView
            style={{ height: 200, width: '100%', marginTop: 20, borderRadius: 15 }}
            initialRegion={{
                latitude: property?.coordinates?.latitude || 0,
                longitude: property?.coordinates?.longitude || 0,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }}
        >
            <Marker
                key={property?.id}
                coordinate={{
                    latitude: property?.coordinates?.latitude,
                    longitude: property?.coordinates?.longitude,
                }}
                title={property?.type + ' ' + property?.number || 'Property'}
                description={property?.address || 'Location'}
                style={{ width: 50, height: 50 }}
            />
        </MapView>
    )
}