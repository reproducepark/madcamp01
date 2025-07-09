import React, { useCallback, forwardRef, useImperativeHandle, useRef } from 'react'; // forwardRef, useImperativeHandle, useRef 추가
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { NearByViewportResponse } from '../../api/post';
import { TabThreeStackParamList } from '../navigation/TabThreeStack';

interface BottomSheetContentProps {
  posts: NearByViewportResponse[];
  loadingPosts: boolean;
  bottomSheetRef: React.RefObject<BottomSheet | null>;
}

// 부모 컴포넌트에서 이 컴포넌트의 메소드를 호출할 수 있도록 forwardRef 사용
const BottomSheetContent = forwardRef<any, BottomSheetContentProps>(({ posts, loadingPosts }, ref) => {
  const navigation = useNavigation<NavigationProp<TabThreeStackParamList>>();
  const flatListRef = useRef<React.ElementRef<typeof BottomSheetFlatList> | null>(null); // FlatList의 ref 생성

  // 부모 컴포넌트에서 호출할 수 있는 함수 정의
  useImperativeHandle(ref, () => ({
    scrollToTop: () => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    },
  }));

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const nineHoursInMilliseconds = 9 * 60 * 60 * 1000;
    const diffMinutes = Math.floor((now.getTime() - date.getTime() - nineHoursInMilliseconds) / (1000 * 60));

    if (diffMinutes < 1) return '방금 전';
    if (diffMinutes < 60) return `${diffMinutes}분 전`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}시간 전`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}일 전`;

    return date.toLocaleDateString('ko-KR');
  };

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
        <View style={styles.nicknameContainer}>
          <Text style={styles.nicknameRight}>{item.nickname}</Text>
        </View>
        <View style={styles.metaInfoContainer}>
          <Text style={styles.dateTimeLocation}>
            {formatRelativeTime(item.created_at)} · {item.admin_dong}
          </Text>
        </View>
      </View>
      {item.image_url && (
        <Image source={{ uri: item.image_url }} style={styles.itemImage} />
      )}
    </TouchableOpacity>
  ), [navigation]);

  const renderEmptyListComponent = useCallback(() => (
    <View style={styles.noPostsContainer}>
      {loadingPosts ? (
        <ActivityIndicator size="large" color="#f4511e" />
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
      ref={flatListRef} // flatListRef 할당
      data={posts}
      renderItem={renderPostItem}
      keyExtractor={(item) => item.id.toString()}
      style={styles.bottomSheetFlatList}
      contentContainerStyle={styles.postsListContent}
      ListHeaderComponent={renderListHeader}
      ListEmptyComponent={renderEmptyListComponent}
      showsVerticalScrollIndicator={false}
    />
  );
});

const styles = StyleSheet.create({
  bottomSheetFlatList: {
    backgroundColor: '#fff',
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
    backgroundColor: '#fff',
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
    borderBottomWidth: StyleSheet.hairlineWidth, // 회색 구분선 유지
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
    // 그림자 제거
    // shadowColor: '#000',
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 2,
    marginBottom: 0, // 각 아이템 사이의 간격 제거
    // 테두리 둥글게 제거
    // borderRadius: 8,
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
    paddingLeft: 0,
  },
  itemContentFullWidth: {
    marginRight: 0,
    paddingRight: 20,
  },
  itemTitle: {
    fontSize: 18,
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
  nicknameRight: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e71d36',
  },
  nicknameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 5,
  },
  metaInfoContainer: {
    alignItems: 'flex-start',
  },
  dateTimeLocation: {
    fontSize: 12,
    color: '#6c757d',
  },
});

export default BottomSheetContent;