// screens/TabOneScreen.tsx
import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, SafeAreaView, StyleSheet, FlatList, Image, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Post, createPost, getPostById, getNearbyPosts } from '../../api/post';
import { User, OnboardResponse, createUser } from '../../api/user';
import { BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, NavigationProp } from '@react-navigation/native';

// Import the specific parameter list for TabOne's stack
import { TabOneStackParamList } from '../navigation/TabOneStack'; // <--- NEW IMPORT

// WriteModal 컴포넌트 임포트
import { WriteModal } from '../components/WriteModal';

const { width } = Dimensions.get('window');

const initialData = [
  {
    id: '1',
    image: require('../../assets/adaptive-icon.png'),
    title: '맛집 A',
    description: '맛집 A입니다',
  },
  {
    id: '2',
    image: require('../../assets/favicon.png'),
    title: '카페 B',
    description: '카페 B입니다',
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
];


export function TabOneScreen() {
  // Use TabOneStackParamList for the navigation prop type
  const navigation = useNavigation<NavigationProp<TabOneStackParamList>>(); // <--- CHANGED TYPE
  const [modalVisible, setModalVisible] = useState(false);
  const [listData, setListData] = useState(initialData);

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
        const data = await getNearbyPosts(lat, lon);
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

  const handleAddItem = async (title: string, description: string, imageUri?: string) => {
    const userID = await AsyncStorage.getItem('userID');
    const userLat = await AsyncStorage.getItem('userLat');
    const userLon = await AsyncStorage.getItem('userLon');
    // const userAdminDong = await AsyncStorage.getItem('userAdminDong');

    if (!userID)        throw new Error('로그인이 필요합니다.');
    if (!userLat || !userLon) throw new Error('위치 정보가 없습니다.');
    // if (!userAdminDong) throw new Error('행정동 정보가 없습니다.');

    try {

      const postRes = await createPost({
        id: '',
        userId: userID,
        title: title,
        content : description,
        lat: Number(userLat),
        lon: Number(userLon),
        image_url: imageUri,
        adminDong: '',
        upperAdminDong: ''
      });
      console.log("Post created successfully:", postRes);

      const newItem = {
        id: postRes.id || String(listData.length + 1),
        image: imageUri ? {uri: imageUri} : require('../../assets/adaptive-icon.png'),
        title: title,
        description: description,
      };
      setListData([newItem, ...listData]);

    } catch(e:any) {
      console.error("Error creating post:", e);
    } finally {
      setModalVisible(false);
    }
  };

  const handleItemPress = (itemId: string) => {
    // Navigate to 'PostDetail' within the current stack
    console.log("Navigating to PostDetail with itemId:", itemId);
    navigation.navigate('PostDetail', { postId: itemId });
  };

  const renderItem = ({ item }: { item: typeof initialData[0] }) => (
    console.log(item),
    <TouchableOpacity style={styles.postItem} onPress={() => handleItemPress(item.id)}>
      <View style={[styles.itemContent, !item.image_url && styles.itemContentFullWidth]}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemDescription} numberOfLines={1}>{item.nickname}</Text>
        <Text style={styles.itemLocation}>{item.admin_dong}</Text>
      </View>
      {item.image_url && (
        <Image source={{ uri: item.image_url }} style={styles.itemImage} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.text}>여기는 탭 1: 리스트</Text>
        <Text style={styles.subText}>연락처, 상품, 맛집 리스트 등을 보여줄 페이지입니다.</Text>

        <FlatList
          data={listData}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={renderItem}
        />

        <TouchableOpacity
          style={styles.fab}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>

        <WriteModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSave={handleAddItem}
        />
      </View>
    </SafeAreaView>
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
    marginBottom: 20,
  },
  listContainer: {
    paddingHorizontal: 0,
    paddingVertical: 8,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fafafa',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },

  textContainer: {
    flexDirection: 'column',
    flex: 1,
  },
  imageContainer: {
    marginLeft: 10,
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    backgroundColor: '#f4511e',
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabText: {
    fontSize: 24,
    color: 'white',
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
    // paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#eee',
    marginLeft: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemContentFullWidth: {
    marginRight: 0,
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
});

