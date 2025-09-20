import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, ProgressBar, List, Chip, Text } from 'react-native-paper';
import { theme } from '../theme/theme';
import { SyncService } from '../services/SyncService';

const SyncScreen = ({ onBack, onSync, isOnline, lastSyncTime }) => {
  const [syncStatus, setSyncStatus] = useState({
    unsyncedItems: 0,
    totalPatients: 0,
    totalVisits: 0,
    pendingVaccinations: 0
  });
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  useEffect(() => {
    loadSyncStatus();
  }, []);

  const loadSyncStatus = async () => {
    try {
      const status = await SyncService.getSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      console.log('Error loading sync status:', error);
    }
  };

  const handleSync = async () => {
    if (!isOnline) {
      Alert.alert('Offline', 'Cannot sync while offline. Please check your internet connection.');
      return;
    }

    setSyncing(true);
    setSyncProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setSyncProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await SyncService.syncData();
      
      clearInterval(progressInterval);
      setSyncProgress(100);

      if (result.success) {
        Alert.alert(
          'Sync Successful',
          `Successfully synced ${result.itemsSynced} items`,
          [
            {
              text: 'OK',
              onPress: () => {
                onSync();
                loadSyncStatus();
              }
            }
          ]
        );
      } else {
        Alert.alert('Sync Failed', result.error);
      }
    } catch (error) {
      Alert.alert('Sync Error', 'Failed to sync data');
    } finally {
      setSyncing(false);
      setSyncProgress(0);
    }
  };

  const handleForceSync = async () => {
    Alert.alert(
      'Force Sync',
      'This will sync all data regardless of sync status. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: async () => {
            setSyncing(true);
            try {
              const result = await SyncService.forceSyncAll();
              if (result.success) {
                Alert.alert('Force Sync Complete', `Synced ${result.itemsSynced} items`);
                loadSyncStatus();
              } else {
                Alert.alert('Force Sync Failed', result.error);
              }
            } catch (error) {
              Alert.alert('Error', 'Force sync failed');
            } finally {
              setSyncing(false);
            }
          }
        }
      ]
    );
  };

  const getSyncStatusColor = () => {
    if (syncStatus.unsyncedItems === 0) return theme.colors.success;
    if (syncStatus.unsyncedItems < 5) return theme.colors.warning;
    return theme.colors.error;
  };

  const getSyncStatusText = () => {
    if (syncStatus.unsyncedItems === 0) return 'All data synced';
    if (syncStatus.unsyncedItems < 5) return 'Few items pending';
    return 'Many items pending';
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Data Synchronization</Title>
          
          {/* Connection Status */}
          <Card style={styles.statusCard}>
            <Card.Content>
              <View style={styles.statusHeader}>
                <Title style={styles.statusTitle}>Connection Status</Title>
                <Chip
                  icon={isOnline ? 'wifi' : 'wifi-off'}
                  style={[
                    styles.statusChip,
                    { backgroundColor: isOnline ? theme.colors.success : theme.colors.error }
                  ]}
                  textStyle={styles.statusChipText}
                >
                  {isOnline ? 'Online' : 'Offline'}
                </Chip>
              </View>
              {lastSyncTime && (
                <Paragraph style={styles.lastSync}>
                  Last sync: {lastSyncTime}
                </Paragraph>
              )}
            </Card.Content>
          </Card>

          {/* Sync Status */}
          <Card style={styles.statusCard}>
            <Card.Content>
              <View style={styles.statusHeader}>
                <Title style={styles.statusTitle}>Sync Status</Title>
                <Chip
                  style={[
                    styles.statusChip,
                    { backgroundColor: getSyncStatusColor() }
                  ]}
                  textStyle={styles.statusChipText}
                >
                  {getSyncStatusText()}
                </Chip>
              </View>
              <Paragraph style={styles.syncDetails}>
                {syncStatus.unsyncedItems} items waiting to sync
              </Paragraph>
            </Card.Content>
          </Card>

          {/* Data Overview */}
          <Card style={styles.overviewCard}>
            <Card.Content>
              <Title style={styles.overviewTitle}>Data Overview</Title>
              <View style={styles.overviewGrid}>
                <View style={styles.overviewItem}>
                  <Text style={styles.overviewNumber}>{syncStatus.totalPatients}</Text>
                  <Text style={styles.overviewLabel}>Total Patients</Text>
                </View>
                <View style={styles.overviewItem}>
                  <Text style={styles.overviewNumber}>{syncStatus.totalVisits}</Text>
                  <Text style={styles.overviewLabel}>Visits Recorded</Text>
                </View>
                <View style={styles.overviewItem}>
                  <Text style={styles.overviewNumber}>{syncStatus.pendingVaccinations}</Text>
                  <Text style={styles.overviewLabel}>Due Vaccinations</Text>
                </View>
                <View style={styles.overviewItem}>
                  <Text style={styles.overviewNumber}>{syncStatus.unsyncedItems}</Text>
                  <Text style={styles.overviewLabel}>Unsynced Items</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Sync Progress */}
          {syncing && (
            <Card style={styles.progressCard}>
              <Card.Content>
                <Title style={styles.progressTitle}>Syncing Data...</Title>
                <ProgressBar
                  progress={syncProgress / 100}
                  color={theme.colors.primary}
                  style={styles.progressBar}
                />
                <Paragraph style={styles.progressText}>
                  {syncProgress}% complete
                </Paragraph>
              </Card.Content>
            </Card>
          )}

          {/* Sync Actions */}
          <View style={styles.actionContainer}>
            <Button
              mode="contained"
              onPress={handleSync}
              disabled={!isOnline || syncing}
              loading={syncing}
              style={styles.syncButton}
              icon="sync"
            >
              {syncing ? 'Syncing...' : 'Sync Now'}
            </Button>
            
            <Button
              mode="outlined"
              onPress={handleForceSync}
              disabled={!isOnline || syncing}
              style={styles.forceSyncButton}
              icon="refresh"
            >
              Force Sync All
            </Button>
          </View>

          {/* Sync Information */}
          <Card style={styles.infoCard}>
            <Card.Content>
              <Title style={styles.infoTitle}>Sync Information</Title>
              <List.Item
                title="Automatic Sync"
                description="Data syncs automatically when online"
                left={props => <List.Icon {...props} icon="auto-fix" />}
              />
              <List.Item
                title="Offline Storage"
                description="All data is stored locally when offline"
                left={props => <List.Icon {...props} icon="database" />}
              />
              <List.Item
                title="Data Security"
                description="All data is encrypted before sync"
                left={props => <List.Icon {...props} icon="shield-check" />}
              />
            </Card.Content>
          </Card>
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
  statusCard: {
    marginBottom: 16,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  statusChip: {
    marginLeft: 8,
  },
  statusChipText: {
    color: 'white',
    fontWeight: 'bold',
  },
  lastSync: {
    fontSize: 14,
    color: theme.colors.placeholder,
  },
  syncDetails: {
    fontSize: 14,
    color: theme.colors.text,
  },
  overviewCard: {
    marginBottom: 16,
    elevation: 2,
  },
  overviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 16,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  overviewItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  overviewNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  overviewLabel: {
    fontSize: 12,
    color: theme.colors.placeholder,
    textAlign: 'center',
  },
  progressCard: {
    marginBottom: 16,
    elevation: 2,
    backgroundColor: theme.colors.primary + '10',
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: theme.colors.text,
    textAlign: 'center',
  },
  actionContainer: {
    marginBottom: 16,
  },
  syncButton: {
    marginBottom: 12,
    paddingVertical: 8,
  },
  forceSyncButton: {
    paddingVertical: 8,
  },
  infoCard: {
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 16,
  },
});

export default SyncScreen;
