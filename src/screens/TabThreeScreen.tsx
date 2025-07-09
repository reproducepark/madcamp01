import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Text, Animated } from 'react-native'; // Animated 임포트
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import BottomSheet from '@gorhom/bottom-sheet'; // 'bottom-sheet'를 'bottom-sheets'로 수정했습니다.
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { getPostsInViewport, NearByViewportResponse, Viewport } from '../../api/post';
import MapComponent from '../components/MapComponent';
import BottomSheetContent from '../components/BottomSheetContent';
import MapView, { Region } from 'react-native-maps';

export function TabThreeScreen() {
  const [currentRegion, setCurrentRegion] = useState<null | Region>(null);
  const [initialMapRegion, setInitialMapRegion] = useState<null | Region>(null);
  const [posts, setPosts] = useState<NearByViewportResponse[]>([]);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObjectCoords | null>(null);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const mapRef = useRef<MapView>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  // 애니메이션을 위한 useRef 추가
  const loadPostsButtonOpacity = useRef(new Animated.Value(1)).current;
  const myLocationButtonOpacity = useRef(new Animated.Value(1)).current;

  const snapPoints = ['30%', '40%', '80%'];

  // 바텀 시트 상태 변경에 따라 버튼 애니메이션 실행
  useEffect(() => {
    // '이 지역 검색하기' 버튼 애니메이션
    Animated.timing(loadPostsButtonOpacity, {
      toValue: isBottomSheetOpen ? 0 : 1, // 바텀시트가 열리면 0 (투명), 닫히면 1 (불투명)
      duration: 300, // 0.3초
      useNativeDriver: true,
    }).start();

    // '현재 위치로' 버튼 애니메이션
    Animated.timing(myLocationButtonOpacity, {
      toValue: isBottomSheetOpen ? 0 : 1, // 바텀시트가 열리면 0 (투명), 닫히면 1 (불투명)
      duration: 300, // 0.3초
      useNativeDriver: true,
    }).start();
  }, [isBottomSheetOpen, loadPostsButtonOpacity, myLocationButtonOpacity]);


  // 초기 위치 설정 로직 및 현재 위치 저장
  useEffect(() => {
    (async () => {
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
        setUserLocation(coords); // 사용자 위치 저장

        const regionData = { latitude: coords.latitude, longitude: coords.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 };
        setInitialMapRegion(regionData);
        setCurrentRegion(regionData);
      } catch (err) {
        console.error("현재 위치를 가져오는 중 오류 발생:", err);
        Alert.alert('위치 오류', '현재 위치를 가져올 수 없습니다. 기본 위치로 지도를 로드합니다.');
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
          bottomSheetRef.current.snapToIndex(1); // 게시글이 있으면 40%로 열기
        } else {
          bottomSheetRef.current.snapToIndex(2); // 게시글이 없으면 80%로 열기 (안내문 표시)
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
      bottomSheetRef.current?.snapToIndex(1); // 40%
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

  // 현재 위치로 지도를 이동시키는 함수
  const moveToCurrentLocation = useCallback(() => {
    if (userLocation && mapRef.current) {
      const newRegion = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      mapRef.current.animateToRegion(newRegion, 1000); // 1초 동안 애니메이션
      setCurrentRegion(newRegion); // 현재 지도 영역도 업데이트
    } else {
      Alert.alert('오류', '현재 위치 정보를 가져올 수 없습니다.');
    }
  }, [userLocation]);


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
            mapRef={mapRef}
            initialMapRegion={initialMapRegion}
            currentRegion={currentRegion}
            onRegionChangeComplete={setCurrentRegion}
            posts={posts}
            onMarkerPress={handleMarkerPress}
            userLocation={userLocation} // userLocation prop 전달
          />

          {/* 바텀시트가 열려있지 않을 때만 "이 지역 검색하기" 버튼 표시 */}
          {/* Animated.View 로 감싸서 opacity 애니메이션 적용 */}
          <Animated.View style={[styles.loadPostsButtonContainer, { opacity: loadPostsButtonOpacity }]}>
            {/* isBottomSheetOpen 조건은 Animated.View의 opacity가 0일 때 터치 이벤트를 막기 위해 유지 */}
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
          </Animated.View>


          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* 바텀시트가 열려있지 않을 때만 "현재 위치로" 버튼 표시 */}
          {/* Animated.View 로 감싸서 opacity 애니메이션 적용 */}
          <Animated.View style={[styles.myLocationButtonContainer, { opacity: myLocationButtonOpacity }]}>
            {/* isBottomSheetOpen 조건은 Animated.View의 opacity가 0일 때 터치 이벤트를 막기 위해 유지 */}
            {initialMapRegion && !isBottomSheetOpen && (
              <TouchableOpacity
                style={styles.myLocationButton}
                onPress={moveToCurrentLocation}
              >
                <Ionicons name="locate" size={28} color="#007AFF" />
              </TouchableOpacity>
            )}
          </Animated.View>


          {/* 바텀시트 열기/닫기 버튼 (기존 위치 유지) */}
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
            onChange={(index) => setIsBottomSheetOpen(index > -1)}
          >
            <BottomSheetContent
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
  // '이 지역 검색하기' 버튼 컨테이너 추가 및 스타일 분리
  loadPostsButtonContainer: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    zIndex: 1,
  },
  loadPostsButton: {
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
  },
  loadPostsButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginLeft: 5,
  },
  toggleListButtonContainer: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    zIndex: 1,
  },
  toggleListButton: {
    backgroundColor: '#ff7f00',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  toggleListButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
  },
  // '현재 위치로' 버튼 컨테이너 추가 및 스타일 분리
  myLocationButtonContainer: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    zIndex: 1,
  },
  myLocationButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 50,
    shadowColor: '#000',
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