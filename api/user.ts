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

// 요청 본문으로 보낼 데이터의 인터페이스 정의
interface UpdateUserLocationRequest {
  userId: string;
  lat: number;
  lon: number;
}

// 서버 응답 데이터의 인터페이스 정의
interface UpdateUserLocationResponse {
  message: string;
  adminDong: string;
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

export async function updateUserLocation(data: UpdateUserLocationRequest): Promise<UpdateUserLocationResponse> {
  const { userId, lat, lon } = data;

  // 클라이언트 측 유효성 검사 (서버에서도 하지만, 미리 체크하여 불필요한 요청 방지)
  if (!userId || typeof lat !== 'number' || typeof lon !== 'number') {
    throw new Error('사용자 ID, 위도, 경도는 필수입니다.');
  }

  try {
    const url = `${BASE_URL}/auth/update-location`; // 👈 서버의 실제 엔드포인트 URL로 변경해야 합니다.
                                                    // 예: /users/update-location 또는 /location/update
    console.log('위치 업데이트 요청:', data);
    console.log('위치 업데이트 요청 URL:', url);

    const response = await fetch(url, {
      method: 'POST', // 서버 로직이 req.body를 사용하므로 POST 요청
      headers: {
        'Content-Type': 'application/json', // JSON 형식으로 데이터 전송을 명시
      },
      body: JSON.stringify(data), // JavaScript 객체를 JSON 문자열로 변환하여 전송
    });

    // HTTP 응답 상태가 200 OK 범위가 아닌 경우 (예: 4xx, 5xx) 오류로 처리
    if (!response.ok) {
      let errorData: any;
      try {
        errorData = await response.json(); // 서버에서 보낸 에러 응답 본문을 JSON으로 파싱 시도
      } catch (jsonError) {
        console.error('Error parsing server error response for location update:', jsonError);
        throw new Error(`위치 업데이트 중 알 수 없는 서버 오류가 발생했습니다. 상태 코드: ${response.status}`);
      }

      // 서버에서 보낸 메시지 또는 기본 오류 메시지 사용
      const errorMessage = errorData.message || `서버 오류 발생: ${response.status}`;
      console.error('위치 업데이트 API 오류 (서버 응답):', response.status, errorMessage);
      throw new Error(errorMessage); // 에러 메시지와 함께 에러를 던집니다.
    }

    // 응답 본문을 JSON 형태로 파싱
    const responseData: UpdateUserLocationResponse = await response.json();
    console.log('위치 업데이트 응답:', responseData);

    return responseData;
  } catch (e: any) { // 네트워크 오류 또는 위에서 throw한 에러를 캐치
    const message = e.message || '네트워크 오류 또는 알 수 없는 오류가 발생했습니다.';
    console.error('위치 업데이트 API 오류 (네트워크 또는 클라이언트):', message);
    throw new Error(message); // 더 명확한 메시지를 전달합니다.
  }
}