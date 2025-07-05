// App.tsx
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

declare global {
  // eslint-disable-next-line no-var
  var AsyncStorage: any;
}
if (__DEV__) { // 개발 모드에서만 실행되도록 보호
  global.AsyncStorage = AsyncStorage;
  console.log('AsyncStorage object exposed globally for debugging.');
}

import { TabOneScreen } from './screens/TabOneScreen';
import { TabTwoScreen } from './screens/TabTwoScreen';
import { TabThreeScreen } from './screens/TabThreeScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import { OnboardResponse } from '../api/post';

const Tab = createBottomTabNavigator();

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

  // 온보딩 완료 및 닉네임 저장 처리 함수
  // const handleOnboardingComplete = async (nickname: string) => {
  const handleOnboardingComplete = async (user: OnboardResponse) => {
    try {
      // const newUserID = 'test-uuid-12345';

      const { adminDong, lat, lon, nickname, userId} = user;
      await AsyncStorage.setItem('userID', userId);
      await AsyncStorage.setItem('userNickname', nickname); // 닉네임 저장
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
    // 온보딩 스크린에 닉네임 입력 완료 콜백 전달
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

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
