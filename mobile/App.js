import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Alert, Text } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import * as SQLite from 'expo-sqlite';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';
import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';

// Components
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import PatientRegistrationScreen from './src/screens/PatientRegistrationScreen';
import PatientListScreen from './src/screens/PatientListScreen';
import VisitScreen from './src/screens/VisitScreen';
import SyncScreen from './src/screens/SyncScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Services
import { DatabaseService } from './src/services/DatabaseService';
import { SyncService } from './src/services/SyncService';
import { NotificationService } from './src/services/NotificationService';

// Theme
import { theme } from './src/theme/theme';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [user, setUser] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  useEffect(() => {
    // Initialize database
    DatabaseService.init();
    
    // Check if user is already logged in
    checkAuthStatus();
    
    // Set up network status monitoring
    setupNetworkMonitoring();
    
    // Initialize notifications
    NotificationService.init();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      const userData = await SecureStore.getItemAsync('user_data');
      
      if (token && userData) {
        setUser(JSON.parse(userData));
        setCurrentScreen('home');
      }
    } catch (error) {
      console.log('Auth check failed:', error);
    }
  };

  const setupNetworkMonitoring = () => {
    // Simple network monitoring - in real app, use NetInfo
    const checkConnection = () => {
      // Simulate network status for demo
      const online = Math.random() > 0.3; // 70% chance of being online
      setIsOnline(online);
    };
    
    checkConnection();
    setInterval(checkConnection, 10000); // Check every 10 seconds
  };

  const handleLogin = async (phone, pin) => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, pin }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data);
        await SecureStore.setItemAsync('auth_token', data.token);
        await SecureStore.setItemAsync('user_data', JSON.stringify(data));
        setCurrentScreen('home');
      } else {
        Alert.alert('Login Failed', data.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Working in offline mode.');
      // For demo, create a local user
      const localUser = {
        user_id: 'local-asha-001',
        role: 'asha',
        name: 'ASHA Worker',
        token: 'local-token'
      };
      setUser(localUser);
      setCurrentScreen('home');
    }
  };

  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('user_data');
      setUser(null);
      setCurrentScreen('login');
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  const handleSync = async () => {
    try {
      const result = await SyncService.syncData(user.token);
      if (result.success) {
        setLastSyncTime(new Date().toLocaleTimeString());
        Alert.alert('Sync Successful', `Synced ${result.itemsSynced} items`);
      } else {
        Alert.alert('Sync Failed', result.error);
      }
    } catch (error) {
      Alert.alert('Sync Error', 'Failed to sync data');
    }
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <LoginScreen onLogin={handleLogin} />;
      case 'home':
        return (
          <HomeScreen
            user={user}
            isOnline={isOnline}
            lastSyncTime={lastSyncTime}
            onNavigate={setCurrentScreen}
            onSync={handleSync}
            onLogout={handleLogout}
          />
        );
      case 'register':
        return (
          <PatientRegistrationScreen
            onBack={() => setCurrentScreen('home')}
            onSuccess={() => setCurrentScreen('home')}
          />
        );
      case 'patients':
        return (
          <PatientListScreen
            onBack={() => setCurrentScreen('home')}
            onNavigate={setCurrentScreen}
          />
        );
      case 'visit':
        return (
          <VisitScreen
            onBack={() => setCurrentScreen('patients')}
            onSuccess={() => setCurrentScreen('patients')}
          />
        );
      case 'sync':
        return (
          <SyncScreen
            onBack={() => setCurrentScreen('home')}
            onSync={handleSync}
            isOnline={isOnline}
            lastSyncTime={lastSyncTime}
          />
        );
      case 'settings':
        return (
          <SettingsScreen
            onBack={() => setCurrentScreen('home')}
            onLogout={handleLogout}
          />
        );
      default:
        return <LoginScreen onLogin={handleLogin} />;
    }
  };

  return (
    <PaperProvider theme={theme}>
      <View style={styles.container}>
        <StatusBar style="auto" />
        {renderCurrentScreen()}
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
