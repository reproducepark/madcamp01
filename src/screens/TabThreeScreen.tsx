import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Text, View, StyleSheet, Dimensions, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { getPostsInViewport, PostResponse, Viewport } from '../../api/post'; // Adjust the import path as needed
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import mapStyle from './mapStyles.js';

const { width } = Dimensions.get('window');
const ITEM_MARGIN = 8;
const ITEM_SIZE = (width - 16 * 2 - ITEM_MARGIN * 2) / 3;


export function TabThreeScreen() {
  const [currentRegion, setCurrentRegion] = useState<null | Region>(null);
  const [initialMapRegion, setInitialMapRegion] = useState<null | Region>(null);
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  // 게시글 수에 따라 snapPoints를 동적으로 설정
  const dynamicSnapPoints = useMemo(() => {
    return posts.length === 0 ? ['30%'] : ['30%', '60%', '100%'];
  }, [posts.length]);


  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location access is needed to show your current position on the map.');
        // 권한 거부 시에도 초기 맵 리전 설정 (대전)
        const defaultRegion = {
          latitude: 36.3504,
          longitude: 127.3845,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        setInitialMapRegion(defaultRegion);
        setCurrentRegion(defaultRegion);
        return;
      }

      try {
        const { coords } = await Location.getCurrentPositionAsync({});
        const regionData = {
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setInitialMapRegion(regionData);
        setCurrentRegion(regionData);
      } catch (err) {
        console.error("Error getting current position:", err);
        Alert.alert('Location Error', 'Could not fetch your current location.');
        // Set a default region if location cannot be fetched (Daejeon)
        const defaultRegion = {
          latitude: 36.3504,
          longitude: 127.3845,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        setInitialMapRegion(defaultRegion);
        setCurrentRegion(defaultRegion);
      }
    })();
  }, []);

  const handleLoadPosts = async () => {
    if (!currentRegion) {
      console.log("Map region not available yet.");
      Alert.alert('Error', 'Map region not available yet. Please wait for the map to load.');
      return;
    }

    setLoadingPosts(true);
    setError(null);
    setPosts([]); // Clear previous posts

    try {
      const viewport: Viewport = {
        centerLat: currentRegion.latitude,
        centerLon: currentRegion.longitude,
        deltaLat: currentRegion.latitudeDelta,
        deltaLon: currentRegion.longitudeDelta,
        deltaRatioLat: 0.4,
        deltaRatioLon: 0.4,
      };
      console.log("Fetching posts with viewport:", viewport);
      const fetchedPosts = await getPostsInViewport(viewport);
      setPosts(fetchedPosts);
      console.log("Fetched posts:", fetchedPosts);
      if (fetchedPosts.length > 0) {
        bottomSheetRef.current?.snapToIndex(1); // 게시글이 있으면 60% (중간)
      } else {
        bottomSheetRef.current?.snapToIndex(0); // 게시글이 없으면 30% (최소)
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError('Failed to load posts. Please try again.');
      bottomSheetRef.current?.close();
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleMarkerPress = useCallback((post: PostResponse) => {
    console.log("Marker pressed:", post.title);
    if (!isBottomSheetOpen) {
      bottomSheetRef.current?.snapToIndex(1); // 마커 클릭 시 게시글 목록이 보이도록
    }
    // TODO: FlatList에서 해당 아이템으로 스크롤하는 로직 추가
  }, [isBottomSheetOpen]);


  const renderPostItem = useCallback(({ item }: { item: PostResponse }) => (
    <TouchableOpacity
      style={styles.postItem}
      onPress={() => {
        console.log("Post item pressed:", item.title);
        // 게시글이 있을 때만 100%로 확장 가능
        if (posts.length > 0) {
          bottomSheetRef.current?.snapToIndex(2);
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
  ), [posts.length]); // posts.length를 의존성 배열에 추가

  const toggleBottomSheet = () => {
    if (isBottomSheetOpen) {
      bottomSheetRef.current?.close();
    } else {
      bottomSheetRef.current?.snapToIndex(1); // 게시글이 있을 때만 60%로 열림
    }
  };

  // "게시글 없음" UI를 렌더링하는 컴포넌트
  const renderEmptyListComponent = useMemo(() => (
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
  const renderListHeader = useMemo(() => (
    // 게시글이 있을 때만 헤더를 표시
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
          <Text style={{ marginTop: 10 }}>Loading map...</Text>
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

          {/* isBottomSheetOpen 상태에 따라 버튼 표시 여부 결정 */}
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

          {posts.length > 0 && ( // 게시글이 있을 때만 '목록 숨기기/보기' 버튼 표시
            <TouchableOpacity
              style={styles.toggleListButton}
              onPress={toggleBottomSheet}
            >
              <Text style={styles.toggleListButtonText}>
                {isBottomSheetOpen ? '목록 숨기기' : '목록 보기'}
              </Text>
            </TouchableOpacity>
          )}

          <BottomSheet
            ref={bottomSheetRef}
            index={-1} // 초기 상태: -1 = 닫힘
            snapPoints={dynamicSnapPoints} // 게시글 수에 따라 동적으로 설정
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
              // 게시글이 없을 때는 스크롤 비활성화 (안내 문구만 보이게)
              scrollEnabled={posts.length > 0}
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
    flexGrow: 1, // ListEmptyComponent가 중앙에 오도록 함
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
    minHeight: 150, // 최소 높이를 지정하여 내용이 없어도 컨테이너가 찌그러지지 않도록 합니다.
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