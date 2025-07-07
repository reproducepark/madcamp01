import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Text, View, StyleSheet, Dimensions, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { getPostsInViewport, PostResponse, Viewport } from '../../api/post'; // Adjust the import path as needed
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import mapStyle from './mapStyles.js';

export function TabThreeScreen() {
  const [currentRegion, setCurrentRegion] = useState<null | Region>(null);
  const [initialMapRegion, setInitialMapRegion] = useState<null | Region>(null);
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  // snapPoints를 고정된 값으로 설정
  const snapPoints = ['30%', '60%', '100%'];

  // 초기 위치 설정 로직
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', '위치 접근 권한이 필요합니다.');
        const defaultRegion = { latitude: 36.3504, longitude: 127.3845, latitudeDelta: 0.0922, longitudeDelta: 0.0421 };
        setInitialMapRegion(defaultRegion);
        setCurrentRegion(defaultRegion);
        return;
      }

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

  // 게시글 상태 변경 시 BottomSheet 조정
  useEffect(() => {
    if (bottomSheetRef.current) {
      if (posts.length > 0) {
        // 게시글이 있으면 60% (중간)로 스냅 (snapPoints의 인덱스 1)
        bottomSheetRef.current?.snapToIndex(1);
      } else {
        // 게시글이 없으면 BottomSheet를 100% (인덱스 2)로 스냅하여 안내문 표시
        bottomSheetRef.current?.snapToIndex(2);
      }
    }
  }, [posts]);

  const handleLoadPosts = async () => {
    if (!currentRegion) {
      console.log("지도 영역을 아직 사용할 수 없습니다.");
      Alert.alert('오류', '지도 영역을 사용할 수 없습니다. 지도가 로드될 때까지 기다려 주세요.');
      return;
    }

    setLoadingPosts(true);
    setError(null);
    setPosts([]); // 이전 게시글 초기화

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

    } catch (err) {
      console.error("게시글 가져오는 중 오류 발생:", err);
      setError('게시글을 불러오지 못했습니다. 다시 시도해 주세요.');
      bottomSheetRef.current?.close(); // 오류 발생 시 닫음
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleMarkerPress = useCallback((post: PostResponse) => {
    console.log("마커 클릭:", post.title);
    // 마커 클릭 시 BottomSheet 열기 (60% 스냅 포인트)
    if (bottomSheetRef.current) {
      bottomSheetRef.current?.snapToIndex(1); // 60%
    }
    // TODO: FlatList에서 해당 아이템으로 스크롤하는 로직 추가
  }, []);

  const renderPostItem = useCallback(({ item }: { item: PostResponse }) => (
    <TouchableOpacity
      style={styles.postItem}
      onPress={() => {
        console.log("게시글 아이템 클릭:", item.title);
        // 게시글 아이템 클릭 시 100%로 확장
        if (bottomSheetRef.current) {
          bottomSheetRef.current?.snapToIndex(2); // 100%
        }
        // TODO: 필요한 경우 해당 게시글의 상세 정보를 표시하는 로직 추가
      }}
    >
      <View style={styles.itemImagePlaceholder} />
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemDescription} numberOfLines={1}>{item.content}</Text>
        <Text style={styles.itemLocation}>만년동</Text>
      </View>
    </TouchableOpacity>
  ), []);

  const toggleBottomSheet = useCallback(() => {
    if (isBottomSheetOpen) {
      bottomSheetRef.current?.close();
    } else {
      // 게시글 유무에 따라 적절한 스냅포인트로 열기
      if (bottomSheetRef.current) {
        if (posts.length > 0) {
          bottomSheetRef.current?.snapToIndex(1); // 게시글이 있으면 60%로 열기
        } else {
          bottomSheetRef.current?.snapToIndex(2); // 게시글이 없으면 100%로 열기
        }
      }
    }
  }, [isBottomSheetOpen, posts.length]); // posts.length를 의존성에 추가

  // "게시글 없음" UI를 렌더링하는 컴포넌트
  const renderEmptyListComponent = useCallback(() => (
    <View style={styles.noPostsContainer}>
      {loadingPosts ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <>
          <Text style={styles.noPostsText}>이 지역에는 아직 글이 없어요.</Text>
          <Text style={styles.noPostsSubText}>지도를 이동하거나 '이 지역 검색하기'를 눌러보세요.</Text>
        </>
      )}
    </View>
  ), [loadingPosts]);

  // "게시글 리스트" 헤더 컴포넌트
  const renderListHeader = useCallback(() => (
    posts.length > 0 ? (
      <View style={styles.listHeaderContainer}>
        <Text style={styles.listHeaderText}>게시글 리스트 ({posts.length})</Text>
      </View>
    ) : null
  ), [posts.length]);


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {!initialMapRegion ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={{ marginTop: 10 }}>지도를 불러오는 중...</Text>
        </View>
      ) : (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={initialMapRegion}
            onRegionChangeComplete={setCurrentRegion}
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
                onPress={() => handleMarkerPress(post)}
              >
                <View style={styles.customMarker}>
                  <View style={styles.innerMarker} />
                </View>
              </Marker>
            ))}
          </MapView>

          {!isBottomSheetOpen && ( // 바텀시트가 닫혀있을 때만 버튼 표시
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
            index={-1} // 초기 상태: -1 = 닫힘
            snapPoints={snapPoints} // 고정된 snapPoints 사용
            enablePanDownToClose={true}
            onChange={(index) => setIsBottomSheetOpen(index > -1)}
          >
            <BottomSheetFlatList
              data={posts}
              renderItem={renderPostItem}
              keyExtractor={(item) => item.id.toString()}
              style={styles.bottomSheetFlatList}
              contentContainerStyle={styles.postsListContent}
              ListHeaderComponent={renderListHeader}
              ListEmptyComponent={renderEmptyListComponent}
              scrollEnabled={posts.length > 0} // 게시글이 없을 때는 스크롤 비활성화
              showsVerticalScrollIndicator={false}
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
  map: {
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
  bottomSheetFlatList: {
    backgroundColor: '#f9f9f9',
  },
  postsListContent: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  listHeaderContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
  },
  listHeaderText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
  },
  postItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  itemImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#eee',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 13,
    color: '#555',
    marginBottom: 4,
  },
  itemLocation: {
    fontSize: 12,
    color: '#999',
  },
  noPostsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noPostsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 5,
  },
  noPostsSubText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
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