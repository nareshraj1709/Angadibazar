import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';

import SplashScreen from './src/screens/SplashScreen';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import ListingDetailScreen from './src/screens/ListingDetailScreen';
import SellScreen from './src/screens/SellScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';
import DeleteAccountScreen from './src/screens/DeleteAccountScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const COLORS = {
  saffron: '#e07b39',
  deep: '#b5470f',
  cream: '#fdf6ec',
  earth: '#2d1f0f',
  muted: '#9b7a5a',
};

function TabIcon({ emoji, focused, size }) {
  return (
    <Text style={{ fontSize: size || 22, opacity: focused ? 1 : 0.5 }}>
      {emoji}
    </Text>
  );
}

function SellTabButton({ emoji, focused }) {
  return (
    <View style={styles.sellTab}>
      <Text style={{ fontSize: 26 }}>{emoji}</Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          height: 65,
          paddingBottom: 10,
          paddingTop: 6,
        },
        tabBarActiveTintColor: COLORS.deep,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Sell"
        component={SellScreen}
        options={{
          tabBarLabel: 'Sell',
          tabBarIcon: ({ focused }) => (
            <SellTabButton emoji="➕" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👤" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen
          name="ListingDetail"
          component={ListingDetailScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="PrivacyPolicy"
          component={PrivacyPolicyScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="DeleteAccount"
          component={DeleteAccountScreen}
          options={{ animation: 'slide_from_right' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  sellTab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.saffron,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -18,
    shadowColor: COLORS.saffron,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
