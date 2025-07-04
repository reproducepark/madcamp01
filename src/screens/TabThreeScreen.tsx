// src/screens/TabThreeScreen.tsx

import React, {useState, useEffect} from 'react';
import { Text, View, ScrollView, SafeAreaView, StyleSheet, FlatList, Image, Dimensions, ActivityIndicator } from 'react-native';
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

  if (!region) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <MapView
      style={styles.map}
      provider={PROVIDER_GOOGLE}
      initialRegion={region}
      showsUserLocation
      showsMyLocationButton
    >
      {/* <Marker coordinate={region} title="내 위치" /> */}
    </MapView>
  );
}


// 하단 탭 네비게이터 생성
// const Tab = createBottomTabNavigator();

// export default function App() {
//   return (
//     // NavigationContainer는 전체 네비게이션 구조를 감싸야 합니다.
//     <NavigationContainer>
//       {/* Tab.Navigator가 실제 탭 UI를 렌더링합니다. */}
//       <Tab.Navigator
//         screenOptions={({ route }) => ({
//           // 각 탭에 아이콘을 설정합니다.
//           tabBarIcon: ({ focused, color, size }) => {
//             let iconName;

//             if (route.name === '연락처') {
//               iconName = focused ? 'people' : 'people-outline';
//             } else if (route.name === '갤러리') {
//               iconName = focused ? 'images' : 'images-outline';
//             } else if (route.name === '자유주제') {
//               iconName = focused ? 'star' : 'star-outline';
//             }

//             // Ionicons 컴포넌트를 사용하여 아이콘을 렌더링합니다.
//             return <Ionicons name={iconName} size={size} color={color} />;
//           },
//           // 활성 탭과 비활성 탭의 색상을 설정합니다.
//           tabBarActiveTintColor: 'tomato',
//           tabBarInactiveTintColor: 'gray',
//           // 탭 바의 스타일을 설정합니다.
//           tabBarStyle: {
//             backgroundColor: '#f8f8f8',
//           },
//           // 헤더의 스타일을 설정합니다.
//           headerStyle: {
//             backgroundColor: '#f4511e',
//           },
//           headerTintColor: '#fff',
//           headerTitleStyle: {
//             fontWeight: 'bold',
//           },
//         })}
//       >
//         {/* 각 탭 화면을 정의합니다. */}
//         <Tab.Screen name="연락처" component={TabOneScreen} />
//         <Tab.Screen name="갤러리" component={TabTwoScreen} />
//         <Tab.Screen name="자유주제" component={TabThreeScreen} />
//       </Tab.Navigator>
//     </NavigationContainer>
//   );
// }

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
  map: {
    flex: 1,
  },
  
});
