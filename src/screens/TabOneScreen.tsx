// screens/TabOneScreen.tsx
import React, { useState, useEffect } from 'react';
import { Text, View, SafeAreaView, StyleSheet, FlatList, Image, Dimensions, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'; // Alert import 추가
import { NewPost, NearByPostsResponse, createPost, getNearbyPosts } from '../../api/post';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, NavigationProp } from '@react-navigation/native';

// Import the specific parameter list for TabOne's stack
import { TabOneStackParamList } from '../navigation/TabOneStack';

// WriteModal 컴포넌트 임포트
import { WriteModal } from '../components/WriteModal';

export function TabOneScreen() {
  const navigation = useNavigation<NavigationProp<TabOneStackParamList>>();
  const [modalVisible, setModalVisible] = useState(false);
  const [listData, setListData] = useState<NearByPostsResponse[]>([]);
  const [loading, setLoading] = useState(true); // 로딩 상태 추가

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true); // 데이터 가져오기 시작 시 로딩 설정
        const rawLat = await AsyncStorage.getItem('userLat');
        const rawLon = await AsyncStorage.getItem('userLon');

        if (!rawLat || !rawLon) {
          console.error('위치 정보 없음: 먼저 위치를 받아 와야 합니다.');
          Alert.alert('오류', '위치 정보를 가져올 수 없습니다. 설정에서 위치 권한을 확인해주세요.');
          return;
        }
        const lat = Number(rawLat);
        const lon = Number(rawLon);

        const data = await getNearbyPosts(lat, lon);
        setListData(data.nearbyPosts);

      } catch (e: any) {
        console.error('근처 글 조회 실패:', e);
        Alert.alert('오류', '글을 불러오는 데 실패했습니다: ' + e.message);
      } finally {
        setLoading(false); // 데이터 가져오기 완료 시 로딩 해제
      }
    };

    fetchPosts();
  }, []);

  const handleAddItem = async (title: string, description: string, imageUri?: string) => {
    try {
      const userID = await AsyncStorage.getItem('userID');
      const userLat = await AsyncStorage.getItem('userLat');
      const userLon = await AsyncStorage.getItem('userLon');

      if (!userID) {
        throw new Error('로그인이 필요합니다.');
      }
      if (!userLat || !userLon) {
        throw new Error('위치 정보가 없습니다.');
      }

      const postRes = await createPost({
        userId: userID,
        title: title,
        content: description,
        lat: Number(userLat),
        lon: Number(userLon),
      });
      console.log("게시물 성공적으로 생성:", postRes);

    } catch (e: any) {
      console.error("게시물 생성 오류:", e);
      Alert.alert('오류', '게시물을 생성하는 데 실패했습니다: ' + e.message);
    } finally {
      setModalVisible(false);
    }
  };

  const handleItemPress = (itemId: number) => {
    console.log("게시물 상세 보기로 이동 (ID:", itemId, ")");
    navigation.navigate('PostDetail', { postId: itemId });
  };

  const renderItem = ({ item }: { item: NearByPostsResponse }) => (
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

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#f4511e" />
            <Text style={styles.loadingText}>글을 불러오는 중...</Text>
          </View>
        ) : (
          <FlatList
            data={listData}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listContainer}
            renderItem={renderItem}
            ListEmptyComponent={() => (
              <View style={styles.noPostsContainer}>
                <Text style={styles.noPostsText}>아직 작성된 글이 없어요!</Text>
                <Text style={styles.noPostsSubText}>새로운 글을 작성하여 소식을 공유해 보세요.</Text>
              </View>
            )}
          />
        )}

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
    flexGrow: 1,
  },
  listItem: { // 이 스타일은 현재 코드에서 사용되지 않는 것 같습니다.
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
  itemSubtitle: { // 이 스타일은 현재 코드에서 사용되지 않는 것 같습니다.
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  textContainer: { // 이 스타일은 현재 코드에서 사용되지 않는 것 같습니다.
    flexDirection: 'column',
    flex: 1,
  },
  imageContainer: { // 이 스타일은 현재 코드에서 사용되지 않는 것 같습니다.
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
  bottomSheetFlatList: { // 이 스타일은 현재 코드에서 사용되지 않는 것 같습니다.
    backgroundColor: '#f9f9f9',
  },
  postsListContent: { // 이 스타일은 현재 코드에서 사용되지 않는 것 같습니다.
    paddingBottom: 20,
    flexGrow: 1,
  },
  listHeaderContainer: { // 이 스타일은 현재 코드에서 사용되지 않는 것 같습니다.
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
  },
  listHeaderText: { // 이 스타일은 현재 코드에서 사용되지 않는 것 같습니다.
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
  },
  postItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
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
    paddingLeft: 20,
  },
  itemContentFullWidth: {
    marginRight: 0,
    paddingRight: 20,
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
    minHeight: 200,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
});