import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TabThreeScreen } from '../screens/TabThreeScreen';      // 지도 탭의 메인 화면
import { PostDetailScreen } from '../components/PostDetailScreen';  // 상세 보기 화면

// TabThree 스택 내 화면들의 파라미터 타입을 정의합니다.
export type TabThreeStackParamList = {
  TabThreeInitial: undefined;              // 지도 탭의 시작 화면
  PostDetail: { postId: number };          // PostDetail 화면은 postId를 파라미터로 받습니다.
};

const TabThreeStack = createStackNavigator<TabThreeStackParamList>();

export function TabThreeNavigator() {
  return (
    <TabThreeStack.Navigator>
      {/* 이 스택의 시작 화면인 TabThreeScreen 입니다. */}
      <TabThreeStack.Screen
        name="TabThreeInitial"
        component={TabThreeScreen}
        options={{ headerShown: false }} // 탭 네비게이터의 헤더를 사용하므로 여기서 헤더를 숨깁니다.
      />
      {/* 스택에 추가될 상세 보기 화면입니다. */}
      <TabThreeStack.Screen
        name="PostDetail"
        component={PostDetailScreen}
        options={{ title: '', headerBackTitle: '' }} // 상세 화면의 헤더 타이틀을 설정합니다.
      />
    </TabThreeStack.Navigator>
  );
}