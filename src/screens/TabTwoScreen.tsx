import React, { useState, useEffect, useCallback } from 'react'; // useCallback을 import 합니다.
import { SafeAreaView, StyleSheet, FlatList, Image, Dimensions, TouchableOpacity, Text, View, RefreshControl } from 'react-native'; // RefreshControl을 import 합니다.
import { useNavigation, NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NearByPostsUpperResponse, getNearbyPostsUpper } from '../../api/post';

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

  const handleItemPress = (itemId: number) => {
    console.log("갤러리 아이템 클릭됨:", itemId);
    navigation.navigate('PostDetail', { postId: itemId });
  };

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
  }
});