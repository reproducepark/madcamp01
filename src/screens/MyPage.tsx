// screens/MyPageScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator, FlatList, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';

// 내가 쓴 글 목록을 가져오는 API 함수 임포트 (새로 추가될 함수)
// import { getUserPosts } from '../../api/post'; // 이 함수가 post.ts에 추가되어야 합니다.

// 내가 쓴 글 아이템의 타입 정의
interface UserPost {
  id: number;
  title: string;
  content: string;
  image_url?: string;
  created_at: string; // 게시물 생성 시간
  // 필요한 다른 필드들을 여기에 추가하세요 (예: likes, comments_count 등)
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
        // if (storedUserId) {
        //   const postsData = await getUserPosts(storedUserId);
        //   setUserPosts(postsData.userPosts);
        // } else {
        //   console.warn('User ID not found, cannot fetch user posts.');
        // }

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
        <Text style={styles.postItemDescription} numberOfLines={2}>{item.content}</Text>
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
        <View style={styles.infoCard}>
          {/* <Ionicons name="person-circle-outline" size={60} color="#f4511e" style={styles.icon} /> */}
          {/* 닉네임과 동네 정보를 담는 컨테이너 */}
          <View style={styles.userInfoDetails}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabelNickname}>{nickname || '정보 없음'}</Text>
              {/* <Text style={styles.infoValue}></Text> */}
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabelDong}>{adminDong || '정보 없음'}</Text>
              {/* <Text style={styles.infoValue}></Text> */}
            </View>
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
    alignItems: 'center',
    padding: 20,
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
  infoCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row', // 👈 아이콘과 텍스트 컨테이너를 가로로 배열
    alignItems: 'center', // 👈 세로 중앙 정렬
    justifyContent: 'flex-start', // 👈 시작 지점부터 배열
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  icon: {
    marginRight: 20, // 👈 아이콘과 텍스트 사이 간격
    // marginBottom: 0, // 👈 기존 스타일에서 필요 없어진 속성 제거
  },
  userInfoDetails: { // 👈 닉네임과 동네 정보를 담는 새로운 컨테이너
    flex: 1, // 남은 공간을 모두 차지하여 텍스트가 오른쪽으로 확장되도록 함
  },
  infoRow: { // 👈 각 정보(라벨+값)를 한 줄에 배열
    flexDirection: 'row',
    justifyContent: 'flex-start', // 👈 라벨은 왼쪽, 값은 오른쪽으로 정렬
    alignItems: 'center', // 텍스트 세로 중앙 정렬
    marginBottom: 10, // 각 정보 줄 사이의 간격
  },
  infoLabelNickname: {
    fontSize: 30,
    color: 'black',
    fontWeight: 'bold',
    // marginTop: 5, // 👈 infoRow가 간격을 관리하므로 필요 없음
    // marginBottom: 0, // 👈 infoRow가 간격을 관리하므로 필요 없음
  },
  infoLabelDong: {
    fontSize: 16,
    color: '#777',
    fontWeight: 'bold',
    // marginTop: 0, // 👈 infoRow가 간격을 관리하므로 필요 없음
    // marginBottom: 0, // 👈 infoRow가 간격을 관리하므로 필요 없음
  },
  infoValue: {
    fontSize: 18,
    color: '#333',
    // marginBottom: 0, // 👈 infoRow가 간격을 관리하므로 필요 없음
    // textAlign: 'center', // 👈 infoRow의 justifyContent가 관리하므로 필요 없음
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
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
  },
  postItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    alignItems: 'center',
  },
  postItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
    backgroundColor: '#eee',
  },
  postItemContent: {
    flex: 1,
  },
  postItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  postItemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
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
