import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Button, FAB, Chip, Text } from 'react-native-paper';
import { theme } from '../theme/theme';
import { SyncService } from '../services/SyncService';

const HomeScreen = ({ user, isOnline, lastSyncTime, onNavigate, onSync, onLogout }) => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalVisits: 0,
    pendingVaccinations: 0,
    unsyncedItems: 0
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const syncStats = await SyncService.getSyncStatus();
      setStats(syncStats);
    } catch (error) {
      console.log('Error loading stats:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const handleSync = async () => {
    if (!isOnline) {
      return;
    }
    await onSync();
    await loadStats();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.headerContent}>
              <View>
                <Title style={styles.greeting}>{getGreeting()}, {user.name}!</Title>
                <Paragraph style={styles.role}>{user.role.toUpperCase()}</Paragraph>
              </View>
              <View style={styles.statusContainer}>
                <Chip
                  icon={isOnline ? 'wifi' : 'wifi-off'}
                  style={[
                    styles.statusChip,
                    { backgroundColor: isOnline ? theme.colors.success : theme.colors.error }
                  ]}
                  textStyle={styles.statusText}
                >
                  {isOnline ? 'Online' : 'Offline'}
                </Chip>
                {lastSyncTime && (
                  <Text style={styles.syncTime}>Last sync: {lastSyncTime}</Text>
                )}
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Patient Registration Banner */}
        <Card style={styles.bannerCard}>
          <Card.Content>
            <View style={styles.bannerContent}>
              <View style={styles.bannerText}>
                <Title style={styles.bannerTitle}>📝 Ready to Register a Patient?</Title>
                <Paragraph style={styles.bannerSubtitle}>
                  Tap the button below to register a new pregnant woman or child
                </Paragraph>
              </View>
              <Button
                mode="contained"
                onPress={() => onNavigate('register')}
                style={styles.bannerButton}
                icon="account-plus"
                contentStyle={styles.bannerButtonContent}
              >
                Register Now
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Statistics */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Today's Overview</Title>
            <View style={styles.statsGrid}>
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

        {/* Quick Actions - Enhanced Visibility */}
        <Card style={styles.actionsCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>🚀 Quick Actions</Title>
            <Paragraph style={styles.sectionSubtitle}>Tap any button below to get started</Paragraph>
            
            {/* Primary Action - Register Patient */}
            <View style={styles.primaryActionContainer}>
              <Button
                mode="contained"
                onPress={() => onNavigate('register')}
                style={styles.primaryActionButton}
                icon="account-plus"
                contentStyle={styles.buttonContent}
                labelStyle={styles.primaryButtonLabel}
              >
                📝 Register New Patient
              </Button>
            </View>

            {/* Secondary Actions */}
            <View style={styles.secondaryActionsContainer}>
              <Button
                mode="outlined"
                onPress={() => onNavigate('patients')}
                style={styles.secondaryActionButton}
                icon="account-group"
                contentStyle={styles.buttonContent}
              >
                👥 View Patients
              </Button>
              <Button
                mode="outlined"
                onPress={() => onNavigate('sync')}
                style={styles.secondaryActionButton}
                icon="sync"
                disabled={!isOnline}
                contentStyle={styles.buttonContent}
              >
                🔄 Sync Data
              </Button>
            </View>

            <View style={styles.secondaryActionsContainer}>
              <Button
                mode="outlined"
                onPress={() => onNavigate('settings')}
                style={styles.secondaryActionButton}
                icon="cog"
                contentStyle={styles.buttonContent}
              >
                ⚙️ Settings
              </Button>
              <Button
                mode="outlined"
                onPress={() => onNavigate('visit')}
                style={styles.secondaryActionButton}
                icon="stethoscope"
                contentStyle={styles.buttonContent}
              >
                🩺 Record Visit
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Sync Status */}
        {stats.unsyncedItems > 0 && (
          <Card style={styles.syncCard}>
            <Card.Content>
              <View style={styles.syncContent}>
                <View>
                  <Title style={styles.syncTitle}>Data Pending Sync</Title>
                  <Paragraph style={styles.syncText}>
                    {stats.unsyncedItems} items waiting to sync
                  </Paragraph>
                </View>
                <Button
                  mode="contained"
                  onPress={handleSync}
                  disabled={!isOnline}
                  style={styles.syncButton}
                >
                  Sync Now
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Recent Activity */}
        <Card style={styles.activityCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Recent Activity</Title>
            <View style={styles.activityItem}>
              <Text style={styles.activityIcon}>📝</Text>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Patient Registration</Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <Text style={styles.activityIcon}>💉</Text>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Vaccination Recorded</Text>
                <Text style={styles.activityTime}>4 hours ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <Text style={styles.activityIcon}>🔄</Text>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Data Synced</Text>
                <Text style={styles.activityTime}>Yesterday</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Floating Action Button - Enhanced */}
      <FAB
        style={styles.fab}
        icon="account-plus"
        onPress={() => onNavigate('register')}
        label="Register Patient"
        color="white"
        backgroundColor={theme.colors.primary}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  headerCard: {
    margin: 16,
    elevation: 4,
  },
  bannerCard: {
    margin: 16,
    marginTop: 0,
    elevation: 6,
    backgroundColor: theme.colors.primary + '10',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: 12,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerText: {
    flex: 1,
    marginRight: 16,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  bannerButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    elevation: 2,
  },
  bannerButtonContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  role: {
    fontSize: 14,
    color: theme.colors.placeholder,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusChip: {
    marginBottom: 4,
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
  },
  syncTime: {
    fontSize: 12,
    color: theme.colors.placeholder,
  },
  statsCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: theme.colors.primary,
  },
  statsGrid: {
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
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.placeholder,
    textAlign: 'center',
  },
  actionsCard: {
    margin: 16,
    marginTop: 0,
    elevation: 4,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: theme.colors.primary + '20',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: theme.colors.placeholder,
    marginBottom: 20,
    textAlign: 'center',
  },
  primaryActionContainer: {
    marginBottom: 20,
  },
  primaryActionButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    elevation: 4,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  primaryButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  secondaryActionButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  buttonContent: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  syncCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
    backgroundColor: theme.colors.warning + '20',
  },
  syncContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  syncTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.warning,
  },
  syncText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  syncButton: {
    marginLeft: 16,
  },
  activityCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  activityTime: {
    fontSize: 12,
    color: theme.colors.placeholder,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
    elevation: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
});

export default HomeScreen;
