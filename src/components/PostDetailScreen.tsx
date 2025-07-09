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
import { CustomAlertModal } from './CustomAlertModal'; // CustomAlertModal 임포트
import { WriteModal } from './WriteModal';

type PostDetailScreenRouteProp = RouteProp<TabOneStackParamList, 'PostDetail'>;
type PostDetailScreenNavigationProp = StackNavigationProp<TabOneStackParamList, 'PostDetail'>;

interface PostDetailScreenProps {
  route: PostDetailScreenRouteProp;
  navigation: PostDetailScreenNavigationProp;
}

const { width, height } = Dimensions.get('window');

// 사용할 색상 팔레트를 상수로 정의합니다.
const COLOR_PALETTE = {
  NAVY_BLUE: "#072ac8",
  SKY_BLUE: "#1e96fc",
  LIGHT_BLUE: "#a2d6f9",
  GRAYISH_BROWN_LIGHT: "#6c757d",
  GRAYISH_BROWN_DARK: "#6c757d",
  WHITE: '#fff',
  BLACK: '#000',
  GRAY_DARK: '#333',
  GRAY_MEDIUM: '#555',
  GRAY_LIGHT: '#888',
  GRAY_VERY_LIGHT: '#999',
  BORDER_COLOR: '#e0e0e0',
  LIKE_COLOR: '#e71d36', // 좋아요 아이콘 색상 (기존 "red" 대체)
  ORANGE: '#FF7E36', // 기존 주황색 유지
  LIGHT_GRAY_BACKGROUND: '#f9f9f9', // commentsSection 배경색 (기존 #f9f9f9)
  VERY_LIGHT_GRAY: '#f8f8f8', // 탭바 배경색
};

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
  const [userAdminDong, setUserAdminDong] = useState<string | null>(null);
  const [isDeleteConfirmModalVisible, setIsDeleteConfirmModalModalVisible] = useState<boolean>(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [isImageModalVisible, setIsImageModalVisible] = useState<boolean>(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentText, setEditingCommentText] = useState<string>('');
  const [isCommentDeleteConfirmModalVisible, setIsCommentDeleteConfirmModalVisible] = useState<boolean>(false);
  const [commentToDeleteId, setCommentToDeleteId] = useState<number | null>(null);

  const [likesCount, setLikesCount] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);

  const [refreshing, setRefreshing] = useState<boolean>(false);

  const [isAlertModalVisible, setIsAlertModalVisible] = useState<boolean>(false);
  const [alertModalTitle, setAlertModalTitle] = useState<string>('');
  const [alertModalMessage, setAlertModalMessage] = useState<string>('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = await AsyncStorage.getItem('userID');
        const adminDong = await AsyncStorage.getItem('userAdminDong');
        setCurrentUserId(userId);
        setUserAdminDong(adminDong);
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
          backgroundColor: COLOR_PALETTE.VERY_LIGHT_GRAY, // 변경: #f8f8f8 -> COLOR_PALETTE.VERY_LIGHT_GRAY
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
      setAlertModalTitle('댓글 불러오기 실패');
      setAlertModalMessage(`댓글을 불러오는 데 실패했습니다: ${err.message}`);
      setIsAlertModalVisible(true);
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
      setAlertModalTitle('오류');
      setAlertModalMessage('게시물 정보 또는 사용자 ID가 없습니다.');
      setIsAlertModalVisible(true);
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
      setAlertModalTitle('수정 실패');
      setAlertModalMessage(`게시물 수정에 실패했습니다: ${err.message}`);
      setIsAlertModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePress = () => {
    setIsDeleteConfirmModalModalVisible(true);
  };

  const confirmDelete = async () => {
    setIsDeleteConfirmModalModalVisible(false);
    if (!post || !currentUserId) {
      setAlertModalTitle('오류');
      setAlertModalMessage('게시물 정보 또는 사용자 ID가 없습니다.');
      setIsAlertModalVisible(true);
      return;
    }
    try {
      await deletePost({ id: post.id, userId: currentUserId });
      navigation.goBack();
    } catch (err: any) {
      console.error("게시물 삭제 실패:", err);
      setAlertModalTitle('삭제 실패');
      setAlertModalMessage(`게시물 삭제에 실패했습니다: ${err.message}`);
      setIsAlertModalVisible(true);
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
      setAlertModalTitle('오류');
      setAlertModalMessage('로그인된 사용자 정보가 없습니다.');
      setIsAlertModalVisible(true);
      return;
    }
    if (userAdminDong !== post?.admin_dong) {
        setAlertModalTitle('알림');
        setAlertModalMessage('이 게시물은 다른 동네 게시물입니다. 댓글을 작성할 수 없습니다.');
        setIsAlertModalVisible(true);
        setNewCommentText('');
        Keyboard.dismiss();
        return;
    }
    if (newCommentText.trim() === '') {
      setAlertModalTitle('알림');
      setAlertModalMessage('댓글 내용을 입력해야 해요.');
      setIsAlertModalVisible(true);
      return;
    }
    try {
      await createComment(postId, { userId: currentUserId, content: newCommentText });
      setNewCommentText('');
      fetchComments();
      Keyboard.dismiss();
    } catch (err: any) {
      console.error("댓글 작성 실패:", err);
      setAlertModalTitle('댓글 작성 실패');
      setAlertModalMessage(`댓글 작성에 실패했습니다: ${err.message}`);
      setIsAlertModalVisible(true);
    }
  };

  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.content);
  };

  const handleUpdateComment = async (commentId: number) => {
    if (!currentUserId) {
      setAlertModalTitle('오류');
      setAlertModalMessage('로그인된 사용자 정보가 없습니다.');
      setIsAlertModalVisible(true);
      return;
    }
    if (editingCommentText.trim() === '') {
      setAlertModalTitle('알림');
      setAlertModalMessage('댓글 내용을 입력해주세요.');
      setIsAlertModalVisible(true);
      return;
    }
    try {
      await updateComment(commentId, { userId: currentUserId, content: editingCommentText });
      setEditingCommentId(null);
      setEditingCommentText('');
      fetchComments();
      Keyboard.dismiss();
    } catch (err: any) {
      console.error("댓글 수정 실패:", err);
      setAlertModalTitle('댓글 수정 실패');
      setAlertModalMessage(`댓글 수정에 실패했습니다: ${err.message}`);
      setIsAlertModalVisible(true);
    }
  };

  const handleDeleteCommentPress = (commentId: number) => {
    setCommentToDeleteId(commentId);
    setIsCommentDeleteConfirmModalVisible(true);
  };

  const confirmDeleteComment = async () => {
    setIsCommentDeleteConfirmModalVisible(false);
    if (!currentUserId || commentToDeleteId === null) {
      setAlertModalTitle('오류');
      setAlertModalMessage('사용자 정보 또는 삭제할 댓글 정보가 없습니다.');
      setIsAlertModalVisible(true);
      return;
    }
    try {
      await deleteComment(commentToDeleteId, { userId: currentUserId });
      setCommentToDeleteId(null);
      fetchComments();
    } catch (err: any) {
      console.error("댓글 삭제 실패:", err);
      setAlertModalTitle('댓글 삭제 실패');
      setAlertModalMessage(`댓글 삭제에 실패했습니다: ${err.message}`);
      setIsAlertModalVisible(true);
    }
  };

  const handleToggleLike = async () => {
    if (!currentUserId) {
      setAlertModalTitle('알림');
      setAlertModalMessage('로그인이 필요합니다.');
      setIsAlertModalVisible(true);
      return;
    }
    try {
      const payload: ToggleLikePayload = { userId: currentUserId };
      const response = await toggleLike(postId, payload);
      setIsLiked(response.liked);
      fetchLikesInfo(); 
    } catch (err: any) {
      console.error("좋아요 토글 실패:", err);
      setAlertModalTitle('좋아요 오류');
      setAlertModalMessage(`좋아요 처리 중 오류가 발생했습니다: ${err.message}`);
      setIsAlertModalVisible(true);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLOR_PALETTE.GRAYISH_BROWN_DARK} />
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
  const userCanComment = userAdminDong === post.admin_dong;

  const imageExtraScrollHeight = Platform.OS === 'ios' ? 60 : 200;
  const noImageExtraScrollHeight = Platform.OS === 'ios' ? 80 : 80;
  const imageExtraHeight = Platform.OS === 'ios' ? 50 : 30;
  const noImageExtraHeight = Platform.OS === 'ios' ? 20 : 10;

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
          colors={[COLOR_PALETTE.GRAYISH_BROWN_DARK]}
          tintColor={COLOR_PALETTE.GRAYISH_BROWN_DARK}
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
            <Ionicons name="person-circle" size={20} color={COLOR_PALETTE.GRAYISH_BROWN_DARK} />
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
              <Ionicons name={isLiked ? "heart" : "heart-outline"} size={24} color={isLiked ? COLOR_PALETTE.LIKE_COLOR : COLOR_PALETTE.GRAY_MEDIUM} />
              <Text style={styles.likeCount}>{likesCount}</Text>
            </TouchableOpacity>
          </View>

          {isMyPost && (
            <View style={styles.buttonContainer}>
              <Pressable
                onPress={handleEdit}
                style={({ pressed }) => [
                  styles.iconButton,
                  { backgroundColor: pressed ? COLOR_PALETTE.BORDER_COLOR : 'transparent' },
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
                  { backgroundColor: pressed ? COLOR_PALETTE.BORDER_COLOR : 'transparent' },
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
              onSubmitEditing={userCanComment ? handleCreateComment : undefined}
              editable={userCanComment}
            />
            <TouchableOpacity 
                style={[styles.submitCommentButton, !userCanComment && styles.disabledButton]} 
                onPress={handleCreateComment} 
                disabled={!userCanComment}
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
              <Ionicons name="close-circle" size={40} color={COLOR_PALETTE.WHITE} />
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
          onCancel={() => setIsDeleteConfirmModalModalVisible(false)}
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

        <CustomAlertModal
          isVisible={isAlertModalVisible}
          title={alertModalTitle}
          message={alertModalMessage}
          onClose={() => setIsAlertModalVisible(false)}
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
    backgroundColor: COLOR_PALETTE.WHITE, // 변경: #fff -> COLOR_PALETTE.WHITE
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLOR_PALETTE.WHITE, // 변경: #fff -> COLOR_PALETTE.WHITE
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLOR_PALETTE.GRAY_MEDIUM, // 변경: #666 -> COLOR_PALETTE.GRAY_MEDIUM
  },
  errorText: {
    fontSize: 18,
    color: COLOR_PALETTE.LIKE_COLOR, // 변경: red -> COLOR_PALETTE.LIKE_COLOR
    textAlign: 'center',
  },
  postImage: {
    width: width,
    height: width * 0.8,
    resizeMode: 'cover',
  },
  contentSection: {
    backgroundColor: COLOR_PALETTE.WHITE, // 변경: #FFFFFF -> COLOR_PALETTE.WHITE
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLOR_PALETTE.GRAY_DARK, // 변경: #333 -> COLOR_PALETTE.GRAY_DARK
  },
  content: {
    fontSize: 18,
    lineHeight: 26,
    color: COLOR_PALETTE.GRAY_DARK, // 변경: #444 -> COLOR_PALETTE.GRAY_DARK
    marginBottom: 50,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    borderTopColor: COLOR_PALETTE.BORDER_COLOR, // 변경: #eee -> COLOR_PALETTE.BORDER_COLOR
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
    tintColor: COLOR_PALETTE.GRAY_DARK, // 변경: #333 -> COLOR_PALETTE.GRAY_DARK
  },
  metaInfoContainer: {
    marginBottom: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLOR_PALETTE.BORDER_COLOR, // 변경: #E0E0E0 -> COLOR_PALETTE.BORDER_COLOR
    paddingBottom: 10,
    alignItems: 'flex-start',
  },
  dateTimeLocation: {
    fontSize: 14,
    color: COLOR_PALETTE.GRAY_LIGHT, // 변경: #777 -> COLOR_PALETTE.GRAY_LIGHT
  },
  titleAndNicknameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nicknameRight: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLOR_PALETTE.GRAYISH_BROWN_DARK, // 변경: #FF7E36 -> COLOR_PALETTE.ORANGE
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
    backgroundColor: COLOR_PALETTE.LIGHT_GRAY_BACKGROUND, // 변경: #f9f9f9 -> COLOR_PALETTE.LIGHT_GRAY_BACKGROUND
    paddingTop: 15,
    borderRadius: 15,
    marginHorizontal: 5,
    paddingBottom: 20,
    marginBottom: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLOR_PALETTE.BORDER_COLOR, // 변경: #eee -> COLOR_PALETTE.BORDER_COLOR
  },
  commentsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: COLOR_PALETTE.GRAY_DARK, // 변경: #333 -> COLOR_PALETTE.GRAY_DARK
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLOR_PALETTE.BORDER_COLOR, // 변경: #ddd -> COLOR_PALETTE.BORDER_COLOR
    borderRadius: 10,
    paddingRight: 5,
    backgroundColor: COLOR_PALETTE.WHITE, // 변경: #fff -> COLOR_PALETTE.WHITE
  },
  commentInput: {
    flex: 1,
    padding: 10,
    height: 50,
    fontSize: 16,
    color: COLOR_PALETTE.GRAY_MEDIUM, // 변경: #555 -> COLOR_PALETTE.GRAY_MEDIUM
  },
  submitCommentButton: {
    backgroundColor: COLOR_PALETTE.LIKE_COLOR, // 변경: #f4511e -> COLOR_PALETTE.GRAYISH_BROWN_DARK
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  submitCommentButtonText: {
    color: COLOR_PALETTE.WHITE, // 변경: #fff -> COLOR_PALETTE.WHITE
    fontWeight: 'bold',
    fontSize: 16,
  },
  commentItem: {
    backgroundColor: COLOR_PALETTE.WHITE, // 변경: #fff -> COLOR_PALETTE.WHITE
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLOR_PALETTE.BORDER_COLOR, // 변경: #eee -> COLOR_PALETTE.BORDER_COLOR
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  commentNickname: {
    fontWeight: 'bold',
    fontSize: 15,
    color: COLOR_PALETTE.GRAY_DARK, // 변경: #333 -> COLOR_PALETTE.GRAY_DARK
  },
  commentTime: {
    fontSize: 13,
    color: COLOR_PALETTE.GRAY_LIGHT, // 변경: #888 -> COLOR_PALETTE.GRAY_LIGHT
  },
  commentContent: {
    fontSize: 16,
    color: COLOR_PALETTE.GRAY_MEDIUM, // 변경: #555 -> COLOR_PALETTE.GRAY_MEDIUM
    lineHeight: 22,
  },
  noCommentsText: {
    textAlign: 'center',
    color: COLOR_PALETTE.GRAY_LIGHT, // 변경: #777 -> COLOR_PALETTE.GRAY_LIGHT
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
    color: COLOR_PALETTE.GRAY_MEDIUM, // 변경: #666 -> COLOR_PALETTE.GRAY_MEDIUM
    marginLeft: 10,
  },
  actionSeparator: {
    fontSize: 13,
    color: COLOR_PALETTE.GRAY_VERY_LIGHT, // 변경: #ccc -> COLOR_PALETTE.GRAY_VERY_LIGHT
    marginHorizontal: 5,
  },
  editingCommentContainer: {
    marginTop: 5,
  },
  editingCommentInput: {
    borderWidth: 1,
    borderColor: COLOR_PALETTE.BORDER_COLOR, // 변경: #ddd -> COLOR_PALETTE.BORDER_COLOR
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
    backgroundColor: COLOR_PALETTE.GRAYISH_BROWN_DARK, // 변경: #f4511e -> COLOR_PALETTE.GRAYISH_BROWN_DARK
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 10,
  },
  editSaveButtonText: {
    color: COLOR_PALETTE.WHITE, // 변경: 'white' -> COLOR_PALETTE.WHITE
    fontWeight: 'bold',
  },
  editCancelButton: {
    backgroundColor: COLOR_PALETTE.GRAY_VERY_LIGHT, // 변경: #ccc -> COLOR_PALETTE.GRAY_VERY_LIGHT
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 10,
  },
  editCancelButtonText: {
    color: COLOR_PALETTE.GRAY_DARK, // 변경: #333 -> COLOR_PALETTE.GRAY_DARK
    fontWeight: 'bold',
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLOR_PALETTE.BORDER_COLOR, // 변경: #eee -> COLOR_PALETTE.BORDER_COLOR
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  likeCount: {
    marginLeft: 5,
    fontSize: 16,
    color: COLOR_PALETTE.GRAY_MEDIUM, // 변경: #666 -> COLOR_PALETTE.GRAY_MEDIUM
  },
  disabledButton: {
    backgroundColor: COLOR_PALETTE.GRAY_VERY_LIGHT, // 변경: #ccc -> COLOR_PALETTE.GRAY_VERY_LIGHT
  },
});