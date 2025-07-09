import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import mapStyle from './mapStyles.js';
import { NearByViewportResponse } from '../../api/post';
import { LocationObjectCoords } from 'expo-location'; // LocationObjectCoords 타입 임포트

interface MapComponentProps {
  initialMapRegion: Region | null;
  currentRegion: Region | null;
  onRegionChangeComplete: (region: Region) => void;
  posts: NearByViewportResponse[];
  onMarkerPress: (post: NearByViewportResponse) => void;
  mapRef: React.RefObject<MapView | null>;
  userLocation: LocationObjectCoords | null; // 사용자 위치 prop 추가
}

const MapComponent: React.FC<MapComponentProps> = ({
  initialMapRegion,
  currentRegion,
  onRegionChangeComplete,
  posts,
  onMarkerPress,
  mapRef,
  userLocation, // prop으로 받기
}) => {
  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      provider={PROVIDER_GOOGLE}
      initialRegion={initialMapRegion || undefined}
      onRegionChangeComplete={onRegionChangeComplete}
      // showsUserLocation 제거
      // showsMyLocationButton 제거
      customMapStyle={mapStyle}
    >
      {/* 사용자 위치 커스텀 마커 */}
      {userLocation && (
        <Marker
          coordinate={{ latitude: userLocation.latitude, longitude: userLocation.longitude }}
          title="내 위치"
          description="현재 당신의 위치입니다."
          anchor={{ x: 0.5, y: 0.5 }} // 마커 중앙에 앵커
        >
          <View style={styles.userLocationMarker}>
            <View style={styles.userLocationInner} />
          </View>
        </Marker>
      )}

      {/* 기존 게시글 마커 */}
      {posts.map((post) => (
        <Marker
          key={post.id}
          coordinate={{ latitude: post.lat, longitude: post.lon }}
          // title={post.title}
          // description={post.content}
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
    backgroundColor: '#e71d36',
  },
  // 사용자 위치 마커 스타일 추가
  userLocationMarker: {
    height: 20,
    width: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // 투명도 있는 파란색 원
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userLocationInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#6c757d', // 진한 파란색 점
  },
});

export default MapComponent;