import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, PlayfairDisplay_700Bold, PlayfairDisplay_600SemiBold } from '@expo-google-fonts/playfair-display';
import { Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold } from '@expo-google-fonts/nunito';
import * as SplashScreen from 'expo-splash-screen';
import { AppProvider, useApp } from '../context/AppContext';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { state } = useApp();

  useEffect(() => {
    if (!state.onboardingComplete) {
      router.replace('/onboarding');
    }
  }, [state.onboardingComplete]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="log/potty"
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="log/walk"
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="log/meal"
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="diary/new"
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="diary/[id]"
        options={{ presentation: 'card' }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    PlayfairDisplay_600SemiBold,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <AppProvider>
      <StatusBar style="dark" />
      <RootNavigator />
    </AppProvider>
  );
}