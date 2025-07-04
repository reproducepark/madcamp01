import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, SafeAreaView, StyleSheet, FlatList, Image, Dimensions, ActivityIndicator } from 'react-native';
import { PostPayload,createPost } from '../../api/post';
import { UserPayload,OnboardResponse,createUser } from '../../api/user';
import { BASE_URL } from '@env';


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


// 탭 1에 해당하는 화면 컴포넌트
export default function TabOneScreen() {
  // const [user, setUser] = useState<OnboardResponse>;
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState<any>(null);
  const [error,   setError]   = useState<string|null>(null);

  const testUser = {
    nickname: 'skb',
    lat: 37.589498,  // 고려대
    lon: 127.032413
};

  // const runTestOnBoard = async () => {
  //   try {
  //     const onBoardRes = await createUser(testUser);
  //     console.log(onBoardRes);
  //     // return onBoardRes;
  //     setUser(onBoardRes);
  //   } catch (e: any) {

  //     console.error('Onboard 에러', e);
  //     console.log('⚠️ Onboard Axios config:', e.config);
  //     console.log('⚠️ Onbord Axios response:', e.response?.status, e.response?.data);

  //   }

    
  // };

  // const runTestPost = async (user:OnboardResponse) => {
  //   setLoading(true);
  //   setError(null);
  //   setResult(null);

  //   const testPost = {
  //     userId:  user.userId,
  //     content: '이것은 테스트용 글입니다.',
  //     lat:      user.lat,
  //     lon:      user.lon,
  //     // imageUri는 undefined로 두거나, 실제 선택한 URI를 넣어도 됩니다
  //     imageUri: undefined,
  //     adminDong: user.adminDong
  //   };
  //   try {
  //     const res = await createPost(testPost);
  //     setResult(res);
  //     console.log(res);
  //   } catch (e: any) {
  //     console.error('runTest 에러', e);
  //     console.log('⚠️ Axios config:', e.config);
  //     console.log('⚠️ Axios response:', e.response?.status, e.response?.data);
  //     setError(e.response?.data?.message || e.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // 3) 화면이 열리면 자동 실행
  useEffect(() => {
    (async () => {
      try {
        // 1) 온보딩
        const onBoardRes = await createUser(testUser);
        // setUser(onBoardRes);

        const testPost = {

          userId:  onBoardRes.userId,
          content: '이것은 테스트용 글입니다.',
          lat:      onBoardRes.lat,  
          lon:      onBoardRes.lon,
          imageUri: undefined,
          adminDong: onBoardRes.adminDong

        }

        // 2) 글 작성
        const postRes = await createPost(testPost);
      setResult(postRes);
    } catch (e: any) {
      console.error(e);
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  })();
}, []);


  return (
    // <SafeAreaView style={styles.safe}>

      <View style={styles.container}>
        <Text style={styles.text}>여기는 탭 1: 연락처 리스트</Text>
        <Text style={styles.subText}>연락처, 상품, 맛집 리스트 등을 보여줄 페이지입니다.</Text>


        <FlatList
          data={DATA}
          keyExtractor={item=>item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({item}) => (
            <View style={styles.listItem}>
              <View style={styles.textContainer}>
                <Text style={styles.itemTitle}>아이템 제목 {item.title}</Text>
                <Text style={styles.itemSubtitle}>아이템 설명{item.description}</Text>
              </View>
              <View style={styles.imageContainer}>
                <Image source={item.image} style={styles.itemImage} />
              </View>
            </View>
            

          )}
        />

      </View>
  );
    
  // );
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