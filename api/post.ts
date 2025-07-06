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


