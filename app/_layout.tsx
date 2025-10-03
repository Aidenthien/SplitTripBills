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

  // Create consistent theme for smooth transitions
  const customTheme = {
    ...colorScheme === 'dark' ? DarkTheme : DefaultTheme,
    colors: {
      ...(colorScheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      background: colorScheme === 'dark' ? '#000000' : '#FFFFFF',
      card: colorScheme === 'dark' ? '#1C1C1E' : '#FFFFFF',
    },
  };

  // Enhanced screen options for smooth animations
  const screenOptions = {
    headerShown: true,
    headerStyle: {
      backgroundColor: customTheme.colors.card,
      elevation: 0,
      shadowOpacity: 0,
      borderBottomWidth: 0,
    },
    headerTintColor: customTheme.colors.text,
    headerTitleStyle: {
      fontWeight: '600' as const,
      fontSize: 17,
    },
    headerBackTitleVisible: false,
    animation: 'slide_from_right' as const,
    animationDuration: Platform.OS === 'ios' ? 350 : 300,
    gestureEnabled: true,
    gestureDirection: 'horizontal' as const,
  };

  const modalOptions = {
    presentation: 'modal' as const,
    animation: 'slide_from_bottom' as const,
    animationDuration: 300,
    headerShown: false,
  };

  return (
    <NotificationProvider>
      <ThemeProvider value={customTheme}>
        <Stack
          screenOptions={{
            // Improved global animation settings
            animation: 'slide_from_right',
            animationDuration: Platform.OS === 'ios' ? 350 : 300,
            gestureEnabled: true,
            // Critical: Prevent flickering during transitions
            freezeOnBlur: true,
            // Consistent header styling
            headerStyle: {
              backgroundColor: customTheme.colors.card,
            },
            headerTintColor: customTheme.colors.text,
            headerTitleStyle: {
              fontWeight: '600',
            },
          }}
        >
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
              animation: 'fade',
              animationDuration: 250,
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
            }}
          />
          <Stack.Screen
            name="trip-dashboard"
            options={{
              ...screenOptions,
              title: 'Trip Dashboard',
              headerBackTitle: 'Back',
            }}
          />
          <Stack.Screen
            name="create-bill"
            options={{
              ...screenOptions,
              title: 'Create Split Bill',
              headerBackTitle: 'Back',
            }}
          />
          <Stack.Screen
            name="bill-summary"
            options={{
              ...screenOptions,
              title: 'Bill Summary',
              headerBackTitle: 'Back',
              animationDuration: 400,
            }}
          />
        </Stack>
        <NotificationContainer />
      </ThemeProvider>
    </NotificationProvider>
  );
}
