import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, StyleSheet, FlatList, Image, Dimensions, TouchableOpacity, Text, View, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NearByPostsUpperResponse, getNearbyPostsUpper } from '../../api/post';
import { updateUserLocation } from '../../api/user';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

import { TabTwoStackParamList } from '../navigation/TabTwoStack';

// CustomAlertModal 임포트 추가
import { CustomAlertModal } from '../components/CustomAlertModal';
// CustomConfirmModal 임포트 추가
import { CustomConfirmModal } from '../components/CustomConfirmModal';


const { width } = Dimensions.get('window');
const LIST_PADDING_HORIZONTAL = 16;
const ITEM_SPACING = 8;
const NUM_COLUMNS = 3;

const ITEM_SIZE = (width - (LIST_PADDING_HORIZONTAL * 2) - (ITEM_SPACING * (NUM_COLUMNS - 1))) / NUM_COLUMNS;

export function TabTwoScreen() {
  const navigation = useNavigation<NavigationProp<TabTwoStackParamList>>();
  const [listData, setListData] = useState<NearByPostsUpperResponse[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLocationRefreshing, setIsLocationRefreshing] = useState(false);
  const [currentAdminDong, setCurrentAdminDong] = useState<string | null>(null);
  
  // CustomConfirmModal 가시성 상태 (위치 새로고침 확인)
  const [isLocationConfirmModalVisible, setIsLocationConfirmModalVisible] = useState(false); 
  // CustomAlertModal 가시성 상태 (위치 새로고침 완료)
  const [isLocationUpdateAlertVisible, setIsLocationUpdateAlertVisible] = useState(false);
  const [locationUpdateMessage, setLocationUpdateMessage] = useState(''); // 위치 업데이트 메시지 상태

  const handleItemPress = (itemId: number) => {
    console.log("갤러리 아이템 클릭됨:", itemId);
    navigation.navigate('PostDetail', { postId: itemId });
  };

  useEffect(()=>{
    const loadAdminDong = async () => {
      try {
        const storedAdminDong = await AsyncStorage.getItem('userAdminDong');
        console.log('현재위치',storedAdminDong);
        if (storedAdminDong) {
          const parts = storedAdminDong.split(' ');
          if (parts.length >= 2) {
            setCurrentAdminDong(parts[1]); // 두 번째 부분 (예: "대전광역시 유성구 궁동" -> "유성구")
          } else {
            setCurrentAdminDong(storedAdminDong); // 예상치 못한 형식일 경우 전체를 사용
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

  const fetchPosts = useCallback(async () => {
    try {
      setRefreshing(true);
      const rawLat = await AsyncStorage.getItem('userLat');
      const rawLon = await AsyncStorage.getItem('userLon');
      if (!rawLat || !rawLon) {
        console.error('위치 정보 없음', '먼저 위치를 받아 와야 합니다.');
        setRefreshing(false);
        return;
      }
      const lat = Number(rawLat);
      const lon = Number(rawLon);

      const data = await getNearbyPostsUpper(lat, lon);
      setListData(data.nearbyPosts.filter(post => post.image_url));

    } catch (e: any) {
      console.error('근처 글 조회 실패', e);
      Alert.alert('오류', '글을 불러오는 데 실패했습니다: ' + e.message); // 오류 발생 시 Alert 표시
    } finally {
      setRefreshing(false);
    }
  }, []);

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
        setCurrentAdminDong(parts[1]);
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

  const handleLocationRefreshConfirmation = useCallback(() => {
    setIsLocationConfirmModalVisible(true); // CustomConfirmModal을 띄우도록 변경
  }, []);

  const handleMyPagePress = useCallback(() => {
    navigation.navigate('MyPage');
  }, [navigation]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

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
            {currentAdminDong || '위치 정보 로딩 중...'} 이웃로그
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
      <FlatList
        data={listData}
        keyExtractor={(item) => String(item.id)}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={styles.list}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchPosts}
          />
        }
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
    backgroundColor: '#eee',
  },
  container: { // 이 스타일은 TabTwoScreen에서 사용되지 않음
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
    marginLeft: 10,
    textAlign: 'left',
  },
  text: { // 이 스타일은 TabTwoScreen에서 사용되지 않음
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subText: { // 이 스타일은 TabTwoScreen에서 사용되지 않음
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
  },
  listItem: { // 이 스타일은 TabTwoScreen에서 사용되지 않음
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
  itemTitle: { // 이 스타일은 TabTwoScreen에서 사용되지 않음
    fontSize: 16,
    fontWeight: '500',
  },
  itemSubtitle: { // 이 스타일은 TabTwoScreen에서 사용되지 않음
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  itemImage: { // 이 스타일은 TabTwoScreen에서 사용되지 않음
    width: 50,
    height: 50,
    borderRadius: 4,
    backgroundColor: '#ddd',
  },
  textContainer: { // 이 스타일은 TabTwoScreen에서 사용되지 않음
    flexDirection: 'column'
  },
  imageContainer: { // 이 스타일은 TabTwoScreen에서 사용되지 않음
    // justifyContent:'flex-end'
  },

  headerButton: {
    marginRight: 15,
    padding: 5,
  },

  inlineRefreshButton: {
    paddingLeft:5,
  },
  headerRightContainer: { // 이 스타일은 TabTwoScreen에서 사용되지 않음
    flexDirection: 'row',
    marginRight: 5,
  },
  locationInfoContainer:{
    flexDirection:'row',
    alignItems:'center',
  }
});