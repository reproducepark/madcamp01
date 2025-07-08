import React, { useEffect, useState, useCallback } from 'react';
import { Modal, TouchableOpacity, View, Text, StyleSheet, ActivityIndicator, ScrollView, Image, Dimensions, Pressable, Alert, TextInput, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPostById, PostByIdResponse, deletePost, updatePost, getCommentsByPostId, createComment, updateComment, deleteComment, Comment, ToggleLikePayload, toggleLike, getLikesCountByPostId, getLikeStatusForUser, LikesCountResponse, LikeStatusResponse } from '../../api/post';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { TabOneStackParamList } from '../navigation/TabOneStack';
import { CustomConfirmModal } from './CustomConfirmModal';
import { WriteModal } from './WriteModal';

type PostDetailScreenRouteProp = RouteProp<TabOneStackParamList, 'PostDetail'>;
type PostDetailScreenNavigationProp = StackNavigationProp<TabOneStackParamList, 'PostDetail'>;

interface PostDetailScreenProps {
  route: PostDetailScreenRouteProp;
  navigation: PostDetailScreenNavigationProp;
}

const { width, height } = Dimensions.get('window');

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffMinutes < 1) return '방금 전';
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}일 전`;
  
  return date.toLocaleDateString('ko-KR');
};

export function PostDetailScreen({ route, navigation }: PostDetailScreenProps) {
  const { postId } = route.params;
  const [post, setPost] = useState<PostByIdResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isDeleteConfirmModalVisible, setIsDeleteConfirmModalVisible] = useState<boolean>(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [isImageModalVisible, setIsImageModalVisible] = useState<boolean>(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

  // 댓글 관련 상태
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentText, setEditingCommentText] = useState<string>('');
  const [isCommentDeleteConfirmModalVisible, setIsCommentDeleteConfirmModalVisible] = useState<boolean>(false);
  const [commentToDeleteId, setCommentToDeleteId] = useState<number | null>(null);

  // 좋아요 관련 상태
  const [likesCount, setLikesCount] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);

  // 새로고침 관련 상태 추가
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    const fetchCurrentUserId = async () => {
      try {
        const userId = await AsyncStorage.getItem('userID');
        setCurrentUserId(userId);
      } catch (e) {
        console.error("Failed to fetch current user ID:", e);
      }
    };
    fetchCurrentUserId();
  }, []);

  const fetchPostDetails = async () => {
    try {
      setLoading(true);
      const fetchedPost = await getPostById(postId);
      setPost(fetchedPost);
      console.log("Fetched post details:", fetchedPost);
    } catch (err: any) {
      console.error("Error fetching post details:", err);
      setError(`Failed to load post: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const fetchedComments = await getCommentsByPostId(postId);
      setComments(fetchedComments);
    } catch (err: any) {
      console.error("Error fetching comments:", err);
      Alert.alert('댓글 불러오기 실패', `댓글을 불러오는 데 실패했습니다: ${err.message}`);
    }
  };

  const fetchLikesInfo = async () => {
    try {
      const countResponse = await getLikesCountByPostId(postId);
      setLikesCount(countResponse.likeCount);

      if (currentUserId) {
        const statusResponse = await getLikeStatusForUser(postId, currentUserId);
        setIsLiked(statusResponse.liked);
      }
    } catch (err: any) {
      console.error("Error fetching likes info:", err);
    }
  };

  // 모든 데이터를 새로고침하는 함수
  const refreshAllData = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchPostDetails(),
      fetchComments(),
      fetchLikesInfo()
    ]);
    setRefreshing(false);
  }, [postId, currentUserId]); // currentUserId가 변경될 때 좋아요 상태를 다시 불러오도록 추가

  useEffect(() => {
    refreshAllData(); // 초기 로드 시에도 사용
  }, [refreshAllData]);

  // 게시물 편집 모달을 띄우는 함수
  const handleEdit = () => {
    if (post) {
      setIsEditModalVisible(true);
    }
  };

  // 게시물 수정 API 호출 및 상태 업데이트
  const handleUpdatePost = async (title: string, content: string, imageUri?: string, imageDeleteFlag?: boolean, imageUpdateFlag?: boolean) => {
    if (!post || !currentUserId) {
      Alert.alert('오류', '게시물 정보 또는 사용자 ID가 없습니다.');
      return;
    }
    try {
      setLoading(true);
      await updatePost({
        id: post.id,
        userId: currentUserId,
        title,
        content,
        image_uri: imageUri || null,
        image_url_delete_flag: imageDeleteFlag || false,
        image_url_update_flag: imageUpdateFlag || false,
      });
      setIsEditModalVisible(false);
      await refreshAllData(); // 수정 후 게시물 상세 정보 새로고침
    } catch (err: any) {
      console.error("게시물 수정 실패:", err);
      Alert.alert('수정 실패', `게시물 수정에 실패했습니다: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 삭제 확인 모달을 띄우는 함수
  const handleDeletePress = () => {
    setIsDeleteConfirmModalVisible(true);
  };

  // 게시물 삭제 API 호출 및 상태 업데이트
  const confirmDelete = async () => {
    setIsDeleteConfirmModalVisible(false);
    if (!post || !currentUserId) {
      Alert.alert('오류', '게시물 정보 또는 사용자 ID가 없습니다.');
      return;
    }
    try {
      await deletePost({ id: post.id, userId: currentUserId });
      navigation.goBack();
    } catch (err: any) {
      console.error("게시물 삭제 실패:", err);
      Alert.alert('삭제 실패', `게시물 삭제에 실패했습니다: ${err.message}`);
    }
  };

  // 이미지 클릭 시 전체 화면 모달을 띄우는 함수
  const handleImagePress = (uri: string) => {
    setSelectedImageUri(uri);
    setIsImageModalVisible(true);
  };

  // 전체 화면 이미지 모달을 닫는 함수
  const handleCloseImageModal = () => {
    setIsImageModalVisible(false);
    setSelectedImageUri(null);
  };

  // 댓글 작성
  const handleCreateComment = async () => {
    if (!currentUserId) {
      Alert.alert('오류', '로그인된 사용자 정보가 없습니다.');
      return;
    }
    if (newCommentText.trim() === '') {
      Alert.alert('알림', '댓글 내용을 입력해주세요.');
      return;
    }
    try {
      await createComment(postId, { userId: currentUserId, content: newCommentText });
      setNewCommentText('');
      fetchComments(); // 댓글 목록 새로고침
    } catch (err: any) {
      console.error("댓글 작성 실패:", err);
      Alert.alert('댓글 작성 실패', `댓글 작성에 실패했습니다: ${err.message}`);
    }
  };

  // 댓글 수정 시작
  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.content);
  };

  // 댓글 수정 완료
  const handleUpdateComment = async (commentId: number) => {
    if (!currentUserId) {
      Alert.alert('오류', '로그인된 사용자 정보가 없습니다.');
      return;
    }
    if (editingCommentText.trim() === '') {
      Alert.alert('알림', '댓글 내용을 입력해주세요.');
      return;
    }
    try {
      await updateComment(commentId, { userId: currentUserId, content: editingCommentText });
      setEditingCommentId(null);
      setEditingCommentText('');
      fetchComments(); // 댓글 목록 새로고침
    } catch (err: any) {
      console.error("댓글 수정 실패:", err);
      Alert.alert('댓글 수정 실패', `댓글 수정에 실패했습니다: ${err.message}`);
    }
  };

  // 댓글 삭제 확인 모달 띄우기
  const handleDeleteCommentPress = (commentId: number) => {
    setCommentToDeleteId(commentId);
    setIsCommentDeleteConfirmModalVisible(true);
  };

  // 댓글 삭제
  const confirmDeleteComment = async () => {
    setIsCommentDeleteConfirmModalVisible(false);
    if (!currentUserId || commentToDeleteId === null) {
      Alert.alert('오류', '사용자 정보 또는 삭제할 댓글 정보가 없습니다.');
      return;
    }
    try {
      await deleteComment(commentToDeleteId, { userId: currentUserId });
      setCommentToDeleteId(null);
      fetchComments(); // 댓글 목록 새로고침
    } catch (err: any) {
      console.error("댓글 삭제 실패:", err);
      Alert.alert('댓글 삭제 실패', `댓글 삭제에 실패했습니다: ${err.message}`);
    }
  };

  // 좋아요 토글
  const handleToggleLike = async () => {
    if (!currentUserId) {
      Alert.alert('알림', '로그인이 필요합니다.');
      return;
    }
    try {
      const payload: ToggleLikePayload = { userId: currentUserId };
      const response = await toggleLike(postId, payload);
      setIsLiked(response.liked);
      // 좋아요 수 즉시 업데이트 ( optimistic update 또는 재조회)
      fetchLikesInfo(); 
    } catch (err: any) {
      console.error("좋아요 토글 실패:", err);
      Alert.alert('좋아요 오류', `좋아요 처리 중 오류가 발생했습니다: ${err.message}`);
    }
  };


  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#f4511e" />
        <Text style={styles.loadingText}>게시물 상세 정보를 불러오는 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>오류: {error}</Text>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>게시물을 찾을 수 없습니다.</Text>
      </View>
    );
  }

  const isMyPost = currentUserId === post.user_id;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refreshAllData}
          colors={['#f4511e']} // 로딩 스피너 색상
          tintColor={'#f4511e'} // iOS에서 로딩 스피너 색상
        />
      }
    >
      {post.image_url && (
        <TouchableOpacity onPress={() => handleImagePress(post.image_url!)} activeOpacity={0.8}>
          <Image source={{ uri: post.image_url }} style={styles.postImage} />
        </TouchableOpacity>
      )}
      <View style={styles.contentContainer}>
          <View style={styles.titleAndNicknameContainer}>
            <Text style={styles.title}>{post.title}</Text>
          </View>
          <View style={styles.nicknameContainer}>
            <Ionicons name="person-circle" size={20} color="#f4511e" />
            <Text style={styles.nicknameRight}>{post.nickname}</Text>
          </View>
          
          <View style={styles.metaInfoContainer}>
            <Text style={styles.dateTimeLocation}>
              {formatRelativeTime(post.created_at)} · {post.admin_dong}
            </Text>
          </View>

          <Text style={styles.content}>{post.content}</Text>
          
          {/* 좋아요 버튼 및 카운트 */}
          <View style={styles.likesContainer}>
            <TouchableOpacity onPress={handleToggleLike} style={styles.likeButton}>
              <Ionicons name={isLiked ? "heart" : "heart-outline"} size={24} color={isLiked ? "red" : "#666"} />
              <Text style={styles.likeCount}>{likesCount}</Text>
            </TouchableOpacity>
          </View>

          {isMyPost && ( // 내 게시물인 경우에만 편집/삭제 버튼 표시
            <View style={styles.buttonContainer}>
              <Pressable
                onPress={handleEdit}
                style={({ pressed }) => [
                  styles.iconButton,
                  { backgroundColor: pressed ? '#d3d3d3' : 'transparent' },
                ]}
              >
                <Image
                  source={require('../../assets/icons/edit.png')}
                  style={styles.icon}
                />
              </Pressable>
              <Pressable
                onPress={handleDeletePress}
                style={({ pressed }) => [
                  styles.iconButton,
                  { backgroundColor: pressed ? '#d3d3d3' : 'transparent' },
                ]}
              >
                <Image
                  source={require('../../assets/icons/trashcan.png')}
                  style={styles.icon}
                />
              </Pressable>
            </View>
          )}
        </View>

        {/* 댓글 섹션 */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>댓글 ({comments.length})</Text>
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="댓글을 입력하세요..."
              multiline
              value={newCommentText}
              onChangeText={setNewCommentText}
            />
            <TouchableOpacity style={styles.submitCommentButton} onPress={handleCreateComment}>
              <Text style={styles.submitCommentButtonText}>작성</Text>
            </TouchableOpacity>
          </View>

          {comments.length === 0 ? (
            <Text style={styles.noCommentsText}>아직 댓글이 없습니다. 첫 댓글을 남겨보세요!</Text>
          ) : (
            comments.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentNickname}>{comment.nickname}</Text>
                  <Text style={styles.commentTime}>{formatRelativeTime(comment.created_at)}</Text>
                </View>
                {editingCommentId === comment.id ? (
                  <View style={styles.editingCommentContainer}>
                    <TextInput
                      style={styles.editingCommentInput}
                      value={editingCommentText}
                      onChangeText={setEditingCommentText}
                      multiline
                    />
                    <View style={styles.editingCommentButtons}>
                      <TouchableOpacity style={styles.editSaveButton} onPress={() => handleUpdateComment(comment.id)}>
                        <Text style={styles.editSaveButtonText}>저장</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.editCancelButton} onPress={() => setEditingCommentId(null)}>
                        <Text style={styles.editCancelButtonText}>취소</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.commentContent}>{comment.content}</Text>
                )}
                
                {currentUserId === comment.user_id && editingCommentId !== comment.id && (
                  <View style={styles.commentActions}>
                    <TouchableOpacity onPress={() => handleEditComment(comment)}>
                      <Text style={styles.commentActionText}>수정</Text>
                    </TouchableOpacity>
                    <Text style={styles.actionSeparator}>|</Text>
                    <TouchableOpacity onPress={() => handleDeleteCommentPress(comment.id)}>
                      <Text style={styles.commentActionText}>삭제</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </View>


        <Modal
          visible={isImageModalVisible}
          transparent={true}
          onRequestClose={handleCloseImageModal}
          animationType='fade'
        >
          <View style={styles.fullScreenModalContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={handleCloseImageModal}>
              <Ionicons name="close-circle" size={40} color="white" />
            </TouchableOpacity>
            {selectedImageUri && (
              <Image
                source={{ uri: selectedImageUri }}
                style={styles.fullScreenImage}
                resizeMode="contain"
              />
            )}
          </View>
        </Modal>

        {/* 게시물 삭제 확인 모달 */}
        <CustomConfirmModal
          isVisible={isDeleteConfirmModalVisible}
          title="정말 삭제할까요?"
          message="삭제된 글은 복구할 수 없어요."
          onCancel={() => setIsDeleteConfirmModalVisible(false)}
          onConfirm={confirmDelete}
          confirmText="삭제"
          cancelText="취소"
        />

        {/* 댓글 삭제 확인 모달 */}
        <CustomConfirmModal
          isVisible={isCommentDeleteConfirmModalVisible}
          title="댓글을 삭제할까요?"
          message="삭제된 댓글은 복구할 수 없습니다."
          onCancel={() => setIsCommentDeleteConfirmModalVisible(false)}
          onConfirm={confirmDeleteComment}
          confirmText="삭제"
          cancelText="취소"
        />

        {/* 게시물 수정 모달 */}
        <WriteModal
          visible={isEditModalVisible}
          onClose={() => setIsEditModalVisible(false)}
          onSave={handleUpdatePost}
          initialTitle={post.title}
          initialDescription={post.content}
          initialImageUri={post.image_url || undefined}
        />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
  postImage: {
    width: width,
    height: width * 0.8,
    resizeMode: 'cover',
  },
  contentContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 5,
    minHeight: height * 0.3,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  content: {
    fontSize: 18,
    lineHeight: 26,
    color: '#444',
    marginBottom: 50,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#eee',
    paddingTop: 15,
    paddingHorizontal: 10,
  },
  iconButton: {
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: '#333',
  },
  metaInfoContainer: {
    marginBottom: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 10,
    alignItems: 'flex-start',
  },
  dateTimeLocation: {
    fontSize: 14,
    color: '#777',
  },
  titleAndNicknameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nicknameRight: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF7E36',
    marginLeft: 5,
  },
  nicknameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom:10,
  },
  fullScreenModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: width,
    height: height,
    resizeMode: 'contain',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  // 댓글 스타일
  commentsSection: {
    marginTop: 20,
    paddingHorizontal: 20,
    backgroundColor: '#f9f9f9',
    paddingTop: 15,
    borderRadius: 15,
    marginHorizontal: 5,
    marginBottom: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#eee',
  },
  commentsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingRight: 10,
    backgroundColor: '#fff',
  },
  commentInput: {
    flex: 1,
    padding: 10,
    minHeight: 50,
    fontSize: 16,
    color: '#555',
  },
  submitCommentButton: {
    backgroundColor: '#f4511e',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  submitCommentButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  commentItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  commentNickname: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#333',
  },
  commentTime: {
    fontSize: 13,
    color: '#888',
  },
  commentContent: {
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
  },
  noCommentsText: {
    textAlign: 'center',
    color: '#777',
    fontSize: 15,
    paddingVertical: 20,
  },
  commentActions: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'flex-end',
  },
  commentActionText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 10,
  },
  actionSeparator: {
    fontSize: 13,
    color: '#ccc',
    marginHorizontal: 5,
  },
  editingCommentContainer: {
    marginTop: 5,
  },
  editingCommentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    minHeight: 60,
    marginBottom: 10,
  },
  editingCommentButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editSaveButton: {
    backgroundColor: '#f4511e',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 10,
  },
  editSaveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  editCancelButton: {
    backgroundColor: '#ccc',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 10,
  },
  editCancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  likeCount: {
    marginLeft: 5,
    fontSize: 16,
    color: '#666',
  },
});