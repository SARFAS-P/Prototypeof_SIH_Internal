import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, Switch, List, Divider, Text } from 'react-native-paper';
import { theme } from '../theme/theme';
import { DatabaseService } from '../services/DatabaseService';

const SettingsScreen = ({ onBack, onLogout }) => {
  const [settings, setSettings] = useState({
    notifications: true,
    autoSync: true,
    encryption: true,
    language: 'en',
    theme: 'light'
  });
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalVisits: 0,
    pendingVaccinations: 0,
    unsyncedItems: 0
  });

  useEffect(() => {
    loadSettings();
    loadStats();
  }, []);

  const loadSettings = async () => {
    // In a real app, load from AsyncStorage
    // For demo, use default settings
  };

  const loadStats = async () => {
    try {
      const statsData = await DatabaseService.getStats();
      setStats(statsData);
    } catch (error) {
      console.log('Error loading stats:', error);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all local data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: () => {
            // In a real app, clear the database
            Alert.alert('Data Cleared', 'All local data has been cleared');
          }
        }
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Export all data to CSV format?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: () => {
            // In a real app, export data
            Alert.alert('Export Complete', 'Data exported successfully');
          }
        }
      ]
    );
  };

  const handleLogoutConfirm = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: onLogout
        }
      ]
    );
  };

  const getLanguageName = (code) => {
    const languages = {
      'en': 'English',
      'hi': 'हिंदी',
      'te': 'తెలుగు',
      'ta': 'தமிழ்'
    };
    return languages[code] || 'English';
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Settings</Title>

          {/* App Settings */}
          <Card style={styles.sectionCard}>
            <Card.Content>
              <Title style={styles.sectionTitle}>App Settings</Title>
              
              <List.Item
                title="Push Notifications"
                description="Receive reminders for vaccinations and visits"
                right={() => (
                  <Switch
                    value={settings.notifications}
                    onValueChange={(value) => handleSettingChange('notifications', value)}
                  />
                )}
                left={props => <List.Icon {...props} icon="bell" />}
              />
              
              <List.Item
                title="Auto Sync"
                description="Automatically sync data when online"
                right={() => (
                  <Switch
                    value={settings.autoSync}
                    onValueChange={(value) => handleSettingChange('autoSync', value)}
                  />
                )}
                left={props => <List.Icon {...props} icon="sync" />}
              />
              
              <List.Item
                title="Data Encryption"
                description="Encrypt sensitive data locally"
                right={() => (
                  <Switch
                    value={settings.encryption}
                    onValueChange={(value) => handleSettingChange('encryption', value)}
                  />
                )}
                left={props => <List.Icon {...props} icon="shield-check" />}
              />
            </Card.Content>
          </Card>

          {/* Language Settings */}
          <Card style={styles.sectionCard}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Language</Title>
              <List.Item
                title="Current Language"
                description={getLanguageName(settings.language)}
                left={props => <List.Icon {...props} icon="translate" />}
                right={() => (
                  <Button
                    mode="outlined"
                    onPress={() => {
                      const languages = ['en', 'hi', 'te', 'ta'];
                      const currentIndex = languages.indexOf(settings.language);
                      const nextIndex = (currentIndex + 1) % languages.length;
                      handleSettingChange('language', languages[nextIndex]);
                    }}
                    compact
                  >
                    Change
                  </Button>
                )}
              />
            </Card.Content>
          </Card>

          {/* Data Management */}
          <Card style={styles.sectionCard}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Data Management</Title>
              
              <List.Item
                title="Export Data"
                description="Export all data to CSV format"
                onPress={handleExportData}
                left={props => <List.Icon {...props} icon="download" />}
                right={props => <List.Icon {...props} icon="chevron-right" />}
              />
              
              <List.Item
                title="Clear All Data"
                description="Permanently delete all local data"
                onPress={handleClearData}
                left={props => <List.Icon {...props} icon="delete" />}
                right={props => <List.Icon {...props} icon="chevron-right" />}
              />
            </Card.Content>
          </Card>

          {/* App Statistics */}
          <Card style={styles.sectionCard}>
            <Card.Content>
              <Title style={styles.sectionTitle}>App Statistics</Title>
              
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{stats.totalPatients}</Text>
                  <Text style={styles.statLabel}>Total Patients</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{stats.totalVisits}</Text>
                  <Text style={styles.statLabel}>Visits Recorded</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{stats.pendingVaccinations}</Text>
                  <Text style={styles.statLabel}>Due Vaccinations</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{stats.unsyncedItems}</Text>
                  <Text style={styles.statLabel}>Unsynced Items</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* App Information */}
          <Card style={styles.sectionCard}>
            <Card.Content>
              <Title style={styles.sectionTitle}>App Information</Title>
              
              <List.Item
                title="Version"
                description="1.0.0"
                left={props => <List.Icon {...props} icon="information" />}
              />
              
              <List.Item
                title="Build"
                description="SIH25219-001"
                left={props => <List.Icon {...props} icon="code-tags" />}
              />
              
              <List.Item
                title="Last Updated"
                description="December 2024"
                left={props => <List.Icon {...props} icon="calendar" />}
              />
            </Card.Content>
          </Card>

          {/* Logout */}
          <Button
            mode="contained"
            onPress={handleLogoutConfirm}
            style={styles.logoutButton}
            buttonColor={theme.colors.error}
            icon="logout"
          >
            Logout
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  card: {
    margin: 16,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 24,
    textAlign: 'center',
  },
  sectionCard: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.placeholder,
    textAlign: 'center',
  },
  logoutButton: {
    marginTop: 24,
    paddingVertical: 8,
  },
});

export default SettingsScreen;
