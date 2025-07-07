import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Text, View, ScrollView, SafeAreaView, StyleSheet, FlatList, Image, Dimensions, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { getPostsInViewport, PostResponse, Viewport } from '../../api/post'; // Adjust the import path as needed
import BottomSheet, { BottomSheetView, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');
const ITEM_MARGIN = 8;
const ITEM_SIZE = (width - 16 * 2 - ITEM_MARGIN * 2) / 3;

// Define a custom map style (e.g., 'Aubergine' from Snazzy Maps)
const mapStyle = [
  {
    "featureType": "landscape.man_made",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#f7f7f7"
      }
    ]
  },
  {
    "featureType": "poi.business",
    "elementType": "labels",
    "stylers": [
      {
        "weight": 0.5
      }
    ]
  },
  {
    "featureType": "poi.business",
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "simplified"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#deeecf"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#ffffff"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#d1cdc5"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#fdf0b5"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#ebcc79"
      },
      {
        "weight": 1
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#ffeb3b"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#ffffff"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#d1cdc5"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "transit.station",
    "elementType": "labels.text",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#a5d1f3"
      }
    ]
  }
];

export function TabThreeScreen() {
  const [currentRegion, setCurrentRegion] = useState<null | Region>(null);
  const [initialMapRegion, setInitialMapRegion] = useState<null | Region>(null);
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Bottom Sheet Ref and Snap Points
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['30%', '60%', '100%'], []); // 0% (닫힘), 30% (부분 열림), 60% (더 열림)
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location access is needed to show your current position on the map.');
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
        setInitialMapRegion({
          latitude: 36.3504,
          longitude: 127.3845,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        setCurrentRegion({
          latitude: 36.3504,
          longitude: 127.3845,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
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
        bottomSheetRef.current?.snapToIndex(1); // 게시글이 있으면 부분 열림 상태로
        setIsBottomSheetOpen(true);
      } else {
        bottomSheetRef.current?.close(); // 게시글이 없으면 닫기
        setIsBottomSheetOpen(false);
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError('Failed to load posts. Please try again.');
      bottomSheetRef.current?.close();
      setIsBottomSheetOpen(false);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleMarkerPress = useCallback((post: PostResponse) => {
    // 마커 클릭 시 해당 게시글을 강조하거나, 해당 게시글로 스크롤하는 로직 추가 가능
    console.log("Marker pressed:", post.title);
    if (!isBottomSheetOpen) {
      bottomSheetRef.current?.snapToIndex(1); // 바텀 시트가 닫혀있다면 부분 열기
      setIsBottomSheetOpen(true);
    }
    // TODO: FlatList에서 해당 아이템으로 스크롤하는 로직 추가
  }, [isBottomSheetOpen]);


  const renderPostItem = useCallback(({ item }: { item: PostResponse }) => (
    <TouchableOpacity
      style={styles.postItem}
      onPress={() => {
        console.log("Post item pressed:", item.title);
        // 리스트 아이템 클릭 시 바텀 시트 열기 또는 확장
        bottomSheetRef.current?.snapToIndex(2); // 더 열린 상태로
        // TODO: 필요한 경우 해당 게시글의 상세 정보를 표시하는 로직 추가
      }}
    >
      {/* 이미지 미리보기 */}
      <View style={styles.itemImagePlaceholder} />
      {/* <Image source={{ uri: item.imageUrl }} style={styles.itemImage} /> */}
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemDescription} numberOfLines={1}>{item.content}</Text>
        {/* 추가 정보 (예: 위치, 시간 등) */}
        <Text style={styles.itemLocation}>만년동</Text>
      </View>
    </TouchableOpacity>
  ), []);

  const toggleBottomSheet = () => {
    if (isBottomSheetOpen) {
      bottomSheetRef.current?.close();
    } else {
      bottomSheetRef.current?.snapToIndex(1); // 부분 열기
    }
    setIsBottomSheetOpen(!isBottomSheetOpen);
  };

  if (!initialMapRegion) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Loading map...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={initialMapRegion}
          onRegionChangeComplete={(region) => {
            setCurrentRegion(region);
          }}
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

        {/* 목록 보기 버튼 (바텀 시트 제어) */}
        {posts.length > 0 && ( // 게시글이 있을 때만 버튼 표시
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
          index={0} // 초기 상태: 0 = 닫힘
          snapPoints={snapPoints}
          enablePanDownToClose={true}
          onChange={(index) => {
            setIsBottomSheetOpen(index > 0); // index가 0보다 크면 열린 상태로 간주
          }}
          enableContentPanningGesture={false}
        >
          <BottomSheetView style={styles.bottomSheetContentContainer}
            onLayout={(event) => {
              const { height } = event.nativeEvent.layout;
              console.log('BottomSheetView height:', height);
            }}
          >
            {posts.length === 0 && !loadingPosts ? (
              <View style={styles.noPostsContainer}>
                <Text style={styles.noPostsText}>이 지역에는 아직 글이 없어요.</Text>
                <Text style={styles.noPostsSubText}>지도를 이동하거나 '이 지역 검색하기'를 눌러보세요.</Text>
              </View>
            ) : (
              <>
                {/* 상단 필터 및 정렬 옵션 (당근마켓 스크린샷 참고) */}
                <View style={styles.filterContainer}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollView}>
                    <TouchableOpacity style={styles.filterButtonActive}>
                      <Text style={styles.filterButtonTextActive}>후기있음</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterButton}>
                      <Text style={styles.filterButtonText}>쿠폰</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterButton}>
                      <Text style={styles.filterButtonText}>걸어서 10분</Text>
                    </TouchableOpacity>
                    {/* 더 많은 필터 옵션 */}
                  </ScrollView>
                </View>

                {/* 게시글 리스트 */}
                <BottomSheetFlatList
                  data={posts}
                  renderItem={renderPostItem}
                  keyExtractor={(item) => item.id.toString()}
                  contentContainerStyle={styles.postsList}
                  showsVerticalScrollIndicator={false}
                  style={{ flex: 1, backgroundColor: 'yellow' }} 
                />
              </>
            )}
          </BottomSheetView>
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  listItem: { // 기존 리스트 아이템 스타일 (현재는 postItem 사용)
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fafafa',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  // itemTitle: { // 기존 아이템 타이틀 (현재는 postItemTitle 사용)
  //   fontSize: 16,
  //   fontWeight: '500',
  // },
  itemSubtitle: { // 기존 아이템 서브타이틀 (현재는 itemDescription 사용)
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  list: {},
  row: {
    justifyContent: 'flex-start',
    marginBottom: ITEM_MARGIN,
  },
  image: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: 8,
    marginRight: ITEM_MARGIN,
    backgroundColor: '#eee',
  },
  itemImage: { // 기존 itemImage (현재는 itemImagePlaceholder 사용)
    width: 50,
    height: 50,
    borderRadius: 4,
    backgroundColor: '#ddd',
  },
  textContainer: {
    flexDirection: 'column'
  },
  imageContainer: {},
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadPostsButton: {
    position: 'absolute',
    top: 60, // 스크린샷과 유사하게 조정
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
    zIndex: 1, // 버튼이 지도 위에 오도록
  },
  loadPostsButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF', // 당근마켓 색상과 유사하게
    marginLeft: 5,
  },
  errorContainer: {
    position: 'absolute',
    top: 100, // 버튼 아래에 표시
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
    height: 28, // 마커 크기 조정 (당근마켓 스크린샷과 유사하게)
    width: 28,
    borderRadius: 14,
    backgroundColor: 'white', // 배경 흰색
    borderWidth: 1, // 테두리 추가
    borderColor: '#eee', // 연한 회색 테두리
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000', // 그림자 추가
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  innerMarker: {
    height: 16, // 내부 오렌지색 원 크기
    width: 16,
    borderRadius: 8,
    backgroundColor: 'orange', // 오렌지색
  },
  // Bottom Sheet 관련 스타일
  bottomSheetContentContainer: {
    flex: 1, // Added this line
    backgroundColor: '#f9f9f9', // 바텀 시트 배경색
  },
  postsList: {
    paddingHorizontal: 16,
    paddingBottom: 20, // 하단 여백 추가,
    flexGrow: 1
  },
  postItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, // 얇은 구분선
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
    // height: 100,
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
  itemRightSection: {
    alignItems: 'flex-end',
  },
  itemRating: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFD700', // 별점 색상
  },
  itemReviews: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
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
    bottom: 20, // 하단에 배치
    alignSelf: 'center',
    backgroundColor: '#ff7f00', // 당근마켓 주황색과 유사하게
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1, // 지도와 바텀 시트 사이에 오도록
  },
  toggleListButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
  },
  filterContainer: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  filterScrollView: {
    alignItems: 'center',
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 8,
  },
  filterButtonActive: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ff7f00',
    backgroundColor: '#fff7ed', // 활성 버튼 배경색
    marginRight: 8,
  },
  filterButtonText: {
    color: '#555',
    fontSize: 13,
  },
  filterButtonTextActive: {
    color: '#ff7f00',
    fontSize: 13,
    fontWeight: 'bold',
  },
});