

import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; // Expo에서 제공하는 아이콘 라이브러리

// 탭 1에 해당하는 화면 컴포넌트
function TabOneScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>여기는 탭 1: 연락처 리스트</Text>
      <Text style={styles.subText}>연락처, 상품, 맛집 리스트 등을 보여줄 페이지입니다.</Text>
    </View>
  );
}

// 탭 2에 해당하는 화면 컴포넌트
function TabTwoScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>여기는 탭 2: 이미지 갤러리</Text>
      <Text style={styles.subText}>20개 이상의 이미지를 보여줄 갤러리 페이지입니다.</Text>
    </View>
  );
}

// 탭 3에 해당하는 화면 컴포넌트
function TabThreeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>여기는 탭 3: 자유 주제</Text>
      <Text style={styles.subText}>자유롭게 원하는 기능을 구현할 페이지입니다.</Text>
    </View>
  );
}

// 하단 탭 네비게이터 생성
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    // NavigationContainer는 전체 네비게이션 구조를 감싸야 합니다.
    <NavigationContainer>
      {/* Tab.Navigator가 실제 탭 UI를 렌더링합니다. */}
      <Tab.Navigator
        screenOptions={({ route }) => ({
          // 각 탭에 아이콘을 설정합니다.
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === '연락처') {
              iconName = focused ? 'people' : 'people-outline';
            } else if (route.name === '갤러리') {
              iconName = focused ? 'images' : 'images-outline';
            } else if (route.name === '자유주제') {
              iconName = focused ? 'star' : 'star-outline';
            }

            // Ionicons 컴포넌트를 사용하여 아이콘을 렌더링합니다.
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          // 활성 탭과 비활성 탭의 색상을 설정합니다.
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
          // 탭 바의 스타일을 설정합니다.
          tabBarStyle: {
            backgroundColor: '#f8f8f8',
          },
          // 헤더의 스타일을 설정합니다.
          headerStyle: {
            backgroundColor: '#f4511e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        })}
      >
        {/* 각 탭 화면을 정의합니다. */}
        <Tab.Screen name="연락처" component={TabOneScreen} />
        <Tab.Screen name="갤러리" component={TabTwoScreen} />
        <Tab.Screen name="자유주제" component={TabThreeScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// 공통으로 사용할 스타일 시트
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
  }
});
