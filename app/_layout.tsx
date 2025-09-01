import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { Platform, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WorkoutProvider } from "@/hooks/workout-store";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Назад" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <WorkoutProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar style="light" backgroundColor="#0A0A0A" />
          {Platform.OS === "android" ? (
            <SafeAreaView style={{ flex: 1 }} edges={["top"]} testID="android-safe-top">
              <RootLayoutNav />
            </SafeAreaView>
          ) : (
            <View style={{ flex: 1 }}>
              <RootLayoutNav />
            </View>
          )}
        </GestureHandlerRootView>
      </WorkoutProvider>
    </QueryClientProvider>
  );
}