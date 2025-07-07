import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, FlatList, Image, Dimensions, TouchableOpacity, Text, View } from 'react-native';
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

  const handleItemPress = (itemId: number) => {
    console.log("갤러리 아이템 클릭됨:", itemId);
    navigation.navigate('PostDetail', { postId: itemId });
  };

  useEffect(() => {
    (async () => {
      try {
        const rawLat = await AsyncStorage.getItem('userLat');
        const rawLon = await AsyncStorage.getItem('userLon');
        if (!rawLat || !rawLon) {
          console.error('위치 정보 없음', '먼저 위치를 받아 와야 합니다.');
          return;
        }
        const lat = Number(rawLat);
        const lon = Number(rawLon);

        const data = await getNearbyPostsUpper(lat, lon);
        // 이미지가 있는 게시글만 필터링하여 상태에 저장
        setListData(data.nearbyPosts.filter(item => item.image_url));

      } catch (e: any) {
        console.error('근처 글 조회 실패', e);
      }
    })();
  }, []);

  const renderItem = React.useCallback(({ item, index }: { item: NearByPostsUpperResponse, index: number }) => {
    if (!item.image_url) {
      return null;
    }
    
    const marginRight = (index + 1) % NUM_COLUMNS === 0 ? 0 : ITEM_SPACING;

    return (
      <TouchableOpacity
        onPress={() => handleItemPress(item.id)}
        style={[styles.itemContainer, { marginRight: marginRight, marginBottom: ITEM_SPACING }]}
      >
        <Image source={{ uri: item.image_url }} style={styles.image} />
      </TouchableOpacity>
    );
  }, [handleItemPress]); // handleItemPress가 변경될 수 있으므로 의존성 배열에 추가

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={listData}
        keyExtractor={(item) => String(item.id)}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={styles.list}
        // columnWrapperStyle={styles.row} // 이 부분을 제거하거나 변경합니다.
        renderItem={renderItem}
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
  // row 스타일은 더 이상 필요 없습니다.
  // row: {
  //   justifyContent: 'space-between',
  //   marginBottom: ITEM_SPACING,
  // },
  itemContainer: {
    // 아이템 자체의 크기는 image 스타일에서 정의되므로 여기서는 추가 마진만 정의합니다.
    // marginRight와 marginBottom은 renderItem에서 동적으로 추가됩니다.
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