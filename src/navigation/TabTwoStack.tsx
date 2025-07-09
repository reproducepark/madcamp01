// navigation/TabTwoStack.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TabTwoScreen } from '../screens/TabTwoScreen'; // TabTwoScreen 경로 확인
import { PostDetailScreen } from '../components/PostDetailScreen'; // PostDetailScreen 경로 확인
import { MyPageScreen } from '../screens/MyPage';

// 이 스택 내비게이터의 파라미터 목록을 정의합니다.
export type TabTwoStackParamList = {
  TabTwoInitial: undefined; // TabTwoScreen을 위한 초기 경로 이름
  PostDetail: { postId: number }; // PostDetailScreen을 위한 경로 및 파라미터
  MyPage: undefined; // MyPageScreen을 위한 경로 이름
};

const TabTwoStack = createStackNavigator<TabTwoStackParamList>();

export function TabTwoNavigator() {
  return (
    <TabTwoStack.Navigator>
      <TabTwoStack.Screen
        name="TabTwoInitial"
        component={TabTwoScreen}
        options={{ headerShown: false }} // TabTwoScreen 자체에서는 헤더를 숨깁니다.
      />
      <TabTwoStack.Screen
        name="PostDetail"
        component={PostDetailScreen}
        options={{ title: '', headerBackTitle: '' }} // 상세 화면의 헤더 제목 설정
      />
      <TabTwoStack.Screen
        name="MyPage"
        component={MyPageScreen}
        options={{title:''}}
      />
    </TabTwoStack.Navigator>
  );
}