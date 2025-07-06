//api/post.ts

import axios from 'axios';
import { BASE_URL } from '@env';

export interface PostPayload {
  userId: string;
  title : string;
  content: string;
  lat: number;
  lon: number;
  adminDong: string;
  imageUri?: string;
}

export interface OnboardResponse {
    nickname: string;
    userId: string;
    adminDong: string;
    lat: number;
    lon: number;
  // 그 외 프로필 필드가 더 있다면 여기에 추가
}

export interface PostResponse {
  id: string;
  user_id: string;
  title: string;
  content: string;
  image_url: string | null; // Assuming image_url can be null if no image
  admin_dong: string;
  created_at: string; // Assuming created_at is a string (e.g., ISO format)
  nickname: string;
  lat: number; // Add lat to PostResponse
  lon: number; // Add lon to PostResponse
}

export interface Viewport {
  centerLat: number;
  centerLon: number;
  deltaLat: number;
  deltaLon: number;
  deltaRatioLat?: number;
  deltaRatioLon?: number;
}

export async function createPost(post: PostPayload) {
    const { userId, title, content, lat, lon, adminDong, imageUri } = post;
    const formData = new FormData();

    console.log("포스트 요청 :", post);
    console.log("포스트 요청 URL :", `${BASE_URL}/posts`);

    formData.append('userId', userId);
    formData.append('title', title);
    formData.append('content', content);
    formData.append('lat', String(lat));
    formData.append('lon', String(lon));
    formData.append('adminDong', adminDong);

    if (imageUri) {
        formData.append('image',{
            uri: imageUri,
            name: imageUri.split('/').pop() || 'photo.jpg',
            type: 'image/jpeg',
        } as any);
    }

    const postRes = await fetch(`${BASE_URL}/posts`, {
        method: 'POST',
        body: formData,
    });

    if (!postRes.ok) {
        const text = await postRes.text();
        throw new Error(`HTTP ${postRes.status}: ${text} ${postRes.statusText}`);
    }

    const data=await postRes.json()

    console.log("포스트 응답 :", data)

    return data

}

export async function getPostById(postId: string): Promise<PostResponse> {
  console.log("Fetching post with ID:", postId);
  console.log("Request URL:", `${BASE_URL}/posts/${postId}`);

  const response = await fetch(`${BASE_URL}/posts/${postId}`);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const data: PostResponse = await response.json();
  console.log("Post response:", data);
  return data;
}

export async function getPostsInViewport(viewport: Viewport): Promise<PostResponse[]> {
  let { centerLat, centerLon, deltaLat, deltaLon, deltaRatioLat, deltaRatioLon } = viewport;

  // 비율 파라미터가 제공되면 델타 값을 조절합니다.
  if (deltaRatioLat !== undefined) {
    deltaLat *= deltaRatioLat;
  }
  if (deltaRatioLon !== undefined) {
    deltaLon *= deltaRatioLon;
  }

  const url = new URL(`${BASE_URL}/posts/nearbyviewport`);
  url.searchParams.append('centerLat', String(centerLat));
  url.searchParams.append('centerLon', String(centerLon));
  url.searchParams.append('deltaLat', String(deltaLat));
  url.searchParams.append('deltaLon', String(deltaLon));

  console.log("Fetching posts in viewport with URL:", url.toString());

  const response = await fetch(url.toString());

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  console.log("Posts in viewport response:", data);

  return data.postsInViewport as PostResponse[];
}
export async function getNearbyPosts(lat: number,lon: number) {
  
console.log('Fetching nearby posts for:', { lat, lon });

  const url = `${BASE_URL}/posts/nearby`
    + `?currentLat=${encodeURIComponent(lat.toString())}`
    + `&currentLon=${encodeURIComponent(lon.toString())}`;

    const userId = await AsyncStorage.getItem('userID');
    // console.log('DEBUG ▶ userID:', userId);
    if (!userId) {
    throw new Error('로그인된 유저ID가 없습니다. 먼저 온보딩을 진행하세요.');
    }

  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();

  const { nearbyPosts } = data;
  if (nearbyPosts.length > 0) {
    console.log(`첫 번째 근처 글 제목: ${nearbyPosts[0].title}`);
  } else {
    console.log('근처에 게시물이 없습니다.');
  }

  return data;
}
