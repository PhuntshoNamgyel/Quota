// src/navigation/RootNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';
import { RootStackParams } from './types';
import LoginScreen from '../screens/LoginScreen';
import ModuleListScreen from '../screens/lecturer/ModuleListScreen';
import CreateModuleScreen from '../screens/lecturer/CreateModuleScreen';
import ModuleDetailScreen from '../screens/lecturer/ModuleDetailScreen';
import MarkAttendanceScreen from '../screens/lecturer/MarkAttendanceScreen';
import StudentDashboardScreen from '../screens/student/StudentDashboardScreen';

const Stack = createNativeStackNavigator<RootStackParams>();

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
            <Stack.Screen name="ModuleList" component={ModuleListScreen} options={{ title: 'My Modules' }} />
            <Stack.Screen name="CreateModule" component={CreateModuleScreen} options={{ title: 'New Module' }} />
            <Stack.Screen name="ModuleDetail" component={ModuleDetailScreen} />
            <Stack.Screen name="MarkAttendance" component={MarkAttendanceScreen} />
          </>
        ) : (
          <Stack.Screen name="StudentDashboard" component={StudentDashboardScreen} options={{ title: 'My Attendance' }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}