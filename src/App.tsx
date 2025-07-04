// App.tsx
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // AsyncStorage 임포트

import { TabOneScreen } from './screens/TabOneScreen';
import { TabTwoScreen } from './screens/TabTwoScreen';
import { TabThreeScreen } from './screens/TabThreeScreen';
import OnboardingScreen from './screens/OnboardingScreen'; // 온보딩 스크린 임포트

const Tab = createBottomTabNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 관리
  const [isFirstLaunch, setIsFirstLaunch] = useState(false); // 첫 실행 여부 관리

  useEffect(() => {
    // 앱 시작 시 AsyncStorage에서 userID 확인
    const checkOnboardingStatus = async () => {
      try {
        const userID = await AsyncStorage.getItem('userID');
        if (userID === null) {
          // userID가 없으면 첫 실행으로 간주
          setIsFirstLaunch(true);
        } else {
          // userID가 있으면 온보딩 완료로 간주
          setIsFirstLaunch(false);
        }
      } catch (error) {
        console.error('AsyncStorage에서 userID를 확인하는 중 오류 발생:', error);
        // 오류 발생 시에도 첫 실행으로 간주하여 온보딩 페이지를 띄울 수 있도록 처리
        setIsFirstLaunch(true);
      } finally {
        setIsLoading(false); // 로딩 완료
      }
    };

    checkOnboardingStatus();
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  // 온보딩 완료 처리 함수
  const handleOnboardingComplete = async () => {
    try {
      // 새로운 UUID 생성 (crypto.randomUUID()는 React Native 환경에서 사용 가능)
      const newUserID = crypto.randomUUID();
      await AsyncStorage.setItem('userID', newUserID); // userID 저장
      setIsFirstLaunch(false); // 온보딩 완료 상태로 변경
      console.log('새로운 userID 저장:', newUserID);
    } catch (error) {
      console.error('userID 저장 중 오류 발생:', error);
      // 오류 발생 시에도 사용자 경험을 위해 온보딩 완료로 간주할 수 있음 (선택 사항)
      setIsFirstLaunch(false);
    }
  };

  if (isLoading) {
    // 로딩 중일 때 로딩 인디케이터 표시
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>데이터 로딩 중...</Text>
      </View>
    );
  }

  if (isFirstLaunch) {
    // 첫 실행이면 온보딩 스크린 표시
    return <OnboardingScreen onFinishOnboarding={handleOnboardingComplete} />;
  }

  // 첫 실행이 아니면 메인 앱 (탭 내비게이터) 표시
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap; // Ionicons 타입 정의

            switch (route.name) {
              case '리스트':
                iconName = focused ? 'people' : 'people-outline';
                break;
              case '갤러리':
                iconName = focused ? 'images' : 'images-outline';
                break;
              case '지도':
                iconName = focused ? 'map' : 'map-outline';
                break;
              default:
                iconName = 'ellipse'; // 기본 아이콘
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'tomato', // 활성 탭 아이콘 및 텍스트 색상
          tabBarInactiveTintColor: 'gray', // 비활성 탭 아이콘 및 텍스트 색상
          tabBarStyle: {
            backgroundColor: '#f8f8f8', // 탭 바 배경색
            borderTopWidth: 0, // 탭 바 상단 테두리 제거 (선택 사항)
            elevation: 10, // 안드로이드 그림자
            shadowOpacity: 0.1, // iOS 그림자
            shadowRadius: 5,
            shadowOffset: { width: 0, height: -3 },
            height: 60, // 탭 바 높이 조정
            paddingBottom: 5, // 아이콘과 텍스트의 하단 패딩
          },
          tabBarLabelStyle: {
            fontSize: 12, // 탭 레이블 글꼴 크기
          },
          headerStyle: {
            backgroundColor: '#f4511e', // 헤더 배경색
          },
          headerTintColor: '#fff', // 헤더 텍스트 색상
          headerTitleStyle: {
            fontWeight: 'bold', // 헤더 제목 글꼴 두께
          },
        })}
      >
        <Tab.Screen
          name="리스트"
          component={TabOneScreen}
          options={{ title: '리스트' }} // 탭 이름
        />
        <Tab.Screen
          name="갤러리"
          component={TabTwoScreen}
          options={{ title: '갤러리' }} // 탭 이름
        />
        <Tab.Screen
          name="지도"
          component={TabThreeScreen}
          options={{ title: '지도' }} // 탭 이름
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // 배경색
  },
});
