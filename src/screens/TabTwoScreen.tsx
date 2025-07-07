// screens/TabTwoScreen.tsx
import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, SafeAreaView, StyleSheet, FlatList, Image, Dimensions, ActivityIndicator, TouchableOpacity } from 'react-native';
import { NavigationContainer, useNavigation, NavigationProp } from '@react-navigation/native'; // useNavigation, NavigationProp 임포트
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Post, NearByPostsUpperResponse,getNearbyPostsUpper, NearByPostsResponse } from '../../api/post';

import { TabTwoStackParamList } from '../navigation/TabTwoStack'; // TabTwoStackParamList 임포트

const { width } = Dimensions.get('window');
const ITEM_MARGIN = 8;
const ITEM_SIZE = (width - 16 * 2 - ITEM_MARGIN * 2) / 3;


// const initialData: Post[] = [
//   {
//     postId: '5000',
//     userId: 'dummy',
//     imageUri: require('../../assets/adaptive-icon.png'),
//     title: '맛집 A',
//     content: '맛집 A입니다',
//     lat: 37.589558,
//     lon: 127.032499,
//     adminDong:'서울특별시 성북구 안암동',
//     upperAdminDong: '서울특별시 성북구'
//   },
//   {
//     postId: '5001',
//     userId: 'dummy',
//     imageUri: require('../../assets/favicon.png'),
//     title: '카페 B',
//     content: '카페 B입니다',
//     lat: 37.589558,
//     lon: 127.032499,
//     adminDong:'서울특별시 성북구 안암동',
//     upperAdminDong: '서울특별시 성북구'
//   },
//   {
//     postId: '5002',
//     userId: 'dummy',
//     imageUri: require('../../assets/icon.png'),
//     title: '풍경 C',
//     content: '풍경 C입니다',
//     lat: 37.589558,
//     lon: 127.032499,
//     adminDong:'서울특별시 성북구 안암동',
//     upperAdminDong: '서울특별시 성북구'
//   },
//   {
//     postId: '5003',
//     userId: 'dummy',
//     imageUri: require('../../assets/splash-icon.png'),
//     title: '전시 D',
//     content: '전시 D입니다',
//     lat: 37.589558,
//     lon: 127.032499,
//     adminDong:'서울특별시 성북구 안암동',
//     upperAdminDong: '서울특별시 성북구'
//   },
//   {
//     postId: '5004',
//     userId: 'dummy',
//     imageUri: require('../../assets/splash-icon.png'),
//     title: '전시 D',
//     content: '전시 D입니다',
//     lat: 37.589558,
//     lon: 127.032499,
//     adminDong:'서울특별시 성북구 안암동',
//     upperAdminDong: '서울특별시 성북구'
//   },
//   {
//     postId: '5005',
//     userId: 'dummy',
//     imageUri: require('../../assets/splash-icon.png'),
//     title: '전시 D',
//     content: '전시 D입니다',
//     lat: 37.589558,
//     lon: 127.032499,
//     adminDong:'서울특별시 성북구 안암동',
//     upperAdminDong: '서울특별시 성북구'
//   },
//   {
//     postId: '5006',
//     userId: 'dummy',
//     imageUri: require('../../assets/splash-icon.png'),
//     title: '전시 D',
//     content: '전시 D입니다',
//     lat: 37.589558,
//     lon: 127.032499,
//     adminDong:'서울특별시 성북구 안암동',
//     upperAdminDong: '서울특별시 성북구'
//   },
//   {
//     postId: '5008',
//     userId: 'dummy',
//     imageUri: require('../../assets/splash-icon.png'),
//     title: '전시 D',
//     content: '전시 D입니다',
//     lat: 37.589558,
//     lon: 127.032499,
//     adminDong:'서울특별시 성북구 안암동',
//     upperAdminDong: '서울특별시 성북구'
//   },
// ];

interface ListItem {
  postId:      string;
  imageSource: any;   // ImageSourcePropType
  title:       string;
  description: string;
}

// 탭 2에 해당하는 화면 컴포넌트
export function TabTwoScreen() {
  // useNavigation 훅을 사용하여 TabTwoStackParamList 타입을 지정합니다.
  const navigation = useNavigation<NavigationProp<TabTwoStackParamList>>();
  const [listData, setListData] = useState<Post[]>([]);

  const handleItemPress = (itemId: string) => {
    console.log("갤러리 아이템 클릭됨:", itemId);
    // PostDetail 화면으로 이동하면서 postId를 파라미터로 전달합니다.
    navigation.navigate('PostDetail', { postId: itemId });
  };

  useEffect(() => {
    (async () => {
      try {
        // 1) 로컬에 저장된 좌표 꺼내기
        const rawLat = await AsyncStorage.getItem('userLat');
        const rawLon = await AsyncStorage.getItem('userLon');
        if (!rawLat || !rawLon) {
          console.error('위치 정보 없음', '먼저 위치를 받아 와야 합니다.');
          return;
        }
        const lat = Number(rawLat);
        const lon = Number(rawLon);

        // 2) 근처 글만 조회
        const data = await getNearbyPostsUpper(lat, lon);
        // console.log('여기dlqdksfjlfeiwjs',data.nearbyPosts);

        // const items: ListItem[] = data.nearbyPosts.map((data:NearByPostsResponse:) => ({
        //   postId:      data.nearbyPosts.id.toString(),
        //   imageSource: post.image_url
        //     ? { uri: post.image_url }
        //     : require('../../assets/adaptive-icon.png'),
        //   title:       post.title,
        //   description: `${post.nickname} · ${post.created_at}`,
        // }));

      //   const newItem = {
      //     id: data.id || String(listData.length + 1),
      //     image: imageUri ? {uri: imageUri} : require('../../assets/adaptive-icon.png'),
      //     title: title,
      //     description: description,
      //   };
      // setListData([newItem, ...listData]);
        // console.log('여기',data);
        // data.nearbyPosts가 Post[] 타입이라고 가정

        // 3) listData에 nearbyPosts만 넣기
        setListData(data.nearbyPosts);

      } catch (e: any) {
        console.error('근처 글 조회 실패', e);
        // Alert.alert('오류', e.message);
      // } finally {
      //   setLoading(false);
      // }
      }
    })();
  }, []);

  return (
    // SafeAreaView를 사용하여 내용이 노치/상태 표시줄 영역을 침범하지 않도록 합니다.
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={listData}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          // console.log(item),
          // console.log(item.id),
          console.log(item.image_url),
          <TouchableOpacity onPress={() => handleItemPress(item.id)}>
            <Image source={item.image_url} style={styles.image} />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
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
    padding: 20, // 이 padding은 SafeAreaView 내부의 내용에 영향을 줍니다.
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
    paddingHorizontal: 16, // 좌우 여백 추가
    paddingTop: 0, // SafeAreaView가 상단 여백을 처리하므로 여기서는 0으로 설정
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