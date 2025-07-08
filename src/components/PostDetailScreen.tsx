import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Image, Dimensions, Pressable, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPostById, PostByIdResponse, deletePost } from '../../api/post';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { TabOneStackParamList } from '../navigation/TabOneStack';
import { CustomConfirmModal } from './CustomConfirmModal';
import { CustomAlertModal } from './CustomAlertModal'; // CustomAlertModal 임포트

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
  const [isDeleteConfirmModalVisible, setIsDeleteConfirmModalVisible] = useState<boolean>(false); // 삭제 확인 모달
  const [isDeleteCompleteModalVisible, setIsDeleteCompleteModalVisible] = useState<boolean>(false); // 삭제 완료 모달

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

  useEffect(() => {
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

    fetchPostDetails();
  }, [postId]);

  const handleEdit = () => {
    Alert.alert('수정하기', '게시물 수정 로직을 여기에 구현하세요.');
    // 예: navigation.navigate('EditPost', { postId: post.id });
  };

  // '삭제하기' 버튼 클릭 핸들러: 삭제 확인 모달을 띄웁니다.
  const handleDeletePress = () => {
    setIsDeleteConfirmModalVisible(true);
  };

  // 실제 삭제 로직
  const confirmDelete = async () => {
    setIsDeleteConfirmModalVisible(false); // 삭제 확인 모달 닫기
    if (!post || !currentUserId) {
      Alert.alert('오류', '게시물 정보 또는 사용자 ID가 없습니다.');
      return;
    }
    try {
      // 게시물 삭제 API 호출
      await deletePost({ id: post.id, userId: currentUserId });
      setIsDeleteCompleteModalVisible(true); // 삭제 완료 모달 표시
      // Alert.alert('삭제 완료', '게시물이 삭제되었습니다.'); // 기존 Alert 제거
      // navigation.goBack(); // 삭제 완료 모달이 닫힌 후 이동하도록 변경
    } catch (err: any) {
      console.error("게시물 삭제 실패:", err);
      Alert.alert('삭제 실패', `게시물 삭제에 실패했습니다: ${err.message}`);
    }
  };

  const handleDeletionComplete = () => {
    setIsDeleteCompleteModalVisible(false); // 삭제 완료 모달 닫기
    navigation.goBack(); // 이전 화면으로 돌아가기
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