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