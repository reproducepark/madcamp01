import React, { useState, useEffect, useCallback } from 'react'; // useCallback을 import 합니다.
import { SafeAreaView, StyleSheet, FlatList, Image, Dimensions, TouchableOpacity, Text, View, RefreshControl, ActivityIndicator, Alert } from 'react-native'; // RefreshControl을 import 합니다.
import { useNavigation, NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NearByPostsUpperResponse, getNearbyPostsUpper } from '../../api/post';
import { updateUserLocation } from '../../api/user';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

import { TabTwoStackParamList } from '../navigation/TabTwoStack';

const { width } = Dimensions.get('window');
const LIST_PADDING_HORIZONTAL = 16;
const ITEM_SPACING = 8;
const NUM_COLUMNS = 3;

const ITEM_SIZE = (width - (LIST_PADDING_HORIZONTAL * 2) - (ITEM_SPACING * (NUM_COLUMNS - 1))) / NUM_COLUMNS;

export function TabTwoScreen() {
  const navigation = useNavigation<NavigationProp<TabTwoStackParamList>>();
  const [listData, setListData] = useState<NearByPostsUpperResponse[]>([]);
  const [refreshing, setRefreshing] = useState(false); // 새로고침 상태를 관리할 state 추가
  const [isLocationRefreshing, setIsLocationRefreshing] = useState(false); // 위치 새로고침 로딩 상태 추가
  const [currentAdminDong, setCurrentAdminDong] = useState<string | null>(null); // 👈 현재 사용자 동 상태 추가
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

  const handleItemPress = (itemId: number) => {
    console.log("갤러리 아이템 클릭됨:", itemId);
    navigation.navigate('PostDetail', { postId: itemId });
  };

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
        console.error('AsyncStorage에서 adminDong 불러오기 실패:',e);
        setCurrentAdminDong('정보없음')
      }
    }
    loadAdminDong();
  },[]);

  // fetchPosts 함수를 useCallback으로 래핑하여 불필요한 재생성을 방지합니다.
  const fetchPosts = useCallback(async () => {
    try {
      setRefreshing(true); // 데이터를 가져오기 시작할 때 새로고침 상태를 true로 설정
      const rawLat = await AsyncStorage.getItem('userLat');
      const rawLon = await AsyncStorage.getItem('userLon');
      if (!rawLat || !rawLon) {
        console.error('위치 정보 없음', '먼저 위치를 받아 와야 합니다.');
        setRefreshing(false); // 오류 발생 시 새로고침 상태 해제
        return;
      }
      const lat = Number(rawLat);
      const lon = Number(rawLon);

      const data = await getNearbyPostsUpper(lat, lon);
      // 이미지가 있는 게시글만 필터링하여 상태에 저장
      setListData(data.nearbyPosts.filter(post => post.image_url));

    } catch (e: any) {
      console.error('근처 글 조회 실패', e);
    } finally {
      setRefreshing(false); // 데이터 로딩이 완료되면 새로고침 상태를 false로 설정
    }
  }, []); // 의존성 배열이 비어 있으므로 컴포넌트 마운트 시 한 번만 생성됩니다.

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
  }, [fetchPosts]); // fetchPosts가 변경될 때마다 실행되도록 의존성 배열에 추가

  const renderItem = React.useCallback(({ item, index }: { item: NearByPostsUpperResponse, index: number }) => {
    if (!item.image_url) {
      return null;
    }

    const marginRight = (index + 1) % NUM_COLUMNS === 0 ? 0 : ITEM_SPACING;

    return (
      <TouchableOpacity
        onPress={() => handleItemPress(item.id)}
        style={[{ marginRight: marginRight, marginBottom: ITEM_SPACING }]}
      >
        <Image source={{ uri: item.image_url }} style={styles.image} />
      </TouchableOpacity>
    );
  }, [handleItemPress]);

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
      <FlatList
        data={listData}
        keyExtractor={(item) => String(item.id)}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={styles.list}
        renderItem={renderItem}
        // 새로고침 기능 추가
        refreshControl={
          <RefreshControl
            refreshing={refreshing} // 현재 새로고침 중인지 여부
            onRefresh={fetchPosts} // 당겨서 새로고침 시 호출될 함수
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  list: {
    paddingHorizontal: LIST_PADDING_HORIZONTAL,
  },
  image: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: 8,
    backgroundColor: '#eee', // 이미지가 로딩되기 전이나 없을 때 배경색
  },
  // 기존에 사용되지 않는 스타일
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 20,
  },
  navContainer: {
    flexDirection:'row',
    justifyContent:'space-between',
    padding: 20, 
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
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    flexDirection: 'column'
  },
  imageContainer: {
    // justifyContent:'flex-end'
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