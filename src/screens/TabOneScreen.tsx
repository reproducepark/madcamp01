// screens/TabOneScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, SafeAreaView, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native'; // Alert import 추가
import { NearByPostsResponse, createPost, getNearbyPosts } from '../../api/post';
import { updateUserLocation } from '../../api/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

// Import the specific parameter list for TabOne's stack
import { TabOneStackParamList } from '../navigation/TabOneStack';

// WriteModal 컴포넌트 임포트
import { WriteModal } from '../components/WriteModal';

export function TabOneScreen() {
  const navigation = useNavigation<NavigationProp<TabOneStackParamList>>();
  const [modalVisible, setModalVisible] = useState(false);
  const [listData, setListData] = useState<NearByPostsResponse[]>([]);
  const [loading, setLoading] = useState(true); // 로딩 상태 추가
  const [refreshing, setRefreshing] = useState(false);
  const [isLocationRefreshing, setIsLocationRefreshing] = useState(false); // 위치 새로고침 로딩 상태 추가
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

  const [currentAdminDong, setCurrentAdminDong] = useState<string | null>(null); // 👈 현재 사용자 동 상태 추가



  useEffect(()=>{
    const loadAdminDong = async () => {
      try {
        const storedAdminDong = await AsyncStorage.getItem('userAdminDong');
        console.log('현재위치',storedAdminDong);
        // console.log(await AsyncStorage.getItem('nickname'));
        if (storedAdminDong) {
          const parts = storedAdminDong.split(' ');
          if (parts.length >= 2) {
            // 첫 번째 부분(시/도)을 제외하고 나머지를 다시 조인합니다.
            setCurrentAdminDong(parts.slice(1).join(' '));
          } else {
            // 예상치 못한 형식일 경우 전체를 사용하거나 기본값 설정
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

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true); // 데이터 가져오기 시작 시 로딩 설정
      const rawLat = await AsyncStorage.getItem('userLat');
      const rawLon = await AsyncStorage.getItem('userLon');

      if (!rawLat || !rawLon) {
        console.error('위치 정보 없음: 먼저 위치를 받아 와야 합니다.');
        // Alert.alert('오류', '위치 정보를 가져올 수 없습니다. 설정에서 위치 권한을 확인해주세요.');
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
  },[]);

  // 위치 새로고침 함수 추가
  const executeLocationRefresh = useCallback(async () => {
  setIsLocationRefreshing(true); // 로딩 시작
  try {
    // 1. 위치 권한 요청
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        '위치 권한 필요',
        '현재 위치를 새로고침하려면 위치 권한이 필요합니다. 앱 설정에서 권한을 허용해주세요.'
      );
      return;
    }

    // 2. 현재 위치 가져오기
    const { coords } = await Location.getCurrentPositionAsync({});
    const userID = await AsyncStorage.getItem('userID'); // 사용자 ID 필요

    if (!userID) {
      Alert.alert('오류', '사용자 ID를 찾을 수 없습니다. 로그인이 필요합니다.');
      return;
    }

    // 3. 서버에 위치 업데이트 및 행정동 정보 요청
    const updateRes = await updateUserLocation({ userId: userID, lat: coords.latitude, lon: coords.longitude });

    const parts = updateRes.adminDong.split(' ');
    if (parts.length >= 2) {
      setCurrentAdminDong(parts.slice(1).join(' '));
    } else {
      setCurrentAdminDong(updateRes.adminDong);
    }
    await AsyncStorage.setItem('userLat', String(coords.latitude)); // AsyncStorage 업데이트
    await AsyncStorage.setItem('userLon', String(coords.longitude)); // AsyncStorage 업데이트
    // 👈 AsyncStorage 키를 'adminDong'으로 통일
    await AsyncStorage.setItem('userAdminDong', updateRes.adminDong);

    Alert.alert('알림', `위치 정보가 '${updateRes.adminDong}'으로 업데이트되었습니다.`);
    fetchPosts(); // 위치 업데이트 후 게시물 목록 새로고침
  } catch (e: any) {
    console.error('위치 새로고침 오류:', e);
    Alert.alert('오류', '위치 정보를 새로고침하는 데 실패했습니다: ' + e.message);
  } finally {
    setIsLocationRefreshing(false); // 로딩 종료
  }
}, [fetchPosts]);

  const handleLocationRefreshConfirmation = useCallback(() => {
    Alert.alert(
      '위치 정보 새로고침',
      '현재 위치 정보를 새로고침하시겠습니까?',
      [
        {
          text: '취소',
          onPress: () => setIsConfirmModalVisible(false), // Alert.alert 닫힘
          style: 'cancel',
        },
        {
          text: '확인',
          onPress: () => {
            setIsConfirmModalVisible(false); // Alert.alert 닫힘
            executeLocationRefresh(); // 확인 시 실제 새로고침 로직 실행
          },
        },
      ],
      { cancelable: true }
    );
    // setIsConfirmModalVisible(true); // Alert.alert를 사용하므로 이 상태는 직접적으로 필요 없음
  }, [executeLocationRefresh]); // executeLocationRefresh가 의존성이므로 포함

  const handleMyPagePress = useCallback(() => {
    // 'MyPage'는 네비게이션 스택에 정의된 라우트 이름이어야 합니다.
    // 필요에 따라 다른 라우트 이름으로 변경하세요.
    navigation.navigate('MyPage');
  }, [navigation]);


  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  }, [fetchPosts]);

  // 상단바 버튼 설정 (기존)
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerRightContainer}>

          <TouchableOpacity
          onPress={executeLocationRefresh}
          style={styles.headerButton}
          disabled={isLocationRefreshing} // 로딩 중에는 버튼 비활성화
          >
            {isLocationRefreshing ? (
              <ActivityIndicator size="small" color="#f4511e" /> // 로딩 중 스피너 표시
            ) : (
              <Ionicons name="refresh" size={24} color="#f4511e" /> // 새로고침 아이콘
            )}
          </TouchableOpacity>
          <TouchableOpacity
              onPress={handleMyPagePress}
              style={styles.headerButton} // 동일한 스타일 사용 또는 myPageButton 스타일 추가
          >
            <Ionicons name="person-circle" size={24} color="#f4511e" /> {/* 마이페이지 아이콘 */}
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
        image_uri: imageUri, // 이미지 URI가 있을 경우에만 포함
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
      <View style={styles.navContainer}>

        <View style={styles.locationInfoContainer}>
          <Text style={styles.textDong}>
          {currentAdminDong || '위치 정보 로딩 중...'}
        
          </Text>
          <TouchableOpacity
              onPress={handleLocationRefreshConfirmation}
              style={styles.inlineRefreshButton}
              disabled={isLocationRefreshing} // 로딩 중에는 버튼 비활성화
            >
              {isLocationRefreshing ? (
                <ActivityIndicator size="small" color="#f4511e" />
              ) : (
                <Ionicons name="locate-outline" size={25} color="#f4511e" /> 
              )}
            </TouchableOpacity>
        </View>

        
        
        <TouchableOpacity
              onPress={handleMyPagePress}
              style={styles.headerButton} // 동일한 스타일 사용 또는 myPageButton 스타일 추가
          >
            <Ionicons name="person-circle" size={35} color="#f4511e" />
        </TouchableOpacity>

      </View>
      <View style={styles.container}>        

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
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  navContainer: {
    flexDirection:'row',
    justifyContent:'space-between',
    padding: 20, 
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  textDong: {
    fontSize: 24,
    fontWeight: 'bold',
    // marginBottom: 10,
    marginLeft: 10,
    textAlign: 'left',
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
  adminDongText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f4511e',
    textAlign: 'center',
    marginBottom: 10,
  },
  headerButton: {
    marginRight: 15,
    padding: 5,
  },
  inlineRefreshButton: {
    paddingLeft:5,
  },
  headerRightContainer: {
    flexDirection: 'row',
    marginRight: 5, // 전체 컨테이너의 오른쪽 여백
  },
  locationInfoContainer:{
    flexDirection:'row',
    alignItems:'center',
  }
});