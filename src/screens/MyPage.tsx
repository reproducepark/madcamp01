// screens/MyPageScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator, FlatList, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';

// 내가 쓴 글 목록을 가져오는 API 함수 임포트 (수정됨)
import { getPostsByUserId } from '../../api/post'; // 이 함수를 post.ts에서 가져옵니다.

// 내가 쓴 글 아이템의 타입 정의 (api/post.ts의 PostsbyUserIdResponse와 일치하도록 업데이트)
interface UserPost {
  id: number;
  title: string;
  image_url: string | null; // 이미지 URL은 null일 수도 있습니다.
  created_at: string; // 게시물 생성 시간
  admin_dong: string;
  nickname: string;
  // content 필드는 PostsbyUserIdResponse에 없으므로 제거하거나 필요에 따라 추가
}

// 앱의 최상위 네비게이션 스택에 대한 타입 정의입니다.
export type RootStackParamList = {
  Onboarding: undefined;
  TabNavigator: undefined;
  MyPage: undefined;
  PostDetail: { postId: number }; // 내가 쓴 글 클릭 시 상세 페이지로 이동
};

export function MyPageScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [nickname, setNickname] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null); // userId는 불러오지만 화면에 직접 표시하지 않음
  const [adminDong, setAdminDong] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // 사용자 정보 로딩 상태
  const [postsLoading, setPostsLoading] = useState<boolean>(true); // 내 글 로딩 상태
  const [userPosts, setUserPosts] = useState<UserPost[]>([]); // 내가 쓴 글 목록 상태

  // 사용자 정보 및 내가 쓴 글 불러오기
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setPostsLoading(true);
      try {
        const storedNickname = await AsyncStorage.getItem('userNickname');
        const storedUserId = await AsyncStorage.getItem('userID');
        const storedAdminDong = await AsyncStorage.getItem('userAdminDong');

        setNickname(storedNickname);
        setUserId(storedUserId);

        if (storedAdminDong) {
          const parts = storedAdminDong.split(' ');
          if (parts.length >= 2) {
            setAdminDong(parts.slice(1).join(' '));
          } else {
            setAdminDong(storedAdminDong);
          }
        }

        // 내가 쓴 글 불러오기
        if (storedUserId) {
          const postsData = await getPostsByUserId(storedUserId); // getUserPosts 대신 getPostsByUserId 호출
          setUserPosts(postsData); // 반환된 데이터는 이미 배열이므로 바로 설정
        } else {
          console.warn('User ID not found, cannot fetch user posts.');
        }

      } catch (e) {
        console.error('데이터 불러오기 실패:', e);
        Alert.alert('오류', '사용자 정보 또는 내가 쓴 글을 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
        setPostsLoading(false);
      }
    };

    loadData();
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  // 내가 쓴 글 아이템 렌더링 함수
  const renderUserPostItem = ({ item }: { item: UserPost }) => (
    <TouchableOpacity style={styles.postItem} onPress={() => navigation.navigate('PostDetail', { postId: item.id })}>
      {item.image_url && (
        <Image source={{ uri: item.image_url }} style={styles.postItemImage} />
      )}
      <View style={styles.postItemContent}>
        <Text style={styles.postItemTitle}>{item.title}</Text>
        {/* PostsbyUserIdResponse에는 content 필드가 없으므로 주석 처리하거나 필요에 따라 조정 */}
        {/* <Text style={styles.postItemDescription} numberOfLines={2}>{item.content}</Text> */}
        <Text style={styles.postItemDate}>{new Date(item.created_at).toLocaleDateString('ko-KR')}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f4511e" />
          <Text style={styles.loadingText}>사용자 정보를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* 사용자 정보 카드 */}
        {/* 기존 infoCard 스타일 대신 userInfoDetails를 직접 사용 */}
        <View style={styles.userInfoDetails}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabelNickname}>{nickname || '정보 없음'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabelDong}>{adminDong || '정보 없음'}</Text>
          </View>
        </View>

        {/* 내가 쓴 글 섹션 */}
        <Text style={styles.sectionHeader}>내가 쓴 글</Text>
        {postsLoading ? (
          <View style={styles.postsLoadingContainer}>
            <ActivityIndicator size="small" color="#f4511e" />
            <Text style={styles.loadingText}>글 목록을 불러오는 중...</Text>
          </View>
        ) : (
          <FlatList
            data={userPosts}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderUserPostItem}
            contentContainerStyle={styles.postsListContainer}
            ListEmptyComponent={() => (
              <View style={styles.noPostsContainer}>
                <Text style={styles.noPostsText}>아직 작성한 글이 없어요.</Text>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20, // 좌우 여백 조정
    paddingTop: 20,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
  },
  // infoCard 스타일 제거
  // icon: { // 아이콘을 사용하지 않으므로 주석 처리
  //   marginRight: 20,
  // },
  userInfoDetails: {
    width: '100%', // 전체 너비 사용
    marginBottom: 20, // "내가 쓴 글" 섹션과의 간격
    paddingHorizontal: 10, // 좌우 패딩 추가
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 5, // 정보 행 사이 간격 줄임
  },
  infoLabelNickname: {
    fontSize: 26, // 닉네임 크기 조정
    color: 'black',
    fontWeight: 'bold',
  },
  infoLabelDong: {
    fontSize: 14, // 동네 정보 크기 조정
    color: '#777',
  },
  infoValue: {
    fontSize: 18,
    color: '#333',
  },
  sectionHeader: {
    fontSize: 20, // 섹션 헤더 크기 조정
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10, // 간격 줄임
    alignSelf: 'flex-start',
    marginLeft: 10,
  },
  postsLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 100,
  },
  postsListContainer: {
    width: '100%',
    paddingHorizontal: 10,
    paddingBottom: 20,
    flexGrow: 1,
    flex: 1,
  },
  postItem: {
    flexDirection: 'row',
    backgroundColor: 'transparent', // 배경색 제거
    borderRadius: 0, // 둥근 모서리 제거
    paddingVertical: 10, // 상하 패딩 조정
    paddingHorizontal: 0, // 좌우 패딩 제거 (필요에 따라 조정)
    marginBottom: 0, // 아이템 사이 간격 제거
    shadowColor: 'transparent', // 그림자 제거
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    alignItems: 'center',
    borderBottomWidth: 1, // 구분선 추가
    borderBottomColor: '#eee',
  },
  postItemImage: {
    width: 60, // 이미지 크기 조정
    height: 60,
    borderRadius: 8,
    marginRight: 15,
    backgroundColor: '#eee',
    resizeMode: 'cover',
  },
  postItemContent: {
    flex: 1,
  },
  postItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2, // 제목 아래 간격 줄임
    color: '#333',
  },
  postItemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  postItemDate: {
    fontSize: 12,
    color: '#999',
  },
  noPostsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 100,
  },
  noPostsText: {
    fontSize: 16,
    color: '#777',
  },
});