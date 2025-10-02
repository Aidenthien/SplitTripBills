import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { Platform } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';
import { NotificationProvider } from '@/components/providers/NotificationProvider';
import NotificationContainer from '@/ui/components/NotificationContainer/NotificationContainer';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  // Modern navigation animations
  const screenOptions = {
    headerShown: true,
    headerStyle: {
      backgroundColor: colorScheme === 'dark' ? '#000000' : '#FFFFFF',
    },
    headerTintColor: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
    headerTitleStyle: {
      fontWeight: '600' as const,
    },
    // Smooth slide transition for iOS-like feel
    animation: 'slide_from_right' as const,
    animationDuration: 300,
    // Add subtle spring animation
    gestureEnabled: true,
    gestureDirection: 'horizontal' as const,
  };

  const modalOptions = {
    presentation: 'modal' as const,
    animation: 'slide_from_bottom' as const,
    animationDuration: 250,
    headerShown: false,
  };

  return (
    <NotificationProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            // Global animation settings for smooth transitions
            animation: Platform.OS === 'ios' ? 'slide_from_right' : 'fade_from_bottom',
            animationDuration: 300,
            gestureEnabled: true,
            // Remove flickering by ensuring smooth transitions
            freezeOnBlur: true,
          }}
        >
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
              animation: 'fade',
              animationDuration: 200,
            }}
          />
          <Stack.Screen
            name="modal"
            options={modalOptions}
          />
          <Stack.Screen
            name="trip-setup"
            options={{
              ...screenOptions,
              title: 'Trip Setup',
              headerBackTitle: 'Back',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="trip-dashboard"
            options={{
              ...screenOptions,
              title: 'Trip Dashboard',
              headerBackTitle: 'Back',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="create-bill"
            options={{
              ...screenOptions,
              title: 'Create Split Bill',
              headerBackTitle: 'Back',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="bill-summary"
            options={{
              ...screenOptions,
              title: 'Bill Summary',
              headerBackTitle: 'Back',
              animation: 'slide_from_right',
              // Special animation for final summary screen
              animationDuration: 350,
            }}
          />
        </Stack>
        <NotificationContainer />
      </ThemeProvider>
    </NotificationProvider>
  );
}
