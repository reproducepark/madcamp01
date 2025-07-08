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
}

export interface CheckNicknameResponse {
    isAvailable: boolean;
    message: string;
}

interface UpdateUserLocationRequest {
  userId: string;
  lat: number;
  lon: number;
}

interface UpdateUserLocationResponse {
  message: string;
  adminDong: string;
}

export async function createUser(user: User): Promise<OnboardResponse> {
    try {
        console.log('온보딩 요청:', user);
        console.log('온보딩 요청 URL (Fetch):', `${BASE_URL}/auth/onboard`);

        const response = await fetch(`${BASE_URL}/auth/onboard`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user),
        });

        if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = errorData.message || `HTTP 에러! 상태: ${response.status}`;
            throw new Error(errorMessage);
        }

        const onboardResData: OnboardResponse = await response.json();
        console.log('온보딩 응답 (Fetch):', onboardResData);

        return onboardResData;

    } catch (e: any) {
        console.error('온보딩 에러 (Fetch):', e.message);
        
        throw new Error(e.message || '알 수 없는 오류가 발생했습니다.');
    }
};

/**
 * 닉네임 사용 가능 여부를 확인합니다. (Fetch API 사용)
 * @param nickname 확인할 닉네임
 * @returns 닉네임 사용 가능 여부 및 메시지를 포함하는 객체
 */
export async function checkNicknameAvailability(nickname: string): Promise<CheckNicknameResponse> {
    try {
        const url = `${BASE_URL}/auth/check-nickname?nickname=${encodeURIComponent(nickname)}`;
        console.log(`닉네임 중복 확인 요청 URL (Fetch): ${url}`);

        const response = await fetch(url);

        if (!response.ok) {
            // Check if the response is not OK (e.g., 404, 500)
            const errorData = await response.json(); // Attempt to parse error message from body
            const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
            throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('닉네임 중복 확인 응답 (Fetch):', data);
        return data;
    } catch (e: any) {
        console.error('닉네임 중복 확인 에러 (Fetch):', e.message);
        // Ensure a consistent return type for error cases
        throw new Error(e.message || '닉네임 중복 확인 중 알 수 없는 오류가 발생했습니다.');
    }
}

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