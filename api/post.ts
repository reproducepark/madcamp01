//api/post.ts

import axios from 'axios';
import { BASE_URL } from '@env';

export interface PostByIdResponse {
  id: number;
  userId: string;
  title : string;
  content: string;
  image_url?: string;
  admin_dong: string;
  created_at: string;
  nickname: string;
}

export interface NewPost {
  userId: string;
  title : string;
  content: string;
  lat: number;
  lon: number;
  image_uri?: string;
}

export interface OnboardResponse {
  nickname: string;
  userId: string;
  adminDong: string;
  lat: number;
  lon: number;
  // 그 외 프로필 필드가 더 있다면 여기에 추가
}

export interface NewPostResponse {
  postId: string;
  user_id: string;
  title: string;
  content: string;
  image_url: string | null; // Assuming image_url can be null if no image
  lat: number; // Add lat to PostResponse
  lon: number; // Add lon to PostResponse
  admin_dong: string;
  upper_admin_dong: string;
}

export interface NearByPostsUpperResponse {
  id: number;
  title: string;
  image_url: string | null;
  created_at: string;
  admin_dong: string;
  upper_admin_dong: string;
  nickname: string;
}

export interface NearByPostsUpperResponses {
  message: string;
  yourLocation: {lat:number, lon:number};
  yourUpperAdminDong: string;
  nearbyPosts: NearByPostsUpperResponse[];
}

export interface NearByPostsResponse {
  id: number;
  title: string;
  image_url: string | null;
  created_at: string;
  admin_dong: string;
  nickname: string;
}

export interface Viewport {
  centerLat: number;
  centerLon: number;
  deltaLat: number;
  deltaLon: number;
  deltaRatioLat?: number;
  deltaRatioLon?: number;
}

export interface NearByViewportResponse {
  id: number;
  title: string;
  content: string;
  image_url: string | null; // Assuming image_url can be null if no image
  lat: number; // Add lat to PostResponse
  lon: number; // Add lon to PostResponse
  created_at: string;
  admin_dong: string;
  nickname: string;
}

export async function createPost(post: NewPost): Promise<NewPostResponse> {
    // const { userId, title, content, lat, lon, adminDong, upperAdminDong, imageUri } = post;
    const { userId, title, content, lat, lon, image_uri} = post;
    const formData = new FormData();

    console.log("포스트 요청 :", post);
    console.log("포스트 요청 URL :", `${BASE_URL}/posts`);

    formData.append('userId', userId);
    formData.append('title', title);
    formData.append('content', content);
    formData.append('lat', String(lat));
    formData.append('lon', String(lon));

    if (image_uri) {
        formData.append('image',{
            uri: image_uri,
            name: image_uri.split('/').pop() || 'photo.jpg',
            type: 'image/jpeg',
        } as any);
    }
    console.log("포스트 요청 폼데이터 :", formData);

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

export async function getPostById(postId: number): Promise<PostByIdResponse> {
  console.log("Fetching post with ID:", postId);
  console.log("Request URL:", `${BASE_URL}/posts/${postId}`);

  const response = await fetch(`${BASE_URL}/posts/${postId}`);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  console.log("Post response:", data);
  return data;
}

export async function getPostsInViewport(viewport: Viewport): Promise<NearByViewportResponse[]> {
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

  return data.postsInViewport
}

export async function getNearbyPosts(lat: number, lon: number) {
  
    console.log('Fetching nearby posts for:', { lat, lon });

    const url = `${BASE_URL}/posts/nearby`
        + `?currentLat=${encodeURIComponent(lat.toString())}`
        + `&currentLon=${encodeURIComponent(lon.toString())}`;

        const userId = await AsyncStorage.getItem('userID');
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

export async function getNearbyPostsUpper(
  lat: number,
  lon: number
): Promise<NearByPostsUpperResponses> {
  console.log('Fetching nearby-upper posts for:', { lat, lon });

  const userId = await AsyncStorage.getItem('userID');
  if (!userId) {
    throw new Error('로그인된 유저ID가 없습니다. 먼저 온보딩을 진행하세요.');
  }

  const url =
    `${BASE_URL}/posts/nearbyupper` +
    `?currentLat=${encodeURIComponent(lat.toString())}` +
    `&currentLon=${encodeURIComponent(lon.toString())}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errText}`);
  }

  const data = await res.json();

  if (data.nearbyPosts.length>0) {
    console.log(`첫 번째 상위 행정동 근처 글 제목: ${data.nearbyPosts[0].title}`);
  } else {
    console.log('상위 행정동 근처에 게시물이 없습니다.');
  }

  return data;
}