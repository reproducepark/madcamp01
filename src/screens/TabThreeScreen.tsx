import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import BottomSheet from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { getPostsInViewport, NearByViewportResponse, Viewport } from '../../api/post';
import MapComponent from '../components/MapComponent';
import BottomSheetContent from '../components/BottomSheetContent';
import MapView, { Region } from 'react-native-maps';
import { useFocusEffect } from '@react-navigation/native'; // useFocusEffect 임포트

// 사용할 색상 팔레트를 상수로 정의합니다.
const COLOR_PALETTE = {
  SKY_BLUE: "#1e96fc",
  LIGHT_BLUE: "#a2d6f9",
  GRAYISH_BROWN_LIGHT: "#6c757d",
  GRAYISH_BROWN_DARK: "#6c757d",
  WHITE: '#fff',
  BLACK: '#000',
  GRAY_DARK: '#333',
  GRAY_MEDIUM: '#555',
  GRAY_LIGHT: '#888',
  GRAY_VERY_LIGHT: '#999',
  BORDER_COLOR: '#e0e0e0',
  LIKE_COLOR: '#e71d36', // 좋아요 아이콘 색상 (주황색 계열)
};

export function TabThreeScreen() {
  const [currentRegion, setCurrentRegion] = useState<null | Region>(null);
  const [initialMapRegion, setInitialMapRegion] = useState<null | Region>(null);
  const [posts, setPosts] = useState<NearByViewportResponse[]>([]);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObjectCoords | null>(null);

  // 현재 위치 새로고침을 위한 상태 추가
  const [refreshLocationTrigger, setRefreshLocationTrigger] = useState(0);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const mapRef = useRef<MapView>(null);
  const bottomSheetContentRef = useRef<any>(null);

  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  const loadPostsButtonOpacity = useRef(new Animated.Value(1)).current;
  const myLocationButtonOpacity = useRef(new Animated.Value(1)).current;

  const snapPoints = ['30%', '50%', '70%'];

  // 바텀 시트 상태 변경에 따라 버튼 애니메이션 실행
  useEffect(() => {
    Animated.timing(loadPostsButtonOpacity, {
      toValue: isBottomSheetOpen ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    Animated.timing(myLocationButtonOpacity, {
      toValue: isBottomSheetOpen ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isBottomSheetOpen, loadPostsButtonOpacity, myLocationButtonOpacity]);

  // 위치 정보를 가져오는 비동기 함수
  const fetchLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('위치 권한 필요', '이 기능을 사용하려면 위치 권한이 필요합니다.');
        const defaultRegion = { latitude: 36.3504, longitude: 127.3845, latitudeDelta: 0.0922, longitudeDelta: 0.0421 };
        setInitialMapRegion(defaultRegion);
        setCurrentRegion(defaultRegion);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const coords = location.coords;
      setUserLocation(coords);

      const regionData = { latitude: coords.latitude, longitude: coords.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 };
      setInitialMapRegion(regionData);
      setCurrentRegion(regionData);

      // 지도를 현재 위치로 이동
      if (mapRef.current) {
        mapRef.current.animateToRegion(regionData, 1000);
      }

    } catch (err) {
      console.error("현재 위치를 가져오는 중 오류 발생:", err);
      Alert.alert('위치 오류', '현재 위치를 가져올 수 없습니다. 기본 위치로 지도를 로드합니다.');
      const defaultRegion = { latitude: 36.3504, longitude: 127.3845, latitudeDelta: 0.0922, longitudeDelta: 0.0421 };
      setInitialMapRegion(defaultRegion);
      setCurrentRegion(defaultRegion);
    }
  };

  // 탭에 들어올 때마다 위치 정보 업데이트 (useFocusEffect 사용)
  useFocusEffect(
    useCallback(() => {
      // 탭 포커스 시 위치를 새로 가져옵니다.
      fetchLocation();
    }, []) // 의존성 배열이 비어있으므로 컴포넌트가 마운트되거나 포커스될 때 한 번만 실행됩니다.
  );

  // '현재 위치로' 버튼 클릭 시 위치 정보 업데이트 (refreshLocationTrigger 변경 시)
  useEffect(() => {
    // refreshLocationTrigger가 0이 아니면 (즉, 버튼 클릭으로 인해 변경되었으면) 위치를 새로 가져옵니다.
    if (refreshLocationTrigger > 0) {
      fetchLocation();
    }
  }, [refreshLocationTrigger]);


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
          bottomSheetRef.current.snapToIndex(0);
        } else {
          bottomSheetRef.current.snapToIndex(1);
        }
      }

    } catch (err) {
      console.error("게시글 가져오는 중 오류 발생:", err);
      setError('게시글을 불러오지 못했습니다. 다시 시도해 주세요.');
      bottomSheetRef.current?.close();
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleMarkerPress = useCallback((post: NearByViewportResponse) => {
    console.log("마커 클릭:", post.title);
    if (bottomSheetRef.current) {
      bottomSheetRef.current?.snapToIndex(0);
      if (bottomSheetContentRef.current) {
        bottomSheetContentRef.current.scrollToTop();
      }
    }
  }, []);

  const handleBottomSheetChanges = useCallback((index: number) => {
    setIsBottomSheetOpen(index > -1);

    if (index > -1 && bottomSheetContentRef.current) {
      bottomSheetContentRef.current.scrollToTop();
    }
  }, []);

  const toggleBottomSheet = useCallback(() => {
    if (isBottomSheetOpen) {
      bottomSheetRef.current?.close();
    } else {
      handleLoadPosts();
    }
  }, [isBottomSheetOpen, handleLoadPosts]);

  // 현재 위치로 지도를 이동시키는 함수 (refreshLocationTrigger 상태 변경)
  const moveToCurrentLocation = useCallback(() => {
    // refreshLocationTrigger 값을 증가시켜 useEffect를 트리거합니다.
    setRefreshLocationTrigger(prev => prev + 1);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {!initialMapRegion ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={COLOR_PALETTE.GRAYISH_BROWN_DARK} />
          <Text style={{ marginTop: 10, color: COLOR_PALETTE.GRAY_MEDIUM }}>지도를 불러오는 중...</Text>
        </View>
      ) : (
        <View style={styles.mapContainer}>
          <MapComponent
            mapRef={mapRef}
            initialMapRegion={initialMapRegion}
            currentRegion={currentRegion}
            onRegionChangeComplete={setCurrentRegion}
            posts={posts}
            onMarkerPress={handleMarkerPress}
            userLocation={userLocation}
          />

          <Animated.View style={[styles.loadPostsButtonContainer, { opacity: loadPostsButtonOpacity }]}>
            {!isBottomSheetOpen && (
              <TouchableOpacity
                style={styles.loadPostsButton}
                onPress={handleLoadPosts}
                disabled={loadingPosts}
              >
                {loadingPosts ? (
                  <ActivityIndicator size="small" color={COLOR_PALETTE.GRAYISH_BROWN_DARK} />
                ) : (
                  <Text style={styles.loadPostsButtonText}>
                    <Ionicons name="location-outline" size={16} color={COLOR_PALETTE.GRAYISH_BROWN_DARK} /> 이 지역 검색하기
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </Animated.View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Animated.View style={[styles.myLocationButtonContainer, { opacity: myLocationButtonOpacity }]}>
            {initialMapRegion && !isBottomSheetOpen && (
              <TouchableOpacity
                style={styles.myLocationButton}
                onPress={moveToCurrentLocation} // 이 부분에서 setRefreshLocationTrigger가 호출됩니다.
              >
                <Ionicons name="locate" size={28} color={COLOR_PALETTE.GRAYISH_BROWN_DARK} />
              </TouchableOpacity>
            )}
          </Animated.View>

          {initialMapRegion && (
            <View style={styles.toggleListButtonContainer}>
              <TouchableOpacity
                style={styles.toggleListButton}
                onPress={toggleBottomSheet}
              >
                <Text style={styles.toggleListButtonText}>
                  {isBottomSheetOpen ? '목록 숨기기' : '목록 보기'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <BottomSheet
            ref={bottomSheetRef}
            index={-1}
            snapPoints={snapPoints}
            enablePanDownToClose={true}
            onChange={handleBottomSheetChanges}
          >
            <BottomSheetContent
              ref={bottomSheetContentRef}
              posts={posts}
              loadingPosts={loadingPosts}
              bottomSheetRef={bottomSheetRef}
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
  loadPostsButtonContainer: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    zIndex: 1,
  },
  loadPostsButton: {
    backgroundColor: COLOR_PALETTE.WHITE,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    shadowColor: COLOR_PALETTE.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadPostsButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLOR_PALETTE.GRAYISH_BROWN_DARK,
    marginLeft: 5,
    lineHeight: 16 * 1.2,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  toggleListButtonContainer: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    zIndex: 1,
  },
  toggleListButton: {
    backgroundColor: COLOR_PALETTE.LIKE_COLOR,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    shadowColor: COLOR_PALETTE.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  toggleListButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLOR_PALETTE.WHITE,
  },
  myLocationButtonContainer: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    zIndex: 1,
  },
  myLocationButton: {
    backgroundColor: COLOR_PALETTE.WHITE,
    padding: 12,
    borderRadius: 50,
    shadowColor: COLOR_PALETTE.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: COLOR_PALETTE.LIKE_COLOR,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    zIndex: 1,
  },
  errorText: {
    color: COLOR_PALETTE.WHITE,
    fontSize: 14,
    fontWeight: 'bold',
  },
});