// src/App.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TabOneScreen, TabTwoScreen, TabThreeScreen } from './screens';
import { Ionicons } from '@expo/vector-icons'; // Expo에서 제공하는 아이콘 라이브러리
import { useEffect, useState } from 'react';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          // 각 탭에 아이콘을 설정합니다.
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

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
              iconName = 'ellipse';
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
        <Tab.Screen
          name="리스트"
          component={TabOneScreen}
          options={{ title: '리스트' }}
        />
        <Tab.Screen
          name="갤러리"
          component={TabTwoScreen}
          options={{ title: '갤러리' }}
        />
        <Tab.Screen
          name="지도"
          component={TabThreeScreen}
          options={{ title: '지도' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
