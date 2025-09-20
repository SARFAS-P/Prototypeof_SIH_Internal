import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Card, Title, RadioButton, Text, SegmentedButtons } from 'react-native-paper';
import { theme } from '../theme/theme';
import { DatabaseService } from '../services/DatabaseService';
import { NotificationService } from '../services/NotificationService';

const PatientRegistrationScreen = ({ onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    sex: 'Male',
    type: 'pregnant',
    address: '',
    language: 'en'
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.dob) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const patient = await DatabaseService.savePatient(formData);
      
      // If it's a child, create default vaccination schedule
      if (formData.type === 'child') {
        await createVaccinationSchedule(patient.patient_id, formData.dob);
      }

      Alert.alert(
        'Success', 
        'Patient registered successfully',
        [
          {
            text: 'OK',
            onPress: () => onSuccess()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to register patient');
    } finally {
      setLoading(false);
    }
  };

  const createVaccinationSchedule = async (patientId, dob) => {
    const birthDate = new Date(dob);
    const vaccinationSchedule = [
      { name: 'BCG', days: 0 },
      { name: 'OPV-0', days: 0 },
      { name: 'Hepatitis B-1', days: 0 },
      { name: 'OPV-1', days: 42 },
      { name: 'DPT-1', days: 42 },
      { name: 'Hepatitis B-2', days: 42 },
      { name: 'OPV-2', days: 70 },
      { name: 'DPT-2', days: 70 },
      { name: 'OPV-3', days: 98 },
      { name: 'DPT-3', days: 98 },
      { name: 'Hepatitis B-3', days: 98 },
      { name: 'Measles-1', days: 270 },
      { name: 'Vitamin A-1', days: 270 },
      { name: 'Measles-2', days: 450 },
      { name: 'Vitamin A-2', days: 450 },
      { name: 'DPT Booster', days: 540 },
      { name: 'OPV Booster', days: 540 }
    ];

    for (const vaccine of vaccinationSchedule) {
      const dueDate = new Date(birthDate);
      dueDate.setDate(dueDate.getDate() + vaccine.days);
      
      await DatabaseService.saveVaccination({
        patient_id: patientId,
        vaccine_name: vaccine.name,
        due_date: dueDate.toISOString().split('T')[0],
        status: 'due'
      });
    }

    // Schedule notifications for upcoming vaccinations
    await NotificationService.scheduleVaccinationReminders();
  };

  const getLanguageOptions = () => [
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'हिंदी' },
    { value: 'te', label: 'తెలుగు' },
    { value: 'ta', label: 'தமிழ்' }
  ];

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Register New Patient</Title>
          
          <TextInput
            label="Patient Name *"
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="account" />}
          />

          <TextInput
            label="Date of Birth *"
            value={formData.dob}
            onChangeText={(value) => handleInputChange('dob', value)}
            mode="outlined"
            style={styles.input}
            placeholder="YYYY-MM-DD"
            left={<TextInput.Icon icon="calendar" />}
          />

          <View style={styles.radioGroup}>
            <Text style={styles.radioLabel}>Gender *</Text>
            <View style={styles.radioOptions}>
              <View style={styles.radioOption}>
                <RadioButton
                  value="Male"
                  status={formData.sex === 'Male' ? 'checked' : 'unchecked'}
                  onPress={() => handleInputChange('sex', 'Male')}
                />
                <Text>Male</Text>
              </View>
              <View style={styles.radioOption}>
                <RadioButton
                  value="Female"
                  status={formData.sex === 'Female' ? 'checked' : 'unchecked'}
                  onPress={() => handleInputChange('sex', 'Female')}
                />
                <Text>Female</Text>
              </View>
            </View>
          </View>

          <View style={styles.radioGroup}>
            <Text style={styles.radioLabel}>Patient Type *</Text>
            <View style={styles.radioOptions}>
              <View style={styles.radioOption}>
                <RadioButton
                  value="pregnant"
                  status={formData.type === 'pregnant' ? 'checked' : 'unchecked'}
                  onPress={() => handleInputChange('type', 'pregnant')}
                />
                <Text>Pregnant Woman</Text>
              </View>
              <View style={styles.radioOption}>
                <RadioButton
                  value="child"
                  status={formData.type === 'child' ? 'checked' : 'unchecked'}
                  onPress={() => handleInputChange('type', 'child')}
                />
                <Text>Child (0-5 years)</Text>
              </View>
            </View>
          </View>

          <TextInput
            label="Address"
            value={formData.address}
            onChangeText={(value) => handleInputChange('address', value)}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={3}
            left={<TextInput.Icon icon="map-marker" />}
          />

          <View style={styles.languageSection}>
            <Text style={styles.radioLabel}>Preferred Language</Text>
            <SegmentedButtons
              value={formData.language}
              onValueChange={(value) => handleInputChange('language', value)}
              buttons={getLanguageOptions()}
              style={styles.languageButtons}
            />
          </View>

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
              Register Patient
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
  input: {
    marginBottom: 16,
  },
  radioGroup: {
    marginBottom: 20,
  },
  radioLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 8,
  },
  radioOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageSection: {
    marginBottom: 24,
  },
  languageButtons: {
    marginTop: 8,
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

export default PatientRegistrationScreen;
