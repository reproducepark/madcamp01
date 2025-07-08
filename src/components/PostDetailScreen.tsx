// components/PostDetailScreen.tsx

import React, { useEffect, useState } from 'react';
import { Modal, TouchableOpacity, View, Text, StyleSheet, ActivityIndicator, ScrollView, Image, Dimensions, Pressable, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPostById, PostByIdResponse, deletePost, updatePost } from '../../api/post';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { TabOneStackParamList } from '../navigation/TabOneStack';
import { CustomConfirmModal } from './CustomConfirmModal';
// import { CustomAlertModal } from './CustomAlertModal'; // CustomAlertModal 더 이상 필요 없음
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
  
  // 일주일 이상 지난 경우, 원래 날짜 형식으로 표시
  return date.toLocaleDateString('ko-KR');
};

export function PostDetailScreen({ route, navigation }: PostDetailScreenProps) {
  const { postId } = route.params;
  const [post, setPost] = useState<PostByIdResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isDeleteConfirmModalVisible, setIsDeleteConfirmModalVisible] = useState<boolean>(false);
  const [isDeleteCompleteModalVisible, setIsDeleteCompleteModalVisible] = useState<boolean>(false); // 이 상태는 더 이상 사용되지 않지만, 선언은 유지
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [isImageModalVisible, setIsImageModalVisible] = useState<boolean>(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

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

  useEffect(() => {
    fetchPostDetails();
  }, [postId]);

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
      await fetchPostDetails(); // 수정 후 게시물 상세 정보 새로고침
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
      // setIsDeleteCompleteModalVisible(true); // 이 줄을 제거하여 삭제 완료 모달을 띄우지 않습니다.
      navigation.goBack(); // 삭제 성공 시 바로 이전 화면으로 이동
    } catch (err: any) {
      console.error("게시물 삭제 실패:", err);
      Alert.alert('삭제 실패', `게시물 삭제에 실패했습니다: ${err.message}`);
    }
  };

  // 삭제 완료 후 이전 화면으로 돌아가는 함수 (더 이상 직접 호출되지 않으므로 필요 없음)
  // const handleDeletionComplete = () => {
  //   setIsDeleteCompleteModalVisible(false);
  //   navigation.goBack();
  // };

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
  console.log("Current User ID:", currentUserId);
  console.log("Post User ID:", post.user_id);

  return (
    <ScrollView style={styles.container}>
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
                  source={require('../../assets/icons/edit.png')} // 아이콘 경로 확인 필요
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
                  source={require('../../assets/icons/trashcan.png')} // 아이콘 경로 확인 필요
                  style={styles.icon}
                />
              </Pressable>
            </View>
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

        {/* 게시물 삭제 완료 알림 모달 (더 이상 렌더링하지 않음) */}
        {/* <CustomAlertModal
          isVisible={isDeleteCompleteModalVisible}
          title="삭제 완료"
          message="게시물이 성공적으로 삭제되었습니다."
          onClose={handleDeletionComplete}
          confirmText="확인"
        /> */}

        {/* 게시물 수정 모달 */}
        <WriteModal
          visible={isEditModalVisible}
          onClose={() => setIsEditModalVisible(false)}
          onSave={handleUpdatePost} // 수정된 시그니처의 함수 연결
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
    minHeight: height * 0.3, // 약 5줄 정도의 텍스트가 들어갈 수 있도록 조정
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
    marginBottom: 50, // 버튼과 콘텐츠 사이 간격 유지
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    borderTopWidth: StyleSheet.hairlineWidth, // 구분선 두께 통일
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
    borderBottomWidth: StyleSheet.hairlineWidth, // 구분선 두께 통일
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
});