// src/navigation/RootNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';
import LoginScreen from '../screens/LoginScreen';
import LecturerHomeScreen from '../screens/lecturer/LecturerHomeScreen';
import StudentDashboardScreen from '../screens/student/StudentDashboardScreen';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: colors.primary },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: '700' as const },
};

export default function RootNavigator() {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={screenOptions}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        ) : user.role === 'lecturer' ? (
          <>
            <Stack.Screen name="LecturerHome" component={LecturerHomeScreen} options={{ title: 'My Modules' }} />
            {/* more lecturer screens added in Tasks 11–12 */}
          </>
        ) : (
          <>
            <Stack.Screen name="StudentDashboard" component={StudentDashboardScreen} options={{ title: 'My Attendance' }} />
            {/* more student screens added in Task 13 */}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}