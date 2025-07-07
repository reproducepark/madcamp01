import axios from 'axios';
import { BASE_URL } from '@env';

export interface User {
    nickname: string;
    lat: number;
    lon: number;
};

export interface OnboardResponse {
    nickname: string;
    userId: string;
    adminDong: string;
    lat: number;
    lon: number;
  // 그 외 프로필 필드가 더 있다면 여기에 추가
}

// nickname으로 조회하는 api 필요
// export async function getUserByNickname(nickname: string): Promise<OnboardResponse> {
//   const res = await axios.get<OnboardResponse>(
//     `${BASE_URL}/api/auth/user`, 
//     { params: { nickname } }
//   );
//   return res.data;
// }

export async function createUser(user:User){
    let userId=null;
    let adminDong=null;

    try {
        console.log('온보딩 요청:',user);
        console.log('온보딩 요청 URL:',`${BASE_URL}/auth/onboard`);
        const onboardRes= await axios.post(`${BASE_URL}/auth/onboard`, user);
        console.log('온보딩 응담:',onboardRes.data);

        return onboardRes.data;

    } catch (e: any) {
        
        const message = e.response?.data?.message || e.message;
        console.error('온보딩 에러',message);

    };
    

    

};





