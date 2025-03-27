import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import ImagePickerComponent from './components/ImagePickerComponent';
import ProfileScreen from './screens/ProfileScreen';
import { ThemeProvider, useTheme } from './assets/context/ThemeContext';

const Tab = createBottomTabNavigator();

function AppNavigator() {
  const { isDark } = useTheme();

  return (
    <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            const iconName = route.name === 'Home' ? 'home' : 'person';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarLabel: route.name === 'Home' ? 'Home' : 'Profile',
          tabBarActiveTintColor: '#a259ff',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            backgroundColor: isDark ? '#000' : '#fff',
            borderTopColor: isDark ? '#222' : '#ccc',
          },
          tabBarLabelStyle: { fontSize: 12 },
          headerStyle: {
            backgroundColor: isDark ? '#000' : '#a259ff',
          },
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontWeight: 'bold',
            color: '#fff',
            fontSize: 18,
          },
          headerTintColor: '#fff',
        })}
      >
        <Tab.Screen
          name="Home"
          component={ImagePickerComponent}
          options={{ title: 'PriceScout', tabBarLabel: 'Home' }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: 'Your Profile', tabBarLabel: 'Profile' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}
