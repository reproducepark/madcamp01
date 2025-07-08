// components/PostDetailScreen.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Image, Dimensions, Pressable, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPostById, PostByIdResponse, deletePost, updatePost } from '../../api/post';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { TabOneStackParamList } from '../navigation/TabOneStack';
import { CustomConfirmModal } from './CustomConfirmModal';
import { CustomAlertModal } from './CustomAlertModal';
import { WriteModal } from './WriteModal';

type PostDetailScreenRouteProp = RouteProp<TabOneStackParamList, 'PostDetail'>;
type PostDetailScreenNavigationProp = StackNavigationProp<TabOneStackParamList, 'PostDetail'>;

interface PostDetailScreenProps {
  route: PostDetailScreenRouteProp;
  navigation: PostDetailScreenNavigationProp;
}

const { width } = Dimensions.get('window');

export function PostDetailScreen({ route, navigation }: PostDetailScreenProps) {
  const { postId } = route.params;
  const [post, setPost] = useState<PostByIdResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isDeleteConfirmModalVisible, setIsDeleteConfirmModalVisible] = useState<boolean>(false);
  const [isDeleteCompleteModalVisible, setIsDeleteCompleteModalVisible] = useState<boolean>(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);

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

  const handleEdit = () => {
    if (post) {
      setIsEditModalVisible(true);
    }
  };

  // ✨ onSave 콜백 함수 시그니처 변경 반영
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
        image_url_delete_flag: imageDeleteFlag || false, // ✨ 플래그 전달
        image_url_update_flag: imageUpdateFlag || false, // ✨ 플래그 전달
      });
      setIsEditModalVisible(false);
      await fetchPostDetails();
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
      setIsDeleteCompleteModalVisible(true);
    } catch (err: any) {
      console.error("게시물 삭제 실패:", err);
      Alert.alert('삭제 실패', `게시물 삭제에 실패했습니다: ${err.message}`);
    }
  };

  const handleDeletionComplete = () => {
    setIsDeleteCompleteModalVisible(false);
    navigation.goBack();
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
        <Image source={{ uri: post.image_url }} style={styles.postImage} />
      )}
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.author}>작성자: {post.nickname}</Text>
        <Text style={styles.date}>작성일: {new Date(post.created_at).toLocaleDateString('ko-KR')}</Text>
        <Text style={styles.location}>위치: {post.admin_dong}</Text>
        <Text style={styles.content}>{post.content}</Text>

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

      <CustomConfirmModal
        isVisible={isDeleteConfirmModalVisible}
        title="정말 삭제할까요?"
        message="삭제된 글은 복구할 수 없어요."
        onCancel={() => setIsDeleteConfirmModalVisible(false)}
        onConfirm={confirmDelete}
        confirmText="삭제"
        cancelText="취소"
      />

      <CustomAlertModal
        isVisible={isDeleteCompleteModalVisible}
        title="삭제 완료"
        message="게시물이 성공적으로 삭제되었습니다."
        onClose={handleDeletionComplete}
        confirmText="확인"
      />

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
    height: width * 0.6,
    resizeMode: 'cover',
    marginBottom: 15,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  author: {
    fontSize: 16,
    color: '#555',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#777',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#777',
    marginBottom: 15,
  },
  content: {
    fontSize: 18,
    lineHeight: 26,
    color: '#444',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    borderTopWidth: 1,
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
});