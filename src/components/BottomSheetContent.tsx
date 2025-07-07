// components/BottomSheetContent.tsx
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { PostResponse } from '../../api/post'; // PostResponse 타입 임포트

// 변경된 부분: bottomSheetRef의 타입에 null을 명시적으로 허용합니다.
interface BottomSheetContentProps {
  posts: PostResponse[];
  loadingPosts: boolean;
  bottomSheetRef: React.RefObject<BottomSheet | null>; // null을 허용하도록 변경
}

const BottomSheetContent: React.FC<BottomSheetContentProps> = ({ posts, loadingPosts, bottomSheetRef }) => {
  const renderPostItem = useCallback(({ item }: { item: PostResponse }) => (
    <TouchableOpacity
      style={styles.postItem}
      onPress={() => {
        console.log("게시글 아이템 클릭:", item.title);
        // 게시글 아이템 클릭 시 100%로 확장
        if (bottomSheetRef.current) { // bottomSheetRef.current가 null이 아닌지 확인
          bottomSheetRef.current.snapToIndex(2); // 100%
        }
        // TODO: 필요한 경우 해당 게시글의 상세 정보를 표시하는 로직 추가
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
  ), [bottomSheetRef]); // bottomSheetRef를 의존성에 추가

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