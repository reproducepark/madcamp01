import axios from 'axios';
import { BASE_URL } from '@env';

export interface PostPayload {
  userId: string;
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
    const { userId, content, lat, lon, adminDong, imageUri } = post;
    const formData = new FormData();

    console.log("포스트 요청 :", post);
    console.log("포스트 요청 URL :", `${BASE_URL}/posts`);

    formData.append('userId', userId);
    formData.append('content', content);
    formData.append('lat', String(lat));
    formData.append('lon', String(lon));
    // formData.append('adminDong', adminDong);

    if (imageUri) {
        formData.append('image',{
            uri: imageUri,
            name: imageUri.split('/').pop() || 'photo.jpg',
            type: 'image/jpeg',
        } as any); //여기 이해 못함
    }

    console.log(`${BASE_URL}/posts`);
    const postRes = await axios.post(`${BASE_URL}/posts`, formData);

    console.log("포스트 요청 완료");
    console.log("포스트 응답 :", postRes.data)
    
    // await axios.post(
    //     `${BASE_URL}/posts`,
    //     formData,
    //     {

    //     }
    // );

    
    return postRes.data

}


