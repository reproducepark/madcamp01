// navigation/TabOneStack.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TabOneScreen } from '../screens/TabOneScreen'; // Make sure this path is correct
import { PostDetailScreen } from '../components/PostDetailScreen'; // Make sure this path is correct

// This defines the types for the screens within the '리스트' tab's stack.
export type TabOneStackParamList = {
  TabOneInitial: undefined; // This is the starting screen for the '리스트' stack
  PostDetail: { postId: string }; // The PostDetail screen, which expects a postId
};

const TabOneStack = createStackNavigator<TabOneStackParamList>();

export function TabOneNavigator() {
  return (
    <TabOneStack.Navigator>
      {/* The initial screen of this stack, which is your TabOneScreen */}
      <TabOneStack.Screen
        name="TabOneInitial"
        component={TabOneScreen}
        options={{ headerShown: false }} // We hide the header here because the BottomTabNavigator typically has its own title, or we want the Stack Navigator's header to control it.
      />
      {/* The detail screen that can be pushed onto this stack */}
      <TabOneStack.Screen
        name="PostDetail"
        component={PostDetailScreen}
        options={{ title: '', headerBackTitle: '' }} // Sets the header title for the detail screen
      />
    </TabOneStack.Navigator>
  );
}