import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, Searchbar, Chip, FAB } from 'react-native-paper';
import { theme } from '../theme/theme';
import { DatabaseService } from '../services/DatabaseService';

const PatientListScreen = ({ onBack, onNavigate }) => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [searchQuery, patients]);

  const loadPatients = async () => {
    try {
      const patientList = await DatabaseService.getPatients();
      setPatients(patientList);
    } catch (error) {
      Alert.alert('Error', 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const filterPatients = () => {
    if (!searchQuery) {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  };

  const getPatientTypeColor = (type) => {
    return type === 'pregnant' ? theme.colors.primary : theme.colors.accent;
  };

  const getPatientTypeIcon = (type) => {
    return type === 'pregnant' ? '👶' : '🧒';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const renderPatient = ({ item: patient }) => (
    <Card style={styles.patientCard}>
      <Card.Content>
        <View style={styles.patientHeader}>
          <View style={styles.patientInfo}>
            <Title style={styles.patientName}>
              {getPatientTypeIcon(patient.type)} {patient.name}
            </Title>
            <Paragraph style={styles.patientDetails}>
              {patient.sex}, {calculateAge(patient.dob)} years old
            </Paragraph>
            <Paragraph style={styles.patientAddress}>
              📍 {patient.address}
            </Paragraph>
          </View>
          <Chip
            style={[
              styles.typeChip,
              { backgroundColor: getPatientTypeColor(patient.type) }
            ]}
            textStyle={styles.typeChipText}
          >
            {patient.type === 'pregnant' ? 'Pregnant' : 'Child'}
          </Chip>
        </View>
        
        <View style={styles.patientActions}>
          <Button
            mode="outlined"
            onPress={() => onNavigate('visit', { patient })}
            style={styles.actionButton}
            icon="plus"
            compact
          >
            Add Visit
          </Button>
          <Button
            mode="outlined"
            onPress={() => onNavigate('patient-details', { patient })}
            style={styles.actionButton}
            icon="eye"
            compact
          >
            View Details
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Title style={styles.emptyTitle}>No Patients Found</Title>
      <Paragraph style={styles.emptyText}>
        {searchQuery ? 'No patients match your search criteria' : 'Register your first patient to get started'}
      </Paragraph>
      {!searchQuery && (
        <Button
          mode="contained"
          onPress={() => onNavigate('register')}
          style={styles.emptyButton}
          icon="plus"
        >
          Register Patient
        </Button>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button
          mode="outlined"
          onPress={onBack}
          icon="arrow-left"
          style={styles.backButton}
        >
          Back
        </Button>
        <Title style={styles.headerTitle}>Patients ({filteredPatients.length})</Title>
      </View>

      <Searchbar
        placeholder="Search patients..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <FlatList
        data={filteredPatients}
        renderItem={renderPatient}
        keyExtractor={(item) => item.patient_id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        refreshing={loading}
        onRefresh={loadPatients}
      />

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => onNavigate('register')}
        label="New Patient"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.surface,
    elevation: 2,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  searchbar: {
    margin: 16,
    elevation: 2,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  patientCard: {
    marginBottom: 16,
    elevation: 2,
  },
  patientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  patientDetails: {
    fontSize: 14,
    color: theme.colors.placeholder,
    marginBottom: 4,
  },
  patientAddress: {
    fontSize: 14,
    color: theme.colors.text,
  },
  typeChip: {
    marginLeft: 8,
  },
  typeChipText: {
    color: 'white',
    fontWeight: 'bold',
  },
  patientActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.placeholder,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.placeholder,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
});

export default PatientListScreen;
