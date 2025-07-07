import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { useNavigation, NavigationProp } from '@react-navigation/native'; // <--- NEW: 네비게이션 훅 임포트
import { NearByViewportResponse } from '../../api/post';
import { TabThreeStackParamList } from '../navigation/TabThreeStack'; // <--- NEW: TabThree 스택 파라미터 타입 임포트

interface BottomSheetContentProps {
  posts: NearByViewportResponse[];
  loadingPosts: boolean;
  bottomSheetRef: React.RefObject<BottomSheet | null>;
}

const BottomSheetContent: React.FC<BottomSheetContentProps> = ({ posts, loadingPosts }) => {
  const navigation = useNavigation<NavigationProp<TabThreeStackParamList>>();

  const renderPostItem = useCallback(({ item }: { item: NearByViewportResponse }) => (
    <TouchableOpacity
      style={styles.postItem}
      onPress={() => {
        console.log("게시글 아이템 클릭, 상세 화면으로 이동:", item.title);
        navigation.navigate('PostDetail', { postId: item.id });
      }}
    >
      <View style={[styles.itemContent, !item.image_url && styles.itemContentFullWidth]}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemDescription} numberOfLines={1}>{item.content}</Text>
        <Text style={styles.itemLocation}>{item.admin_dong}</Text>
      </View>
      {item.image_url && (
        <Image source={{ uri: item.image_url }} style={styles.itemImage} />
      )}
    </TouchableOpacity>
  ), [navigation]);

  const renderEmptyListComponent = useCallback(() => (
    <View style={styles.noPostsContainer}>
      {loadingPosts ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <>
          <Text style={styles.noPostsText}>이 지역에는 아직 글이 없어요.</Text>
          <Text style={styles.noPostsSubText}>지도를 이동하거나 '이 지역 검색하기'를 눌러보세요.</Text>
        </>
      )}
    </View>
  ), [loadingPosts]);

  const renderListHeader = useCallback(() => (
    posts.length > 0 ? (
      <View style={styles.listHeaderContainer}>
        <Text style={styles.listHeaderText}>{posts.length}개의 글이 있어요</Text>
      </View>
    ) : null
  ), [posts.length]);

  return (
    <BottomSheetFlatList
      data={posts}
      renderItem={renderPostItem}
      keyExtractor={(item) => item.id.toString()}
      style={styles.bottomSheetFlatList}
      contentContainerStyle={styles.postsListContent}
      ListHeaderComponent={renderListHeader}
      ListEmptyComponent={renderEmptyListComponent}
      scrollEnabled={posts.length > 0}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  bottomSheetFlatList: {
    backgroundColor: '#f9f9f9',
  },
  postsListContent: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  listHeaderContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
  },
  listHeaderText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
  },
  postItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
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
  },
  itemContentFullWidth: {
    marginRight: 0,
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
});

export default BottomSheetContent;