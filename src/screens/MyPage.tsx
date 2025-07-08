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
  admin_dong: string; // admin_dong 필드 추가
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
        <View style={styles.postItemInfoRow}>
          <Text style={styles.postItemDong}>{item.admin_dong}</Text>
          <Text style={styles.postItemSeparator}>|</Text>
          <Text style={styles.postItemDate}>{new Date(item.created_at).toLocaleDateString('ko-KR')}</Text>
        </View>
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
        <View style={styles.userInfoDetails}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabelNickname}>{nickname || '정보 없음'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabelDong}>{adminDong || '정보 없음'}</Text>
          </View>
        </View>

        <View style={styles.divider} />

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
    backgroundColor: '#ffffff', // 배경색을 흰색으로 변경
  },
  container: {
    flex: 1,
    paddingHorizontal: 20, // 좌우 여백 조정
    paddingTop: 20, // 상단 여백 조정
    backgroundColor: '#ffffff', // 배경색을 흰색으로 변경
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
  userInfoDetails: {
    width: '100%', // 전체 너비 사용
    marginBottom: 20, // 구분선 위 간격
    paddingHorizontal: 10, // 좌우 패딩 추가
    paddingBottom: 10, // 하단 패딩 추가
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
  divider: { // 새로운 구분선 스타일
    height: 1, // 얇은 줄
    backgroundColor: '#e0e0e0', // 회색
    marginHorizontal: 0, // 컨테이너 패딩에 맞춰 0으로 설정
    marginBottom: 20, // 구분선 아래 "내가 쓴 글" 섹션과의 간격
  },
  sectionHeader: {
    fontSize: 20, // 섹션 헤더 크기 조정
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15, // 간격 늘림
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
    paddingHorizontal: 10, // 글 목록 좌우 패딩
    paddingBottom: 20,
    flexGrow: 1, // 컨텐츠가 적을 때도 FlatList가 전체 공간을 차지하도록
  },
  postItem: {
    flexDirection: 'row',
    backgroundColor: 'transparent', // 배경색 제거
    borderRadius: 0, // 둥근 모서리 제거
    paddingVertical: 12, // 상하 패딩 조정
    paddingHorizontal: 0, // 좌우 패딩 제거 (필요에 따라 조정)
    marginBottom: 0, // 아이템 사이 간격 제거
    shadowColor: 'transparent', // 그림자 제거
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    alignItems: 'center', // 세로 중앙 정렬
    borderBottomWidth: 1, // 구분선 추가
    borderBottomColor: '#eee', // 구분선 색상
  },
  postItemImage: {
    width: 65, // 이미지 크기 조정
    height: 65,
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
    marginBottom: 4, // 제목 아래 간격 늘림
    color: '#333',
  },
  postItemInfoRow: { // 동네와 날짜를 함께 표시하기 위한 새 스타일
    flexDirection: 'row',
    alignItems: 'center', // 이 부분으로 내용물들을 세로 중앙에 정렬
    // lineHeight를 명시적으로 설정하여 텍스트 높이를 통일
    lineHeight: 18, // 폰트 사이즈 12에 적당한 라인 높이
  },
  postItemDong: { // 동네 정보 스타일
    fontSize: 12,
    color: '#999',
    lineHeight: 18, // 폰트 사이즈 12에 적당한 라인 높이
  },
  postItemSeparator: { // 구분자 스타일
    fontSize: 12,
    color: '#999',
    marginHorizontal: 5, // 구분자 좌우 간격
    lineHeight: 18, // 폰트 사이즈 12에 적당한 라인 높이
  },
  postItemDate: {
    fontSize: 12,
    color: '#999',
    lineHeight: 18, // 폰트 사이즈 12에 적당한 라인 높이
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