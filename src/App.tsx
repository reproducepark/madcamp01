// App.tsx
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, Text, View, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

import { TabOneNavigator } from './navigation/TabOneStack';
import { TabTwoNavigator } from './navigation/TabTwoStack';
import { TabThreeNavigator } from './navigation/TabThreeStack';
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
  홈: undefined;
  더보기: undefined;
  둘러보기: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        await requestLocationPermission();

        const userID = await AsyncStorage.getItem('userID');

        if (userID === null) {
          setIsFirstLaunch(true);
        } else {
          // console.log("현재 userID",userID);
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

  const requestLocationPermission = async () => {
    console.log('위치 권한 요청 시작...');
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('위치 권한 거부됨:', status);
      Alert.alert(
        '위치 권한 필요',
        '이 앱은 지도 기능을 위해 위치 권한이 필요합니다. 설정에서 권한을 허용해주세요.',
        [
          { text: '확인', onPress: () => console.log('위치 권한 거부됨') },
        ]
      );
      return false;
    }
    console.log('위치 권한 허용됨');
    return true;
  };

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
             let iconSource;

            switch (route.name) {
              case '홈':
                iconSource = focused
                  ? require('../assets/icons/home.png')
                  : require('../assets/icons/home_u.png');
                break;
              case '더보기':
                iconSource = focused
                  ? require('../assets/icons/mag.png')
                  : require('../assets/icons/mag_u.png');
                break;
              case '둘러보기':
                iconSource = focused
                  ? require('../assets/icons/maps.png')
                  : require('../assets/icons/maps_u.png');
                break;
            }
            return (
            <Image
              source={iconSource}
              style={{ width: size, height: size, tintColor: color }}
            />
          );
          },
          tabBarActiveTintColor: 'black',
          tabBarStyle: {
            backgroundColor: '#f8f8f8',
            borderTopWidth: 0,
            elevation: 10,
            shadowOpacity: 0.1,
            shadowRadius: 5,
            shadowOffset: { width: 0, height: -3 },
            height: 75,
            paddingBottom: 5,
          },
          tabBarLabelStyle: {
            fontSize: 12,
          },
          headerStyle: {
            backgroundColor: '#ffc600', // <-- '#f4511e' (주황)에서 '#ffc600' (머스타드)로 변경
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        })}
      >
        <Tab.Screen
          name="홈"
          component={TabOneNavigator}
          options={{ title: '홈', headerShown: false }}
        />
        <Tab.Screen
          name="더보기"
          component={TabTwoNavigator}
          options={{ title: '더보기', headerShown: false }}
        />
        <Tab.Screen
          name="둘러보기"
          component={TabThreeNavigator}
          options={{ title: '둘러보기', headerShown: false }}
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