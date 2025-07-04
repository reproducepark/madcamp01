// screens/OnboardingScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// 온보딩 완료 시 호출될 콜백 함수를 위한 Props 타입 정의
interface OnboardingScreenProps {
  onFinishOnboarding: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onFinishOnboarding }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>환영합니다!</Text>
      <Text style={styles.subtitle}>이 앱은 여러분의 삶을 더 편리하게 만들어 줄 것입니다.</Text>
      <Text style={styles.description}>
        리스트, 갤러리, 지도 기능을 통해 다양한 정보를 확인하고 관리해보세요.
      </Text>
      <TouchableOpacity style={styles.button} onPress={onFinishOnboarding}>
        <Text style={styles.buttonText}>시작하기</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6200EE', // 배경색 (보라색 계열)
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF', // 흰색 글씨
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#E0E0E0', // 밝은 회색 글씨
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#E0E0E0', // 밝은 회색 글씨
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#03DAC6', // 버튼 배경색 (청록색 계열)
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25, // 둥근 버튼
    elevation: 5, // 안드로이드 그림자
    shadowColor: '#000', // iOS 그림자
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#FFFFFF', // 흰색 글씨
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default OnboardingScreen;
