// components/MapComponent.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps'; // Region 타입을 여기서 임포트
import mapStyle from '../screens/mapStyles.js'; // mapStyles.js 경로 조정
import { PostResponse } from '../../api/post'; // PostResponse 타입 임포트

interface MapComponentProps {
  initialMapRegion: Region | null;
  currentRegion: Region | null;
  onRegionChangeComplete: (region: Region) => void;
  posts: PostResponse[];
  onMarkerPress: (post: PostResponse) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({
  initialMapRegion,
  currentRegion,
  onRegionChangeComplete,
  posts,
  onMarkerPress,
}) => {
  return (
    <MapView
      style={styles.map}
      provider={PROVIDER_GOOGLE}
      initialRegion={initialMapRegion || undefined} // null일 경우 undefined로 넘겨 경고 방지
      onRegionChangeComplete={onRegionChangeComplete}
      showsUserLocation
      showsMyLocationButton
      customMapStyle={mapStyle}
    >
      {posts.map((post) => (
        <Marker
          key={post.id}
          coordinate={{ latitude: post.lat, longitude: post.lon }}
          title={post.title}
          description={post.content}
          onPress={() => onMarkerPress(post)}
        >
          <View style={styles.customMarker}>
            <View style={styles.innerMarker} />
          </View>
        </Marker>
      ))}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  customMarker: {
    height: 28,
    width: 28,
    borderRadius: 14,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  innerMarker: {
    height: 16,
    width: 16,
    borderRadius: 8,
    backgroundColor: 'orange',
  },
});

// MapView에서 Region 타입을 사용하므로 여기에 정의 (이 부분은 이제 필요 없습니다. 위에서 임포트합니다.)
// interface Region {
//   latitude: number;
//   longitude: number;
//   latitudeDelta: number;
//   longitudeDelta: number;
// }

export default MapComponent;