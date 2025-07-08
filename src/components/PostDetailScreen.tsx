// components/PostDetailScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Image, Dimensions } from 'react-native';
import { getPostById, PostByIdResponse } from '../../api/post'; // Adjust path if needed
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Import the specific parameter list for TabOne's stack
import { TabOneStackParamList } from '../navigation/TabOneStack'; // <--- NEW IMPORT

// Define the route and navigation prop types using TabOneStackParamList
type PostDetailScreenRouteProp = RouteProp<TabOneStackParamList, 'PostDetail'>; // <--- CHANGED TYPE
type PostDetailScreenNavigationProp = StackNavigationProp<TabOneStackParamList, 'PostDetail'>; // <--- CHANGED TYPE

interface PostDetailScreenProps {
  route: PostDetailScreenRouteProp;
  navigation: PostDetailScreenNavigationProp;
}

const { width } = Dimensions.get('window');

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

export function PostDetailScreen({ route }: PostDetailScreenProps) {
  const { postId } = route.params;
  const [post, setPost] = useState<PostByIdResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        setLoading(true);
        const fetchedPost = await getPostById(postId);
        setPost(fetchedPost);
      } catch (err: any) {
        console.error("Error fetching post details:", err);
        setError(`Failed to load post: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetails();
  }, [postId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#f4511e" />
        <Text style={styles.loadingText}>Loading post details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Post not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {post.image_url && (
        <Image source={{ uri: post.image_url }} style={styles.postImage} />
      )}
      <View style={styles.contentContainer}>
        {/* <Text style={styles.title}>{post.title}</Text> */}
        {/* <Text style={styles.author}>By {post.nickname}</Text>
        <Text style={styles.date}>Posted on: {new Date(post.created_at).toLocaleDateString()}</Text>
        <Text style={styles.location}>Location: {post.admin_dong}</Text>
        <Text style={styles.content}>{post.content}</Text> */}


        {/* <View style={styles.metaInfoContainer}>
          <Text style={styles.nicknameDisplay}>By {post.nickname}</Text>
          <Text style={styles.dateTimeLocation}>
            {new Date(post.created_at).toLocaleDateString('ko-KR')} · {post.admin_dong}
          </Text>
        </View> */}

        {/* <View style={styles.contentContainer}> */}
          {/* 👈 제목과 닉네임을 한 줄에 배치하는 컨테이너 */}
          <View style={styles.titleAndNicknameContainer}>
            <Text style={styles.title}>{post.title}</Text>
            
          </View>
          <View style={styles.nicknameContainer}>
            <Ionicons name="person-circle" size={20} color="#f4511e" />
            <Text style={styles.nicknameRight}>{post.nickname}</Text>
          </View>
          

          <View style={styles.metaInfoContainer}>
          {/* 👈 작성일과 위치를 한 줄에 표시 (상대 시간 적용) */}
            <Text style={styles.dateTimeLocation}>
              {formatRelativeTime(post.created_at)} · {post.admin_dong}
            </Text>
          </View>

          <Text style={styles.content}>{post.content}</Text>
          
        </View>
        

      {/* </View> */}
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
    // marginBottom: 15,
  },
  contentContainer: {
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
  },
  metaInfoContainer: { // 작성자, 날짜, 위치 정보를 담는 컨테이너
    marginBottom: 15,
    borderBottomWidth: StyleSheet.hairlineWidth, // 하단 구분선
    borderBottomColor: '#E0E0E0',
    paddingBottom: 10,
    alignItems: 'flex-start', // 텍스트들을 중앙 정렬
  },

  dateTimeLocation: { // 날짜와 위치를 함께 표시하는 스타일
    fontSize: 14,
    color: '#777',
  },
  titleAndNicknameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // 제목은 왼쪽, 닉네임은 오른쪽으로 정렬
    alignItems: 'center', // 세로 중앙 정렬
    // marginBottom: 15,
  },
  nicknameRight: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF7E36', // 당근색으로 강조
    marginLeft: 5,
  },
  nicknameContainer: {

    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom:10,

  }
});