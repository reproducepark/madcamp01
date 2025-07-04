// screens/OnboardingScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import NicknameModal from '../components/NicknameModal'; // 닉네임 모달 임포트
import { Ionicons } from '@expo/vector-icons'; // Ionicons 임포트 (드롭다운 아이콘용)

// 온보딩 완료 시 호출될 콜백 함수를 위한 Props 타입 정의
interface OnboardingScreenProps {
  onFinishOnboarding: (nickname: string) => void; // 닉네임을 인자로 받도록 변경
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onFinishOnboarding }) => {
  const [isModalVisible, setModalVisible] = useState(false); // 닉네임 모달의 가시성 상태

  const handleStartPress = () => {
    setModalVisible(true); // "시작하기" 버튼 클릭 시 닉네임 모달 열기
  };

  const handleNicknameSubmit = (nickname: string) => {
    setModalVisible(false); // 모달 닫기
    onFinishOnboarding(nickname); // App.tsx로 닉네임을 전달하며 온보딩 완료 처리
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>이웃들은 어떤 생각을 하고 있을까요?</Text>
      <Text style={styles.description}>
        지금 닉네임을 선택하고 시작해보세요!
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleStartPress}>
        <Text style={styles.buttonText}>시작하기</Text>
      </TouchableOpacity>

      {/* 닉네임 입력 모달 컴포넌트 */}
      <NicknameModal
        isVisible={isModalVisible} // 모달의 가시성
        onClose={() => setModalVisible(false)} // 모달 닫기 요청 시 호출
        onSubmit={handleNicknameSubmit} // 닉네임 입력 완료 시 호출
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // 흰색 배경 (이미지에 맞춤)
    padding: 20,
  },
  carrotIcon: {
    width: 100, // 이미지 크기
    height: 100,
    resizeMode: 'contain', // 이미지 비율 유지
    marginBottom: 30, // 하단 여백
  },
  title: {
    fontSize: 22, // 제목 글꼴 크기
    fontWeight: 'bold',
    color: '#333333', // 어두운 회색 글씨
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666', // 회색 글씨
    marginBottom: 5,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 24, // 줄 간격
  },
  countrySelector: {
    flexDirection: 'row', // 가로 정렬
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd', // 연한 회색 테두리
    marginBottom: 50, // 하단 여백
  },
  flagIcon: {
    width: 20,
    height: 15,
    marginRight: 10,
  },
  countryText: {
    fontSize: 16,
    marginRight: 5,
  },
  button: {
    backgroundColor: '#FF7E36', // 당근색 버튼 배경
    paddingVertical: 15,
    paddingHorizontal: 100, // 버튼 좌우 패딩
    borderRadius: 5, // 둥근 모서리
    elevation: 5, // 안드로이드 그림자
    shadowColor: '#000', // iOS 그림자 색상
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: '80%', // 버튼 너비
  },
  buttonText: {
    color: '#FFFFFF', // 흰색 글씨
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center', // 텍스트 중앙 정렬
  },
  loginContainer: {
    flexDirection: 'row', // 가로 정렬
    marginTop: 20, // 상단 여백
  },
  loginText: {
    fontSize: 14,
    color: '#666666',
    marginRight: 5,
  },
  loginLink: {
    fontSize: 14,
    color: '#FF7E36', // 당근색 링크
    fontWeight: 'bold',
  },
});

export default OnboardingScreen;
