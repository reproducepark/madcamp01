import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps'; // Region 타입을 여기서 임포트
import mapStyle from './mapStyles.js'; // mapStyles.js 경로 조정
import { NearByViewportResponse } from '../../api/post'; // PostResponse 타입 임포트

interface MapComponentProps {
  initialMapRegion: Region | null;
  currentRegion: Region | null;
  onRegionChangeComplete: (region: Region) => void;
  posts: NearByViewportResponse[];
  onMarkerPress: (post: NearByViewportResponse) => void;
  mapRef: React.RefObject<MapView | null>; // MapView ref 타입을 null을 포함하도록 수정
}

const MapComponent: React.FC<MapComponentProps> = ({
  initialMapRegion,
  currentRegion,
  onRegionChangeComplete,
  posts,
  onMarkerPress,
  mapRef, // prop으로 받기
}) => {
  return (
    <MapView
      ref={mapRef} // ref 연결
      style={styles.map}
      provider={PROVIDER_GOOGLE}
      initialRegion={initialMapRegion || undefined} // null일 경우 undefined로 넘겨 경고 방지
      onRegionChangeComplete={onRegionChangeComplete}
      showsUserLocation
      // showsMyLocationButton // 이 부분을 제거합니다.
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

export default MapComponent;