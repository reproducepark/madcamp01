// api/post.ts

import { BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PostByIdResponse {
  id: number;
  user_id: string;
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
}

export interface NewPostResponse {
  postId: number; // 서버에서 Number()로 반환하도록 수정했으므로 number로 변경
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
  image_url: string | null;
  lat: number;
  lon: number;
  created_at: string;
  admin_dong: string;
  nickname: string;
}

export interface UpdatePost {
  id: number;
  userId: string;
  title : string;
  content: string;
  image_url_delete_flag: boolean;
  image_url_update_flag: boolean;
  image_uri: string | null;
}

export interface UpdagePostResponse {
  postId: number;
}

export interface DeletePost {
  id: number;
  userId: string;
}

export interface DeletePostResponse {
  postId: number;
}

export interface PostsbyUserIdResponse {
  id: number;
  title: string;
  image_url: string | null;
  created_at: string;
  admin_dong: string;
  nickname: string;
}

// --- 댓글 관련 인터페이스 ---
export interface Comment {
  id: number;
  post_id: number;
  user_id: string;
  content: string;
  created_at: string;
  nickname: string; // 댓글 작성자 닉네임 포함
}

export interface CreateCommentPayload {
  userId: string;
  content: string;
}

export interface CreateCommentResponse {
  message: string;
  commentId: number;
  postId: number;
  userId: string;
  content: string;
}

export interface UpdateCommentPayload {
  userId: string;
  content: string;
}

export interface UpdateCommentResponse {
  message: string;
  commentId: number;
}

export interface DeleteCommentPayload {
  userId: string;
}

export interface DeleteCommentResponse {
  message: string;
  commentId: number;
}

// --- 좋아요 관련 인터페이스 ---
export interface ToggleLikePayload {
  userId: string;
}

export interface ToggleLikeResponse {
  message: string;
  liked: boolean; // 좋아요 상태 (true: 좋아요 눌림, false: 좋아요 취소됨)
}

export interface LikesCountResponse {
  message: string;
  postId: number;
  likeCount: number;
}

export interface LikeStatusResponse {
  message: string;
  postId: number;
  userId: string;
  liked: boolean;
}


export async function createPost(post: NewPost): Promise<NewPostResponse> {
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

export async function updatePost(post: UpdatePost): Promise<UpdagePostResponse> {
  const { id, userId, title, content, image_url_delete_flag, image_url_update_flag, image_uri } = post;
  const formData = new FormData();

  console.log("게시글 수정 요청:", post);
  console.log("게시글 수정 요청 URL:", `${BASE_URL}/posts/${id}`);

  formData.append('userId', userId);
  formData.append('title', title);
  formData.append('content', content);
  formData.append('image_url_delete_flag', String(image_url_delete_flag));
  formData.append('image_url_update_flag', String(image_url_update_flag));


  if (image_uri && image_url_update_flag) {
      formData.append('image',{
          uri: image_uri,
          name: image_uri.split('/').pop() || 'photo.jpg',
          type: 'image/jpeg',
      } as any);
  }
  console.log("게시글 수정 요청 폼데이터 :", formData);

  const response = await fetch(`${BASE_URL}/posts/${id}`, {
      method: 'PUT',
      body: formData,
  });

  if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text} ${response.statusText}`);
  }

  const data = await response.json();
  console.log("게시글 수정 응답:", data);

  return data;
}

export async function deletePost(deletePayload: DeletePost): Promise<DeletePostResponse> {
  const { id, userId } = deletePayload;
  console.log("게시글 삭제 요청:", deletePayload);
  console.log("게시글 삭제 요청 URL:", `${BASE_URL}/posts/${id}`);

  const response = await fetch(`${BASE_URL}/posts/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId }), // 백엔드에서 userId를 body로 받는 경우
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  console.log("게시글 삭제 응답:", data);
  return data;
}

/**
 * 특정 userId의 게시글 목록을 가져옵니다.
 * @param userId 게시글을 조회할 사용자의 ID
 * @returns 특정 사용자의 게시글 목록을 포함하는 Promise
 * @throws HTTP 요청 실패 시 에러
 */
export async function getPostsByUserId(userId: string): Promise<PostsbyUserIdResponse[]> {
  console.log("Fetching posts for userId:", userId);
  console.log("Request URL:", `${BASE_URL}/posts/user/${userId}`);

  const response = await fetch(`${BASE_URL}/posts/user/${userId}`);

  if (response.status == 500) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  console.log("Posts by user ID response:", data);
  if (data.posts){
    return data.posts as PostsbyUserIdResponse[];
  }
  else{
    return [];
  }
}

// --- 새롭게 추가된 댓글 API 함수 ---

