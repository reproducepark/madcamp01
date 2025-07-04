import React, {useState, useEffect} from 'react';
import { Text, View, ScrollView, SafeAreaView, StyleSheet, FlatList, Image, Dimensions, ActivityIndicator, TouchableOpacity } from 'react-native'; // Import TouchableOpacity
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; // Expo에서 제공하는 아이콘 라이브러리
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');
// 한 행에 3개씩 배치, 좌우 패딩 16씩, 아이템 간 간격 8씩
const ITEM_MARGIN = 8;
const ITEM_SIZE = (width - 16 * 2 - ITEM_MARGIN * 2) / 3;


const DATA = [
  {
    id: '1',
    image: require('../../assets/adaptive-icon.png'),
    title: '맛집 A',
    description: '맛집 A입니다'
  },
  {
    id: '2',
    image: require('../../assets/favicon.png'),
    title: '카페 B',
    description: '카페 B입니다'
  },
  {
    id: '3',
    image: require('../../assets/icon.png'),
    title: '풍경 C',
    description: '풍경 C입니다'
  },
  {
    id: '4',
    image: require('../../assets/splash-icon.png'),
    title: '전시 D',
    description: '전시 D입니다'
  },
  {
    id: '5',
    image: require('../../assets/splash-icon.png'),
    title: '전시 D',
    description: '전시 D입니다'
  },
  {
    id: '6',
    image: require('../../assets/splash-icon.png'),
    title: '전시 D',
    description: '전시 D입니다'
  },
  {
    id: '7',
    image: require('../../assets/splash-icon.png'),
    title: '전시 D',
    description: '전시 D입니다'
  },
  {
    id: '8',
    image: require('../../assets/splash-icon.png'),
    title: '전시 D',
    description: '전시 D입니다'
  },
];

export function TabThreeScreen() {
  const [region, setRegion] = useState<null | {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }>(null);

  useEffect(() => {
    (async () => {
      // 위치 권한 요청
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      // 현재 위치 받아오기
      const { coords } = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  const handleLoadPosts = () => {
    // 이 함수는 "이 지역의 글 불러오기" 버튼을 눌렀을 때 실행될 동작입니다.
    // 현재는 아무 동작도 하지 않습니다 (void).
    console.log("Loading posts for the current region...");
    // 여기에 해당 지역의 글을 불러오는 로직을 추가할 수 있습니다.
    // 예: API 호출, 데이터 필터링 등
  };

  if (!region) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.mapContainer}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton
      >
        {/* <Marker coordinate={region} title="내 위치" /> */}
      </MapView>

      <TouchableOpacity
        style={styles.loadPostsButton}
        onPress={handleLoadPosts}
      >
        <Text style={styles.loadPostsButtonText}>
          <Ionicons name="location-outline" size={16} color="#007AFF" /> 이 지역의 글 불러오기
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// 공통으로 사용할 스타일 시트
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // alignItems: 'center',
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
  listItem: {
    // width:'100%',
    flexDirection:'row',
    justifyContent:'space-between',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fafafa',
    marginBottom: 12,
    // 그림자 효과 (iOS)
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // 그림자 효과 (Android)
    elevation: 2,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  list: {
    // FlatList content padding bottom 추가 가능
  },
  row: {
    justifyContent: 'flex-start',
    marginBottom: ITEM_MARGIN,
  },
  image: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: 8,
    marginRight : ITEM_MARGIN,
    backgroundColor: '#eee',
  },
  itemImage: {
    width: 50,                    // 원하는 썸네일 크기 지정
    height: 50,
    borderRadius: 4,
    backgroundColor: '#ddd',
  },
  textContainer:{
    flexDirection:'column'
  },
  imageContainer: {
    // justifyContent:'flex-end'

  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapContainer: { // Added a container for MapView and the button
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadPostsButton: {
    position: 'absolute', // Position the button absolutely
    top: 20, // Adjust as needed
    alignSelf: 'center', // Center the button horizontally
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: 'row', // To align icon and text
    alignItems: 'center',
  },
  loadPostsButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF', // Example color
    marginLeft: 5, // Space between icon and text
  },
});