import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect } from 'react';
import { AuthProvider } from '../components/AuthProvider';

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [fontsLoaded] = useFonts({
    BeVietnamProRegular: require('../assets/fonts/BeVietnamPro-Regular.ttf'),
    BeVietnamProBold: require('../assets/fonts/BeVietnamPro-Bold.ttf'),
    BeVietnamProItalic: require('../assets/fonts/BeVietnamPro-Italic.ttf'),
    QilkaBold: require('../assets/fonts/Qilka-Bold.otf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (fontsLoaded) {
      onLayoutRootView();
    }
  }, [fontsLoaded, onLayoutRootView]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FCF7DF"
      />

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: '#FCF7DF',
          },
        }}
      />
    </AuthProvider>
  );
}