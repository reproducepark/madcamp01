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

    // console.log(`${BASE_URL}/posts`);
    const postRes = await fetch(`${BASE_URL}/posts`, {
        method: 'POST',
        body: formData,
    // 헤더를 직접 설정하지 마세요!
    // fetch가 자동으로 "Content-Type: multipart/form-data; boundary=…"를 붙여 줍니다.
    });

    if (!postRes.ok) {
        const text = await postRes.text();
        throw new Error(`HTTP ${postRes.status}: ${text}`);
    }

    const data=await postRes.json()

    console.log("포스트 응답 :", data)
    
    return data

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
