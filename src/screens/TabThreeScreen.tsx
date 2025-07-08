// screens/TabThreeScreen.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator, TouchableOpacity, Alert, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import BottomSheet from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { getPostsInViewport, NearByViewportResponse, Viewport } from '../../api/post'; // Adjust the import path as needed
import MapComponent from '../components/MapComponent'; // 새로 생성할 컴포넌트
import BottomSheetContent from '../components/BottomSheetContent'; // 새로 생성할 컴포넌트

export function TabThreeScreen() {
  const [currentRegion, setCurrentRegion] = useState<null | Region>(null);
  const [initialMapRegion, setInitialMapRegion] = useState<null | Region>(null);
  const [posts, setPosts] = useState<NearByViewportResponse[]>([]);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  const snapPoints = ['30%', '40%', '80%'];

  // 초기 위치 설정 로직
  useEffect(() => {
    (async () => {
      try {
        const { coords } = await Location.getCurrentPositionAsync({});
        const regionData = { latitude: coords.latitude, longitude: coords.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 };
        setInitialMapRegion(regionData);
        setCurrentRegion(regionData);
      } catch (err) {
        console.error("현재 위치를 가져오는 중 오류 발생:", err);
        Alert.alert('위치 오류', '현재 위치를 가져올 수 없습니다.');
        const defaultRegion = { latitude: 36.3504, longitude: 127.3845, latitudeDelta: 0.0922, longitudeDelta: 0.0421 };
        setInitialMapRegion(defaultRegion);
        setCurrentRegion(defaultRegion);
      }
    })();
  }, []);

  const handleLoadPosts = async () => {
    if (!currentRegion) {
      console.log("지도 영역을 아직 사용할 수 없습니다.");
      Alert.alert('오류', '지도 영역을 사용할 수 없습니다. 지도가 로드될 때까지 기다려 주세요.');
      return;
    }

    setLoadingPosts(true);
    setError(null);

    try {
      const viewport: Viewport = {
        centerLat: currentRegion.latitude,
        centerLon: currentRegion.longitude,
        deltaLat: currentRegion.latitudeDelta,
        deltaLon: currentRegion.longitudeDelta,
        deltaRatioLat: 0.4,
        deltaRatioLon: 0.4,
      };
      console.log("뷰포트에서 게시글 가져오는 중:", viewport);
      const fetchedPosts = await getPostsInViewport(viewport);
      setPosts(fetchedPosts);
      console.log("가져온 게시글:", fetchedPosts);

      if (bottomSheetRef.current) {
        if (fetchedPosts.length > 0) {
          bottomSheetRef.current.snapToIndex(1); // 게시글이 있으면 60%로 열기
        } else {
          bottomSheetRef.current.snapToIndex(2); // 게시글이 없으면 100%로 열기 (안내문 표시)
        }
      }

    } catch (err) {
      console.error("게시글 가져오는 중 오류 발생:", err);
      setError('게시글을 불러오지 못했습니다. 다시 시도해 주세요.');
      bottomSheetRef.current?.close(); // 오류 발생 시 닫음
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleMarkerPress = useCallback((post: NearByViewportResponse) => {
    console.log("마커 클릭:", post.title);
    if (bottomSheetRef.current) {
      bottomSheetRef.current?.snapToIndex(1); // 60%
    }
    // TODO: FlatList에서 해당 아이템으로 스크롤하는 로직 추가
  }, []);

  const toggleBottomSheet = useCallback(() => {
    if (isBottomSheetOpen) {
      bottomSheetRef.current?.close();
    } else {
      if (bottomSheetRef.current) {
        if (posts.length > 0) {
          bottomSheetRef.current?.snapToIndex(1);
        } else {
          bottomSheetRef.current?.snapToIndex(2);
        }
      }
    }
  }, [isBottomSheetOpen, posts.length]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {!initialMapRegion ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={{ marginTop: 10 }}>지도를 불러오는 중...</Text>
        </View>
      ) : (
        <View style={styles.mapContainer}>
          <MapComponent
            initialMapRegion={initialMapRegion}
            currentRegion={currentRegion}
            onRegionChangeComplete={setCurrentRegion}
            posts={posts}
            onMarkerPress={handleMarkerPress}
          />

          {!isBottomSheetOpen && (
            <TouchableOpacity
              style={styles.loadPostsButton}
              onPress={handleLoadPosts}
              disabled={loadingPosts}
            >
              {loadingPosts ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <Text style={styles.loadPostsButtonText}>
                  <Ionicons name="location-outline" size={16} color="#007AFF" /> 이 지역 검색하기
                </Text>
              )}
            </TouchableOpacity>
          )}

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.toggleListButton}
            onPress={toggleBottomSheet}
          >
            <Text style={styles.toggleListButtonText}>
              {isBottomSheetOpen ? '목록 숨기기' : '목록 보기'}
            </Text>
          </TouchableOpacity>

          <BottomSheet
            ref={bottomSheetRef}
            index={-1}
            snapPoints={snapPoints}
            enablePanDownToClose={true}
            onChange={(index) => setIsBottomSheetOpen(index > -1)}
          >
            <BottomSheetContent
              posts={posts}
              loadingPosts={loadingPosts}
              bottomSheetRef={bottomSheetRef} // BottomSheetContent에서 직접 제어할 수 있도록 ref 전달
            />
          </BottomSheet>
        </View>
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
  },
  loadPostsButton: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  loadPostsButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginLeft: 5,
  },
  toggleListButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#ff7f00',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1,
  },
  // 이곳에 toggleListButtonText 스타일을 추가합니다.
  toggleListButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    zIndex: 1,
  },
  errorText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

// MapView에서 Region 타입을 사용하므로 여기에 정의
interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}