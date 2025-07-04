import React from 'react';
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


// 탭 2에 해당하는 화면 컴포넌트
export default function TabTwoScreen() {
  return (
    <View style={styles.container}>
      {/* <Text style={styles.text}>여기는 탭 2: 이미지 갤러리</Text>
      <Text style={styles.subText}>20개 이상의 이미지를 보여줄 갤러리 페이지입니다.</Text> */}

      <FlatList
        data={DATA}
        keyExtractor={(_, idx) => idx.toString()}
        numColumns={3}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <Image source={item.image} style={styles.image} />
        )}
      />
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

  }
  
});