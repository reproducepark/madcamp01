// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { TabOneScreen } from './screens/TabOneScreen';
import { TabTwoScreen } from './screens/TabTwoScreen';
import { TabThreeScreen } from './screens/TabThreeScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
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
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            backgroundColor: '#f8f8f8',
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