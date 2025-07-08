// screens/TabOneScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, SafeAreaView, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { NearByPostsResponse, createPost, getNearbyPosts } from '../../api/post';
import { updateUserLocation } from '../../api/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native'; // useFocusEffect 임포트 추가
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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isLocationRefreshing, setIsLocationRefreshing] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

  const [currentAdminDong, setCurrentAdminDong] = useState<string | null>(null);

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

    } catch (e: any) {
      console.error('근처 글 조회 실패:', e);
      Alert.alert('오류', '글을 불러오는 데 실패했습니다: ' + e.message);
    } finally {
      setLoading(false);
    }
  },[]);

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

    Alert.alert('알림', `위치 정보가 '${updateRes.adminDong}'으로 업데이트되었습니다.`);
    fetchPosts();
  } catch (e: any) {
    console.error('위치 새로고침 오류:', e);
    Alert.alert('오류', '위치 정보를 새로고침하는 데 실패했습니다: ' + e.message);
  } finally {
    setIsLocationRefreshing(false);
  }
}, [fetchPosts]);

  const handleLocationRefreshConfirmation = useCallback(() => {
    Alert.alert(
      '위치 정보 새로고침',
      '현재 위치 정보를 새로고침하시겠습니까?',
      [
        {
          text: '취소',
          onPress: () => setIsConfirmModalVisible(false),
          style: 'cancel',
        },
        {
          text: '확인',
          onPress: () => {
            setIsConfirmModalVisible(false);
            executeLocationRefresh();
          },
        },
      ],
      { cancelable: true }
    );
  }, [executeLocationRefresh]);

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

          <TouchableOpacity
          onPress={executeLocationRefresh}
          style={styles.headerButton}
          disabled={isLocationRefreshing}
          >
            {isLocationRefreshing ? (
              <ActivityIndicator size="small" color="#f4511e" />
            ) : (
              <Ionicons name="refresh" size={24} color="#f4511e" />
            )}
          </TouchableOpacity>
          <TouchableOpacity
              onPress={handleMyPagePress}
              style={styles.headerButton}
          >
            <Ionicons name="person-circle" size={24} color="#f4511e" />
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
              disabled={isLocationRefreshing}
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
              style={styles.headerButton}
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
    marginRight: 5,
  },
  locationInfoContainer:{
    flexDirection:'row',
    alignItems:'center',
  }
});