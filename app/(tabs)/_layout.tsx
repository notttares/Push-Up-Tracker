import { Tabs } from "expo-router";
import React from "react";
import { Home, TrendingUp, User, Lightbulb } from "lucide-react-native";
import Colors from "@/constants/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.dark.tabIconSelected,
        tabBarInactiveTintColor: Colors.dark.tabIconDefault,
        tabBarStyle: {
          backgroundColor: Colors.dark.surface,
          borderTopColor: Colors.dark.border,
          borderTopWidth: 1,
        },
        headerStyle: {
          backgroundColor: Colors.dark.background,
          borderBottomColor: Colors.dark.border,
          borderBottomWidth: 1,
        },
        headerTitleStyle: {
          color: Colors.dark.text,
          fontWeight: 'bold',
        },
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Главная",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Прогресс",
          tabBarIcon: ({ color }) => <TrendingUp size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="ai-tips"
        options={{
          title: "ИИ-Советы",
          tabBarIcon: ({ color }) => <Lightbulb size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Профиль",
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}