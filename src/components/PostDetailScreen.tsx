import React, { useEffect, useState, useCallback, useLayoutEffect } from 'react';
import { Modal, TouchableOpacity, View, Text, StyleSheet, ActivityIndicator, Image, Dimensions, Pressable, Alert, TextInput, RefreshControl, Platform, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPostById, PostByIdResponse, deletePost, updatePost, getCommentsByPostId, createComment, updateComment, deleteComment, Comment, ToggleLikePayload, toggleLike, getLikesCountByPostId, getLikeStatusForUser, LikesCountResponse, LikeStatusResponse } from '../../api/post';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

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
  // userAdminDong 상태 추가
  const [userAdminDong, setUserAdminDong] = useState<string | null>(null);
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
    const fetchUserData = async () => {
      try {
        const userId = await AsyncStorage.getItem('userID');
        const adminDong = await AsyncStorage.getItem('userAdminDong'); // userAdminDong 불러오기
        setCurrentUserId(userId);
        setUserAdminDong(adminDong); // 상태 업데이트
      } catch (e) {
        console.error("Failed to fetch user data:", e);
      }
    };
    fetchUserData();
  }, []);

    useLayoutEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: 'none' },
    });

    return () => {
      navigation.getParent()?.setOptions({
        tabBarStyle: {
          backgroundColor: '#f8f8f8',
          borderTopWidth: 0,
          elevation: 10,
          shadowOpacity: 0.1,
          shadowRadius: 5,
          shadowOffset: { width: 0, height: -3 },
          height: 75,
          paddingBottom: 5,
        },
      });
    };
  }, [navigation]);

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

  const refreshAllData = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchPostDetails(),
      fetchComments(),
      fetchLikesInfo()
    ]);
    setRefreshing(false);
  }, [postId, currentUserId]);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  const handleEdit = () => {
    if (post) {
      setIsEditModalVisible(true);
    }
  };

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
      await refreshAllData();
    } catch (err: any) {
      console.error("게시물 수정 실패:", err);
      Alert.alert('수정 실패', `게시물 수정에 실패했습니다: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePress = () => {
    setIsDeleteConfirmModalVisible(true);
  };

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

  const handleImagePress = (uri: string) => {
    setSelectedImageUri(uri);
    setIsImageModalVisible(true);
  };

  const handleCloseImageModal = () => {
    setIsImageModalVisible(false);
    setSelectedImageUri(null);
  };

  const handleCreateComment = async () => {
    if (!currentUserId) {
      Alert.alert('오류', '로그인된 사용자 정보가 없습니다.');
      return;
    }
    // userAdminDong과 post.admin_dong이 다르면 댓글 작성을 막음
    if (userAdminDong !== post?.admin_dong) {
        Alert.alert('알림', '이 게시물은 다른 동네 게시물입니다. 댓글을 작성할 수 없습니다.');
        setNewCommentText(''); // 입력 필드 초기화
        Keyboard.dismiss(); // 키보드 닫기
        return;
    }
    if (newCommentText.trim() === '') {
      Alert.alert('알림', '댓글 내용을 입력해주세요.');
      return;
    }
    try {
      await createComment(postId, { userId: currentUserId, content: newCommentText });
      setNewCommentText('');
      fetchComments();
      Keyboard.dismiss(); // 댓글 작성 성공 후 키보드 닫기
    } catch (err: any) {
      console.error("댓글 작성 실패:", err);
      Alert.alert('댓글 작성 실패', `댓글 작성에 실패했습니다: ${err.message}`);
    }
  };

  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.content);
  };

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
      fetchComments();
      Keyboard.dismiss(); // 댓글 수정 성공 후 키보드 닫기
    } catch (err: any) {
      console.error("댓글 수정 실패:", err);
      Alert.alert('댓글 수정 실패', `댓글 수정에 실패했습니다: ${err.message}`);
    }
  };

  const handleDeleteCommentPress = (commentId: number) => {
    setCommentToDeleteId(commentId);
    setIsCommentDeleteConfirmModalVisible(true);
  };

  const confirmDeleteComment = async () => {
    setIsCommentDeleteConfirmModalVisible(false);
    if (!currentUserId || commentToDeleteId === null) {
      Alert.alert('오류', '사용자 정보 또는 삭제할 댓글 정보가 없습니다.');
      return;
    }
    try {
      await deleteComment(commentToDeleteId, { userId: currentUserId });
      setCommentToDeleteId(null);
      fetchComments();
    } catch (err: any) {
      console.error("댓글 삭제 실패:", err);
      Alert.alert('댓글 삭제 실패', `댓글 삭제에 실패했습니다: ${err.message}`);
    }
  };

  const handleToggleLike = async () => {
    if (!currentUserId) {
      Alert.alert('알림', '로그인이 필요합니다.');
      return;
    }
    try {
      const payload: ToggleLikePayload = { userId: currentUserId };
      const response = await toggleLike(postId, payload);
      setIsLiked(response.liked);
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
  // userAdminDong과 게시물의 admin_dong을 비교하여 댓글 작성 가능 여부 판단
  const userCanComment = userAdminDong === post.admin_dong;

  // 이미지 유무에 따른 extraScrollHeight 및 extraHeight 값 설정
  const imageExtraScrollHeight = Platform.OS === 'ios' ? 60 : 200; // 이미지가 있을 때
  const noImageExtraScrollHeight = Platform.OS === 'ios' ? 80 : 80;  // 이미지가 없을 때

  const imageExtraHeight = Platform.OS === 'ios' ? 50 : 30; // 이미지가 있을 때
  const noImageExtraHeight = Platform.OS === 'ios' ? 20 : 10; // 이미지가 없을 때

  const currentExtraScrollHeight = post.image_url ? imageExtraScrollHeight : noImageExtraScrollHeight;
  const currentExtraHeight = post.image_url ? imageExtraHeight : noImageExtraHeight;

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      extraScrollHeight={currentExtraScrollHeight}
      extraHeight={currentExtraHeight}
      enableOnAndroid={true}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refreshAllData}
          colors={['#f4511e']}
          tintColor={'#f4511e'}
        />
      }
    >
      {post.image_url && (
        <TouchableOpacity onPress={() => handleImagePress(post.image_url!)} activeOpacity={0.8}>
          <Image source={{ uri: post.image_url }} style={styles.postImage} />
        </TouchableOpacity>
      )}
      <View style={styles.contentSection}>
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
          
 
          <View style={styles.likesContainer}>
            <TouchableOpacity onPress={handleToggleLike} style={styles.likeButton}>
              <Ionicons name={isLiked ? "heart" : "heart-outline"} size={24} color={isLiked ? "red" : "#666"} />
              <Text style={styles.likeCount}>{likesCount}</Text>
            </TouchableOpacity>
          </View>

          {isMyPost && (
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

   
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>댓글 ({comments.length})</Text>
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder={userCanComment ? "댓글을 입력하세요..." : "우리 동네에만 댓글을 남길 수 있어요."}
              value={newCommentText}
              onChangeText={setNewCommentText}
              returnKeyType="done"
              onSubmitEditing={userCanComment ? handleCreateComment : undefined} // 조건부 활성화
              editable={userCanComment} // 댓글 작성 가능 여부에 따라 editable 속성 변경
            />
            <TouchableOpacity 
                style={[styles.submitCommentButton, !userCanComment && styles.disabledButton]} 
                onPress={handleCreateComment} 
                disabled={!userCanComment} // 댓글 작성 가능 여부에 따라 disabled 속성 변경
            >
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
                      returnKeyType="done"
                      onSubmitEditing={() => handleUpdateComment(comment.id)}
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


        <CustomConfirmModal
          isVisible={isDeleteConfirmModalVisible}
          title="정말 삭제할까요?"
          message="삭제된 글은 복구할 수 없어요."
          onCancel={() => setIsDeleteConfirmModalVisible(false)}
          onConfirm={confirmDelete}
          confirmText="삭제"
          cancelText="취소"
        />

        <CustomConfirmModal
          isVisible={isCommentDeleteConfirmModalVisible}
          title="댓글을 삭제할까요?"
          message="삭제된 댓글은 복구할 수 없습니다."
          onCancel={() => setIsCommentDeleteConfirmModalVisible(false)}
          onConfirm={confirmDeleteComment}
          confirmText="삭제"
          cancelText="취소"
        />

       
        <WriteModal
          visible={isEditModalVisible}
          onClose={() => setIsEditModalVisible(false)}
          onSave={handleUpdatePost}
          initialTitle={post.title}
          initialDescription={post.content}
          initialImageUri={post.image_url || undefined}
        />
    </KeyboardAwareScrollView>
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
  contentSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 5,
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
  commentsSection: {
    marginTop: 20,
    paddingHorizontal: 20,
    backgroundColor: '#f9f9f9',
    paddingTop: 15,
    borderRadius: 15,
    marginHorizontal: 5,
    paddingBottom: 20,
    marginBottom: 10,
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
    height: 50,
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
    height: 50,
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
  // 비활성화된 버튼 스타일
  disabledButton: {
    backgroundColor: '#ccc', // 비활성화되었을 때 색상 변경
  },
});