/**
 * 특정 게시글에 댓글을 작성합니다.
 * @param postId 댓글을 작성할 게시글의 ID
 * @param payload 댓글 내용 및 작성자 ID
 * @returns 생성된 댓글 정보
 * @throws HTTP 요청 실패 시 에러
 */
export async function createComment(postId: number, payload: CreateCommentPayload): Promise<CreateCommentResponse> {
  console.log(`Creating comment for post ID: ${postId}`, payload);
  console.log("Request URL:", `${BASE_URL}/posts/${postId}/comments`);

  const response = await fetch(`${BASE_URL}/posts/${postId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  console.log("Create comment response:", data);
  return data;
}

/**
 * 특정 게시글의 모든 댓글을 조회합니다.
 * @param postId 댓글을 조회할 게시글의 ID
 * @returns 해당 게시글의 댓글 목록
 * @throws HTTP 요청 실패 시 에러
 */
export async function getCommentsByPostId(postId: number): Promise<Comment[]> {
  console.log(`Fetching comments for post ID: ${postId}`);
  console.log("Request URL:", `${BASE_URL}/posts/${postId}/comments`);

  const response = await fetch(`${BASE_URL}/posts/${postId}/comments`);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  console.log("Comments by post ID response:", data);
  return data.comments as Comment[]; // 백엔드 응답 구조에 맞춤
}

/**
 * 댓글을 수정합니다.
 * @param commentId 수정할 댓글의 ID
 * @param payload 수정할 댓글 내용 및 수정자 ID
 * @returns 수정된 댓글 정보
 * @throws HTTP 요청 실패 시 에러
 */
export async function updateComment(commentId: number, payload: UpdateCommentPayload): Promise<UpdateCommentResponse> {
  console.log(`Updating comment ID: ${commentId}`, payload);
  console.log("Request URL:", `${BASE_URL}/posts/comments/${commentId}`);

  const response = await fetch(`${BASE_URL}/posts/comments/${commentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  console.log("Update comment response:", data);
  return data;
}

/**
 * 댓글을 삭제합니다.
 * @param commentId 삭제할 댓글의 ID
 * @param payload 삭제를 요청한 사용자 ID
 * @returns 삭제된 댓글 정보
 * @throws HTTP 요청 실패 시 에러
 */
export async function deleteComment(commentId: number, payload: DeleteCommentPayload): Promise<DeleteCommentResponse> {
  console.log(`Deleting comment ID: ${commentId}`, payload);
  console.log("Request URL:", `${BASE_URL}/posts/comments/${commentId}`);

  const response = await fetch(`${BASE_URL}/posts/comments/${commentId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  console.log("Delete comment response:", data);
  return data;
}

// --- 새롭게 추가된 좋아요 API 함수 ---

/**
 * 특정 게시글에 좋아요를 토글합니다 (누르기/취소).
 * @param postId 좋아요를 토글할 게시글의 ID
 * @param payload 좋아요를 요청한 사용자 ID
 * @returns 좋아요 상태 정보
 * @throws HTTP 요청 실패 시 에러
 */
export async function toggleLike(postId: number, payload: ToggleLikePayload): Promise<ToggleLikeResponse> {
  console.log(`Toggling like for post ID: ${postId}`, payload);
  console.log("Request URL:", `${BASE_URL}/posts/${postId}/likes`);

  const response = await fetch(`${BASE_URL}/posts/${postId}/likes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  console.log("Toggle like response:", data);
  return data;
}

/**
 * 특정 게시글의 좋아요 수를 조회합니다.
 * @param postId 좋아요 수를 조회할 게시글의 ID
 * @returns 좋아요 수 정보
 * @throws HTTP 요청 실패 시 에러
 */
export async function getLikesCountByPostId(postId: number): Promise<LikesCountResponse> {
  console.log(`Fetching likes count for post ID: ${postId}`);
  console.log("Request URL:", `${BASE_URL}/posts/${postId}/likes/count`);

  const response = await fetch(`${BASE_URL}/posts/${postId}/likes/count`);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  console.log("Likes count response:", data);
  return data;
}

/**
 * 특정 게시물에 대한 특정 사용자의 좋아요 상태를 확인합니다.
 * @param postId 좋아요 상태를 확인할 게시글의 ID
 * @param userId 좋아요 상태를 확인할 사용자의 ID
 * @returns 좋아요 상태 (눌렀는지 여부)
 * @throws HTTP 요청 실패 시 에러
 */
export async function getLikeStatusForUser(postId: number, userId: string): Promise<LikeStatusResponse> {
  console.log(`Fetching like status for post ID: ${postId} by user ID: ${userId}`);
  console.log("Request URL:", `${BASE_URL}/posts/${postId}/likes/status/${userId}`);

  const response = await fetch(`${BASE_URL}/posts/${postId}/likes/status/${userId}`);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  console.log("Like status response:", data);
  return data;
}