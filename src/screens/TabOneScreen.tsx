// TabOneScreen.tsx 파일 수정
import React, { useState, useEffect, useCallback } from 'react';
import { Platform, StatusBar, Text, View, SafeAreaView, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { NearByPostsResponse, createPost, getNearbyPosts, getLikesCountByPostId } from '../../api/post'; // getLikesCountByPostId import
import { updateUserLocation } from '../../api/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

import { TabOneStackParamList } from '../navigation/TabOneStack';
import { WriteModal } from '../components/WriteModal';
import { CustomAlertModal } from '../components/CustomAlertModal';
import { CustomConfirmModal } from '../components/CustomConfirmModal';


// 사용할 색상 팔레트를 상수로 정의합니다.
const COLOR_PALETTE = {
  NAVY_BLUE: "#072ac8", // BLUE_DARK -> NAVY_BLUE
  SKY_BLUE: "#1e96fc", // BLUE_MEDIUM -> SKY_BLUE
  LIGHT_BLUE: "#a2d6f9", // BLUE_LIGHT -> LIGHT_BLUE
  GRAYISH_BROWN_LIGHT: "#6c757d", // MUSTARD_LIGHT -> GRAYISH_BROWN_LIGHT
  GRAYISH_BROWN_DARK: "#6c757d",  // MUSTARD_DARK -> GRAYISH_BROWN_DARK
  // 무채색은 그대로 유지
  WHITE: '#fff',
  BLACK: '#000',
  GRAY_DARK: '#333',
  GRAY_MEDIUM: '#555',
  GRAY_LIGHT: '#888',
  GRAY_VERY_LIGHT: '#999',
  BORDER_COLOR: '#e0e0e0',
  LIKE_COLOR: '#e71d36', // 좋아요 아이콘 색상
};


export function TabOneScreen() {
  const navigation = useNavigation<NavigationProp<TabOneStackParamList>>();
  const [modalVisible, setModalVisible] = useState(false);
  const [listData, setListData] = useState<NearByPostsResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isLocationRefreshing, setIsLocationRefreshing] = useState(false);
  
  // CustomConfirmModal 가시성 상태 (위치 새로고침 확인)
  const [isLocationConfirmModalVisible, setIsLocationConfirmModalVisible] = useState(false); 
  // CustomAlertModal 가시성 상태 (위치 새로고침 완료)
  const [isLocationUpdateAlertVisible, setIsLocationUpdateAlertVisible] = useState(false);
  const [locationUpdateMessage, setLocationUpdateMessage] = useState(''); // 위치 업데이트 메시지 상태

  const [currentAdminDong, setCurrentAdminDong] = useState<string | null>(null);

  // 좋아요 개수를 저장할 상태 추가
  const [likesCount, setLikesCount] = useState<{ [postId: number]: number }>({});

  const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const nineHoursInMilliseconds = 9 * 60 * 60 * 1000;
  const diffMinutes = Math.floor((now.getTime() - date.getTime() - nineHoursInMilliseconds ) / (1000 * 60));

  if (diffMinutes < 1) return '방금 전';
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}일 전`;
  
  // 일주일 이상 지난 경우, 원래 날짜 형식으로 표시
  return date.toLocaleDateString('ko-KR');
};

  useEffect(()=>{
    const loadAdminDong = async () => {
      try {
        const storedAdminDong = await AsyncStorage.getItem('userAdminDong');
        console.log('현재위치',storedAdminDong);
        if (storedAdminDong) {
          const parts = storedAdminDong.split(' ');
          if (parts.length >= 2) {
            setCurrentAdminDong(parts.slice(1).join(' '));
          } else {
            setCurrentAdminDong(storedAdminDong);
          }
        } else {
          setCurrentAdminDong(null);
        }
      } catch (e) {
        console.error('AsyncStorage에서 useradminDong 불러오기 실패:',e);
        setCurrentAdminDong('정보없음')
      }
    }
    loadAdminDong();
  },[]);

  // 좋아요 개수를 가져오는 함수
  const fetchLikesCount = useCallback(async (postId: number) => {
    try {
      const response = await getLikesCountByPostId(postId);
      setLikesCount(prevCounts => ({
        ...prevCounts,
        [postId]: response.likeCount,
      }));
    } catch (error) {
      console.error(`Error fetching likes count for post ${postId}:`, error);
      setLikesCount(prevCounts => ({
        ...prevCounts,
        [postId]: 0, // 오류 발생 시 0으로 설정 또는 다른 기본값 설정
      }));
    }
  }, []);


  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const rawLat = await AsyncStorage.getItem('userLat');
      const rawLon = await AsyncStorage.getItem('userLon');

      if (!rawLat || !rawLon) {
        console.error('위치 정보 없음: 먼저 위치를 받아 와야 합니다.');
        return;
      }
      const lat = Number(rawLat);
      const lon = Number(rawLon);

      const data = await getNearbyPosts(lat, lon);
      setListData(data.nearbyPosts);

      // 각 게시물에 대한 좋아요 개수 가져오기
      data.nearbyPosts.forEach((post: NearByPostsResponse) => {
        fetchLikesCount(post.id);
      });

    } catch (e: any) {
      console.error('근처 글 조회 실패:', e);
      Alert.alert('오류', '글을 불러오는 데 실패했습니다: ' + e.message);
    } finally {
      setLoading(false);
    }
  },[fetchLikesCount]);

  // useFocusEffect 훅을 사용하여 화면이 포커스될 때마다 fetchPosts 실행
  useFocusEffect(
    useCallback(() => {
      fetchPosts();
      return () => {
        // 화면이 블러(blur)될 때 필요한 클린업 작업 (선택 사항)
      };
    }, [fetchPosts])
  );

  const executeLocationRefresh = useCallback(async () => {
    setIsLocationRefreshing(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          '위치 권한 필요',
          '현재 위치를 새로고침하려면 위치 권한이 필요합니다. 앱 설정에서 권한을 허용해주세요.'
        );
        return;
      }

      const { coords } = await Location.getCurrentPositionAsync({});
      const userID = await AsyncStorage.getItem('userID');

      if (!userID) {
        Alert.alert('오류', '사용자 ID를 찾을 수 없습니다. 로그인이 필요합니다.');
        return;
      }

      const updateRes = await updateUserLocation({ userId: userID, lat: coords.latitude, lon: coords.longitude });

      const parts = updateRes.adminDong.split(' ');
      if (parts.length >= 2) {
        setCurrentAdminDong(parts.slice(1).join(' '));
      } else {
        setCurrentAdminDong(updateRes.adminDong);
      }
      await AsyncStorage.setItem('userLat', String(coords.latitude));
      await AsyncStorage.setItem('userLon', String(coords.longitude));
      await AsyncStorage.setItem('userAdminDong', updateRes.adminDong);

      // CustomAlertModal 사용
      setLocationUpdateMessage(`위치 정보가 '${updateRes.adminDong}'으로 업데이트 되었습니다.`);
      setIsLocationUpdateAlertVisible(true);

      fetchPosts();
    } catch (e: any) {
      console.error('위치 새로고침 오류:', e);
      Alert.alert('오류', '위치 정보를 새로고침하는 데 실패했습니다: ' + e.message);
    } finally {
      setIsLocationRefreshing(false);
    }
  }, [fetchPosts]);

  // handleLocationRefreshConfirmation에서 CustomConfirmModal 사용으로 변경
  const handleLocationRefreshConfirmation = useCallback(() => {
    setIsLocationConfirmModalVisible(true);
  }, []);

  const handleMyPagePress = useCallback(() => {
    navigation.navigate('MyPage');
  }, [navigation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  }, [fetchPosts]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerRightContainer}>
          {/* 상단 헤더의 새로고침 버튼은 기존 Alert 대신 즉시 실행되도록 유지 (또는 CustomConfirmModal 사용 고려) */}
          <TouchableOpacity
            onPress={executeLocationRefresh} // 이 버튼은 바로 새로고침 실행
            style={styles.headerButton}
            disabled={isLocationRefreshing}
          >
            {isLocationRefreshing ? (
              <ActivityIndicator size="small" color={COLOR_PALETTE.GRAYISH_BROWN_LIGHT} />
            ) : (
              <Ionicons name="refresh" size={24} color={COLOR_PALETTE.GRAYISH_BROWN_LIGHT} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
              onPress={handleMyPagePress}
              style={styles.headerButton}
          >
            <Ionicons name="person-circle" size={24} color={COLOR_PALETTE.GRAYISH_BROWN_DARK} />
          </TouchableOpacity>

        </View>
        
      ),
    });
  }, [navigation, executeLocationRefresh, isLocationRefreshing]);

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
        image_uri: imageUri,
      });
      console.log("게시물 성공적으로 생성:", postRes);

    } catch (e: any) {
      console.error("게시물 생성 오류:", e);
      Alert.alert('오류', '게시물을 생성하는 데 실패했습니다: ' + e.message);
    } finally {
      setModalVisible(false);
      fetchPosts();
    }
  };

  const handleItemPress = (itemId: number) => {
    console.log("게시물 상세 보기로 이동 (ID:", itemId, ")");
    navigation.navigate('PostDetail', { postId: itemId });
  };

  const renderItem = ({ item }: { item: NearByPostsResponse }) => (
    <TouchableOpacity style={styles.postItem} onPress={() => handleItemPress(item.id)}>
      <View style={styles.itemMainContent}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <View style={styles.nicknameContainer}>
          <Text style={styles.nicknameRight}>{item.nickname}</Text>
        </View>
        <Text style={styles.dateTimeLocation}>
          {formatRelativeTime(item.created_at)} · {item.admin_dong}
        </Text>
      </View>
      
      <View style={styles.rightSideContentContainer}>
        {item.image_url && (
          <Image source={{ uri: item.image_url }} style={styles.itemImage} />
        )}
        <View style={styles.likesCountContainer}>
          <Ionicons name="heart" size={16} color={COLOR_PALETTE.LIKE_COLOR} />
          <Text style={styles.likesCountText}>
            {likesCount[item.id] !== undefined ? likesCount[item.id] : '로딩중...'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.navContainer}>

        <View style={styles.locationInfoContainer}>
            <TouchableOpacity
              onPress={handleLocationRefreshConfirmation}
              style={styles.inlineRefreshButton}
              disabled={isLocationRefreshing}
            >
                <Text style={styles.textDong}>
                    {currentAdminDong || '위치 정보 로딩 중...'}
                </Text>
                {isLocationRefreshing ? (
                    <ActivityIndicator size="small" color={COLOR_PALETTE.GRAYISH_BROWN_DARK} style={styles.locationIcon} />
                ) : (
                    <Ionicons name="navigate-circle" size={20} color={COLOR_PALETTE.LIKE_COLOR} style={styles.locationIcon} />
                )}
            </TouchableOpacity>
        </View>

        
        
        <TouchableOpacity
              onPress={handleMyPagePress}
              style={styles.headerButton}
          >
            <Ionicons name="person-circle" size={35} color={COLOR_PALETTE.GRAYISH_BROWN_DARK} />
        </TouchableOpacity>

      </View>
      <View style={styles.container}>        

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLOR_PALETTE.GRAYISH_BROWN_DARK} />
            <Text style={styles.loadingText}>글을 불러오는 중...</Text>
          </View>
        ) : (
          <FlatList
            data={listData}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listContainer}
            renderItem={renderItem}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLOR_PALETTE.GRAYISH_BROWN_DARK} />
            }
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

        {/* 위치 새로고침 확인을 위한 CustomConfirmModal */}
        <CustomConfirmModal
          isVisible={isLocationConfirmModalVisible}
          title="위치 정보 새로고침"
          message="현재 위치 정보를 새로고침하시겠습니까?"
          onCancel={() => setIsLocationConfirmModalVisible(false)}
          onConfirm={() => {
            setIsLocationConfirmModalVisible(false); // 확인 후 모달 닫기
            executeLocationRefresh(); // 위치 새로고침 실행
          }}
          confirmText="확인"
          cancelText="취소"
        />

        {/* 위치 업데이트 완료를 위한 CustomAlertModal */}
        <CustomAlertModal
          isVisible={isLocationUpdateAlertVisible}
          title="위치 업데이트 완료"
          message={locationUpdateMessage} // 동적으로 메시지 전달
          onClose={() => setIsLocationUpdateAlertVisible(false)} // 모달 닫기
          confirmText="확인"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLOR_PALETTE.WHITE, // 변경: 흰색은 유지
  },
  navContainer: {
    flexDirection:'row',
    justifyContent:'space-between',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? ((StatusBar.currentHeight || 0) + 20) : 20,
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: COLOR_PALETTE.WHITE, // 변경: 흰색은 유지
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  textDong: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'left',
    paddingVertical: 0,
    lineHeight: 32,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subText: {
    fontSize: 16,
    color: COLOR_PALETTE.GRAY_LIGHT, // 변경: 무채색 유지
    textAlign: 'center',
    marginBottom: 20,
  },
  listContainer: {
    paddingHorizontal: 0,
    paddingVertical: 8,
    flexGrow: 1,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fafafa', // 변경: 무채색 유지
    marginBottom: 12,
    shadowColor: COLOR_PALETTE.BLACK, // 변경: 무채색 유지
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemSubtitle: {
    fontSize: 12,
    color: COLOR_PALETTE.GRAY_VERY_LIGHT, // 변경: 무채색 유지
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
    backgroundColor: COLOR_PALETTE.LIKE_COLOR, // 변경: 주황색 -> 진한 머스타드
    borderRadius: 28,
    elevation: 8,
    shadowColor: COLOR_PALETTE.BLACK, // 변경: 무채색 유지
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabText: {
    fontSize: 24,
    color: COLOR_PALETTE.WHITE, // 변경: 흰색은 유지
  },
  postItem: {
    flexDirection: 'row',
    alignItems: 'flex-end', // 모든 항목의 하단을 정렬
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLOR_PALETTE.BORDER_COLOR, // 변경: 무채색 유지
    backgroundColor: COLOR_PALETTE.WHITE, // 변경: 흰색은 유지
  },
  itemMainContent: { // 텍스트 콘텐츠를 위한 새로운 컨테이너
    flex: 1,
    justifyContent: 'space-between', // 내부 콘텐츠를 위아래로 분산
    minHeight: 70, // 이미지 높이에 맞춰 최소 높이 설정 (이미지가 없을 때도 레이아웃 유지)
  },
  rightSideContentContainer: { // 이미지와 좋아요 개수를 감싸는 컨테이너
    marginLeft: 12,
    alignItems: 'flex-end', // 이 컨테이너 내의 자식 요소들을 오른쪽으로 정렬
    justifyContent: 'flex-end', // 세로 공간이 남으면 콘텐츠를 아래로 정렬
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#eee', // 변경: 무채색 유지
    marginBottom: 4, // 이미지와 좋아요 개수 사이 간격
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 13,
    color: COLOR_PALETTE.GRAY_MEDIUM, // 변경: 무채색 유지
    marginBottom: 4,
  },
  itemLocation: {
    fontSize: 12,
    color: COLOR_PALETTE.GRAY_VERY_LIGHT, // 변경: 무채색 유지
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
    color: COLOR_PALETTE.GRAY_MEDIUM, // 변경: 무채색 유지
    marginBottom: 5,
  },
  noPostsSubText: {
    fontSize: 14,
    color: COLOR_PALETTE.GRAY_LIGHT, // 변경: 무채색 유지
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
    color: COLOR_PALETTE.GRAY_MEDIUM, // 변경: 무채색 유지
  },
  adminDongText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLOR_PALETTE.GRAYISH_BROWN_DARK, // 변경: 주황색 -> 진한 머스타드
    textAlign: 'center',
    marginBottom: 10,
  },
  headerButton: {
    marginRight: 15,
    padding: 5,
  },
  inlineRefreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
  },
  locationIcon: {
    marginLeft: 5,
  },
  headerRightContainer: {
    flexDirection: 'row',
    marginRight: 5,
  },
  locationInfoContainer:{
    flexDirection:'row',
    alignItems:'center',
  },
  nicknameRight: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLOR_PALETTE.LIKE_COLOR, // 변경: 주황색 -> 밝은 머스타드
  },
  nicknameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom:5,
  },
  metaInfoContainer: { // 이 스타일은 더 이상 사용되지 않지만, 혹시 모를 참조를 위해 남겨둡니다.
    flexDirection: 'row', 
    justifyContent: 'flex-start', 
    alignItems: 'center',
    marginTop: 4,
  },
  dateTimeLocation: {
    fontSize: 12,
    color: COLOR_PALETTE.GRAY_VERY_LIGHT, // 변경: 무채색 유지
  },
  likesCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likesCountText: {
    fontSize: 12,
    color: COLOR_PALETTE.GRAYISH_BROWN_LIGHT, // 좋아요 아이콘과 같은 색상
    marginLeft: 4,
  },
});