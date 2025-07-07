// App.tsx
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { TabOneNavigator } from './navigation/TabOneStack';
import { TabTwoNavigator } from './navigation/TabTwoStack';
import { TabThreeNavigator } from './navigation/TabThreeStack'; // <--- NEW: TabThree 내비게이터 임포트
import OnboardingScreen from './screens/OnboardingScreen';
import { OnboardResponse } from '../api/post';
declare global {
  // eslint-disable-next-line no-var
  var AsyncStorage: any;
}
if (__DEV__) {
  global.AsyncStorage = AsyncStorage;
  console.log('AsyncStorage object exposed globally for debugging.');
}

// Bottom Tab Navigator의 파라미터 목록을 정의합니다.
export type RootTabParamList = {
  리스트: undefined; // 이 탭은 TabOneNavigator를 렌더링
  갤러리: undefined; // <--- CHANGED: 이 탭은 TabTwoNavigator를 렌더링
  지도: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const userID = await AsyncStorage.getItem('userID');

        if (userID === null) {
          setIsFirstLaunch(true);
        } else {
          setIsFirstLaunch(false);
        }
      } catch (error) {
        console.error('Error checking userID from AsyncStorage:', error);
        setIsFirstLaunch(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  const handleOnboardingComplete = async (user: OnboardResponse) => {
    try {
      const { nickname, userId, adminDong, lat, lon} = user;

      await AsyncStorage.multiSet([
        ['userID',        userId         ],
        ['userNickname',  nickname       ],
        ['userLat',       String(lat)    ],
        ['userLon',       String(lon)    ],
        ['userAdminDong', adminDong      ],
      ]);

      setIsFirstLaunch(false);
      console.log('New userID saved:', userId);
      console.log('User nickname saved:', nickname);
    } catch (error) {
      console.error('Error saving userID or nickname:', error);
      setIsFirstLaunch(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading data...</Text>
      </View>
    );
  }

  if (isFirstLaunch) {
    return <OnboardingScreen onFinishOnboarding={handleOnboardingComplete} />;
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

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
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            backgroundColor: '#f8f8f8',
            borderTopWidth: 0,
            elevation: 10,
            shadowOpacity: 0.1,
            shadowRadius: 5,
            shadowOffset: { width: 0, height: -3 },
            height: 60,
            paddingBottom: 5,
          },
          tabBarLabelStyle: {
            fontSize: 12,
          },
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
          component={TabOneNavigator}
          options={{ title: '리스트', headerShown: false }}
        />
        <Tab.Screen
          name="갤러리"
          component={TabTwoNavigator}
          options={{ title: '갤러리', headerShown: false }}
        />
        <Tab.Screen
          name="지도"
          component={TabThreeNavigator} // <--- CHANGED: TabThreeNavigator 사용
          options={{ title: '지도', headerShown: false }} // <--- CHANGED: 스택 내에서 헤더를 관리하므로 false로 설정
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
    backgroundColor: '#fff',
  },
});