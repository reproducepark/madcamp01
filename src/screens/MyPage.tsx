// screens/MyPageScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator, FlatList, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native'; // useFocusEffect 임포트 추가

// 내가 쓴 글 목록을 가져오는 API 함수 임포트 (수정됨)
import { getPostsByUserId } from '../../api/post'; 

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

  // 사용자 정보 및 내가 쓴 글 불러오기 (useFocusEffect로 변경)
  useFocusEffect(
    useCallback(() => {
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
            const postsData = await getPostsByUserId(storedUserId);
            setUserPosts(postsData);
          } else {
            console.warn('User ID not found, cannot fetch user posts.');
            setUserPosts([]); // 사용자 ID가 없으면 글 목록을 비워줍니다.
          }

        } catch (e) {
          console.error('데이터 불러오기 실패:', e);
          Alert.alert('오류', '사용자 정보 또는 내가 쓴 글을 불러오는 데 실패했습니다.');
          setUserPosts([]); // 에러 발생 시 글 목록을 비워줍니다.
        } finally {
          setLoading(false);
          setPostsLoading(false);
        }
      };

      loadData();
      // 의존성 배열을 비워두면 컴포넌트 마운트 시 한 번, 그리고 화면 포커스 시마다 실행됩니다.
      // useCallback의 의존성 배열에 loadData() 내부에서 사용되는 변수가 있다면 추가해야 하지만,
      // 현재로서는 없으므로 빈 배열로 둡니다.
    }, []) 
  );

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
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: '#ffffff',
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
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 5,
  },
  infoLabelNickname: {
    fontSize: 26,
    color: 'black',
    fontWeight: 'bold',
  },
  infoLabelDong: {
    fontSize: 14,
    color: '#777',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 0,
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 20,
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
    backgroundColor: 'transparent',
    borderRadius: 0,
    paddingVertical: 12,
    paddingHorizontal: 0,
    marginBottom: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  postItemImage: {
    width: 65,
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
    marginBottom: 4,
    color: '#333',
  },
  postItemInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    lineHeight: 18,
  },
  postItemDong: {
    fontSize: 12,
    color: '#999',
    lineHeight: 18,
  },
  postItemSeparator: {
    fontSize: 12,
    color: '#999',
    marginHorizontal: 5,
    lineHeight: 18,
  },
  postItemDate: {
    fontSize: 12,
    color: '#999',
    lineHeight: 18,
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