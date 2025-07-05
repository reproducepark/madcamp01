// screens/TabOneScreen.tsx
import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, SafeAreaView, StyleSheet, FlatList, Image, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import { PostPayload,createPost } from '../../api/post';
import { UserPayload,OnboardResponse,createUser } from '../../api/user';
import { BASE_URL } from '@env';


// WriteModal 컴포넌트 임포트
import { WriteModal } from '../components/WriteModal';

const { width } = Dimensions.get('window'); // Dimensions 사용

// 초기 데이터
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
  // ... 기타 데이터
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


// 탭 1에 해당하는 화면 컴포넌트
export function TabOneScreen() {
  // const [user, setUser] = useState<OnboardResponse>;
  const [modalVisible, setModalVisible] = useState(false);
  const [listData, setListData] = useState(initialData);
  // const [loading, setLoading] = useState(false);
  // const [result,  setResult]  = useState<any>(null);
  // const [error,   setError]   = useState<string|null>(null);

//   const testUser = {
//     nickname: 'skb'+Date.now(),
//     lat: 37.589498,  // 고려대
//     lon: 127.032413
// };

  // 3) 화면이 열리면 자동 실행
//   useEffect(() => {
//     (async () => {
//       try {
//         // 1) 온보딩
//         // const onBoardRes = await createUser(testUser);
//         // setUser(onBoardRes);

//         const testPost = {

//           userId:  onBoardRes.userId,
//           content: '이것은 테스트용 글입니다.',
//           lat:      onBoardRes.lat,  
//           lon:      onBoardRes.lon,
//           imageUri: undefined,
//           adminDong: onBoardRes.adminDong

//         }

//         // 2) 글 작성
//         const postRes = await createPost(testPost);
//       setResult(postRes);
//     } catch (e: any) {
//       console.error(e.config);
//       console.error(e.message);
//       console.error(e.request);
//       console.error(e.response);
//       setError(e.response?.data?.message || e.message);
//     } finally {
//       setLoading(false);
//     }
//   })();
// }, []);


  const handleAddItem = (title: string, description: string) => {
    const newItem = {
      id: String(listData.length + 1),
      image: require('../../assets/adaptive-icon.png'), // 기본 이미지
      title: title,
      description: description,
    };
    setListData([newItem, ...listData]); // 새 아이템을 목록 맨 앞에 추가
    setModalVisible(false);
  };

  const renderItem = ({ item }: { item: typeof initialData[0] }) => (
    <View style={styles.listItem}>
      <View style={styles.textContainer}>
        <Text style={styles.itemTitle}>아이템 제목: {item.title}</Text>
        <Text style={styles.itemSubtitle}>아이템 설명: {item.description}</Text>
      </View>
      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.itemImage} />
      </View>
    </View>
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

        {/* 글쓰기 버튼 (FAB) */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>

        {/* 글쓰기 모달 창 컴포넌트 */}
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
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
    backgroundColor: '#ddd',
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
});