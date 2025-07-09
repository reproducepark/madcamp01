# 네이보 (Neighbor) 
우리 동네 SNS

---

|팀원|역할|github|
|------|---|---|
|박재현|백엔드 |https://github.com/reproducepark|
|백서경|프론트엔드|https://github.com/braveseokyung|


### ✨ 소개
네이보는 우리 동네의 이웃들과 함께하는 위치 기반 SNS입니다. 네이보에서 실시간으로 동네 소식을 공유하고, 동네 사람들만 아는 정보를 공유받고, 번개로 같이 밥먹거나 산책할 사람을 구해보세요!

### 📌 주요 기능

- 동네 소식 공유: 실시간으로 우리 동네의 다양한 소식, 맛집, 행사 정보 등을 이웃들과 공유하고 받아볼 수 있습니다.
- 상세 페이지 : 우리 동네에 작성된 글들을 눌러 자세한 이야기를 확인할 수 있습니다.
- 갤러리 더보기 : 사진을 통해 우리 동네의 여러 소식을 탐색할 수 있습니다.
- 지도 둘러보기 : 지도를 통해 어디에서 어떤 글이 작성되었는지 확인할 수 있습니다.
- 마이페이지 : 자신이 작성한 글을 볼 수 있습니다.

### 📍 자세한 기능
- 닉네임으로 로그인 : 유저 정보를 Asyncstorage에 저장해서 간이 로그인을 구현했습니다.
- 위치 정보 연동 : 사용자의 위치를 기반으로 근처의 글을 보여주는 기능을 구현했습니다.
- 글 CRUD : 글을 작성, 수정, 삭제가 가능하도록 구현했습니다.
- 이미지 압축 및 삽입 : 이미지를 압축하여 글에 첨부하고, 갤러리에 보이도록 했습니다.
- 좋아요, 댓글 : 글에 좋아요와 댓글을 달 수 있도록 했습니다. 좋아요 댓글 역시 수정 및 삭제가 가능합니다.
- 새로고침 : 새로고침 시 다른 사람이 새롭게 작성된 글들을 불러올 수 있고, 위치 정보를 업데이트 할 수 있습니다.

### 실행 화면

<img width="2960" height="2406" alt="Image" src="https://github.com/user-attachments/assets/97814248-0b04-4010-8d45-4c7015b3cc63" />

### 🚀 기술 스택
![React Native](https://img.shields.io/badge/react_native-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)![SQLite](https://img.shields.io/badge/sqlite-%2307405e.svg?style=for-the-badge&logo=sqlite&logoColor=white)
![Expo](https://img.shields.io/badge/expo-1C1E24?style=for-the-badge&logo=expo&logoColor=#D04A37)

### 🛠️ 설치 및 실행 방법

- 전제 조건
    - Node.js
    - npm 또는 yarn
    - Expo 앱 설치 및 가입
<br/>

- 프로젝트 클론

```
git clone https://github.com/reproducepark/madcamp01.git
cd madcamp01
```

- 패키지 설치

```
npm install
```

- expo에서 실행

```
npx expo start
```
