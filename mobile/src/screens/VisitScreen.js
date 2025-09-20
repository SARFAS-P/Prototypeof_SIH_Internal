import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Card, Title, SegmentedButtons, Text } from 'react-native-paper';
import { theme } from '../theme/theme';
import { DatabaseService } from '../services/DatabaseService';
import { NotificationService } from '../services/NotificationService';

const VisitScreen = ({ onBack, onSuccess, route }) => {
  const { patient } = route?.params || {};
  const [formData, setFormData] = useState({
    vitals: {
      bloodPressure: '',
      weight: '',
      height: '',
      temperature: '',
      heartRate: ''
    },
    notes: '',
    nextVisitDate: '',
    vaccinations: []
  });
  const [loading, setLoading] = useState(false);
  const [availableVaccines, setAvailableVaccines] = useState([]);

  useEffect(() => {
    if (patient) {
      loadAvailableVaccines();
    }
  }, [patient]);

  const loadAvailableVaccines = async () => {
    try {
      const vaccines = await DatabaseService.getVaccinations(patient.patient_id);
      setAvailableVaccines(vaccines.filter(v => v.status === 'due'));
    } catch (error) {
      console.log('Error loading vaccines:', error);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.startsWith('vitals.')) {
      const vitalField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        vitals: {
          ...prev.vitals,
          [vitalField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleVaccineToggle = (vaccineId, administered) => {
    setFormData(prev => ({
      ...prev,
      vaccinations: administered
        ? [...prev.vaccinations, vaccineId]
        : prev.vaccinations.filter(id => id !== vaccineId)
    }));
  };

  const handleSubmit = async () => {
    if (!patient) {
      Alert.alert('Error', 'No patient selected');
      return;
    }

    setLoading(true);
    try {
      // Save visit record
      const visit = await DatabaseService.saveVisit({
        patient_id: patient.patient_id,
        vitals: formData.vitals,
        notes: formData.notes,
        next_visit_date: formData.nextVisitDate
      });

      // Update administered vaccinations
      for (const vaccineId of formData.vaccinations) {
        await DatabaseService.saveVaccination({
          vaccine_id: vaccineId,
          patient_id: patient.patient_id,
          administered_date: new Date().toISOString().split('T')[0],
          status: 'administered'
        });
      }

      // Schedule next visit reminder if date provided
      if (formData.nextVisitDate) {
        await NotificationService.scheduleVisitReminder(
          patient.name,
          formData.nextVisitDate
        );
      }

      Alert.alert(
        'Success',
        'Visit recorded successfully',
        [
          {
            text: 'OK',
            onPress: () => onSuccess()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to record visit');
    } finally {
      setLoading(false);
    }
  };

  const getVitalInputs = () => [
    { field: 'bloodPressure', label: 'Blood Pressure', icon: 'heart-pulse', placeholder: '120/80' },
    { field: 'weight', label: 'Weight (kg)', icon: 'scale', placeholder: '65' },
    { field: 'height', label: 'Height (cm)', icon: 'human', placeholder: '165' },
    { field: 'temperature', label: 'Temperature (°C)', icon: 'thermometer', placeholder: '37' },
    { field: 'heartRate', label: 'Heart Rate (bpm)', icon: 'heart', placeholder: '72' }
  ];

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>
            {patient ? `Visit Record - ${patient.name}` : 'Record Visit'}
          </Title>

          {/* Vitals Section */}
          <Card style={styles.sectionCard}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Vital Signs</Title>
              {getVitalInputs().map((vital) => (
                <TextInput
                  key={vital.field}
                  label={vital.label}
                  value={formData.vitals[vital.field]}
                  onChangeText={(value) => handleInputChange(`vitals.${vital.field}`, value)}
                  mode="outlined"
                  style={styles.input}
                  placeholder={vital.placeholder}
                  keyboardType="numeric"
                  left={<TextInput.Icon icon={vital.icon} />}
                />
              ))}
            </Card.Content>
          </Card>

          {/* Vaccinations Section */}
          {availableVaccines.length > 0 && (
            <Card style={styles.sectionCard}>
              <Card.Content>
                <Title style={styles.sectionTitle}>Vaccinations Administered</Title>
                {availableVaccines.map((vaccine) => (
                  <View key={vaccine.vaccine_id} style={styles.vaccineItem}>
                    <View style={styles.vaccineInfo}>
                      <Text style={styles.vaccineName}>{vaccine.vaccine_name}</Text>
                      <Text style={styles.vaccineDate}>
                        Due: {new Date(vaccine.due_date).toLocaleDateString()}
                      </Text>
                    </View>
                    <SegmentedButtons
                      value={formData.vaccinations.includes(vaccine.vaccine_id) ? 'yes' : 'no'}
                      onValueChange={(value) => handleVaccineToggle(vaccine.vaccine_id, value === 'yes')}
                      buttons={[
                        { value: 'no', label: 'No' },
                        { value: 'yes', label: 'Yes' }
                      ]}
                      style={styles.vaccineToggle}
                    />
                  </View>
                ))}
              </Card.Content>
            </Card>
          )}

          {/* Notes Section */}
          <Card style={styles.sectionCard}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Visit Notes</Title>
              <TextInput
                label="Notes"
                value={formData.notes}
                onChangeText={(value) => handleInputChange('notes', value)}
                mode="outlined"
                style={styles.input}
                multiline
                numberOfLines={4}
                placeholder="Enter visit observations, recommendations, etc."
                left={<TextInput.Icon icon="note-text" />}
              />
            </Card.Content>
          </Card>

          {/* Next Visit Section */}
          <Card style={styles.sectionCard}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Next Visit</Title>
              <TextInput
                label="Next Visit Date"
                value={formData.nextVisitDate}
                onChangeText={(value) => handleInputChange('nextVisitDate', value)}
                mode="outlined"
                style={styles.input}
                placeholder="YYYY-MM-DD"
                left={<TextInput.Icon icon="calendar" />}
              />
            </Card.Content>
          </Card>

          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={onBack}
              style={styles.button}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              style={styles.button}
            >
              Save Visit
            </Button>
          </View>
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
  input: {
    marginBottom: 16,
  },
  vaccineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.placeholder + '30',
  },
  vaccineInfo: {
    flex: 1,
  },
  vaccineName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  vaccineDate: {
    fontSize: 12,
    color: theme.colors.placeholder,
  },
  vaccineToggle: {
    marginLeft: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default VisitScreen;
