import * as SQLite from 'expo-sqlite';
import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';

const db = SQLite.openDatabase('ehr.db');

class DatabaseService {
  static init() {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        // Create patients table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS patients (
            patient_id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            dob TEXT NOT NULL,
            sex TEXT NOT NULL,
            type TEXT NOT NULL,
            address TEXT,
            language TEXT DEFAULT 'en',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )`
        );

        // Create visits table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS visits (
            visit_id TEXT PRIMARY KEY,
            patient_id TEXT NOT NULL,
            date_visited TEXT NOT NULL,
            vitals TEXT,
            notes TEXT,
            next_visit_date TEXT,
            synced INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )`
        );

        // Create vaccinations table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS vaccinations (
            vaccine_id TEXT PRIMARY KEY,
            patient_id TEXT NOT NULL,
            vaccine_name TEXT NOT NULL,
            due_date TEXT NOT NULL,
            administered_date TEXT,
            status TEXT DEFAULT 'due',
            synced INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )`
        );

        // Create sync log table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS sync_log (
            sync_id TEXT PRIMARY KEY,
            date TEXT NOT NULL,
            items_synced_count INTEGER DEFAULT 0,
            status TEXT DEFAULT 'success',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )`
        );
      }, reject, resolve);
    });
  }

  static encryptData(data) {
    return CryptoJS.AES.encrypt(JSON.stringify(data), 'ehr-secret-key').toString();
  }

  static decryptData(encryptedData) {
    const bytes = CryptoJS.AES.decrypt(encryptedData, 'ehr-secret-key');
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  }

  // Patient operations
  static async savePatient(patientData) {
    const patient = {
      patient_id: patientData.patient_id || uuidv4(),
      name: patientData.name,
      dob: patientData.dob,
      sex: patientData.sex,
      type: patientData.type,
      address: patientData.address,
      language: patientData.language || 'en'
    };

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `INSERT OR REPLACE INTO patients 
           (patient_id, name, dob, sex, type, address, language) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [patient.patient_id, patient.name, patient.dob, patient.sex, 
           patient.type, patient.address, patient.language],
          (_, result) => resolve(patient),
          (_, error) => reject(error)
        );
      });
    });
  }

  static async getPatients() {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM patients ORDER BY created_at DESC',
          [],
          (_, { rows }) => resolve(rows._array),
          (_, error) => reject(error)
        );
      });
    });
  }

  static async getPatient(patientId) {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM patients WHERE patient_id = ?',
          [patientId],
          (_, { rows }) => resolve(rows._array[0]),
          (_, error) => reject(error)
        );
      });
    });
  }

  // Visit operations
  static async saveVisit(visitData) {
    const visit = {
      visit_id: visitData.visit_id || uuidv4(),
      patient_id: visitData.patient_id,
      date_visited: visitData.date_visited || new Date().toISOString(),
      vitals: JSON.stringify(visitData.vitals || {}),
      notes: visitData.notes,
      next_visit_date: visitData.next_visit_date,
      synced: 0
    };

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `INSERT OR REPLACE INTO visits 
           (visit_id, patient_id, date_visited, vitals, notes, next_visit_date, synced) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [visit.visit_id, visit.patient_id, visit.date_visited, 
           visit.vitals, visit.notes, visit.next_visit_date, visit.synced],
          (_, result) => resolve(visit),
          (_, error) => reject(error)
        );
      });
    });
  }

  static async getVisits(patientId) {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM visits WHERE patient_id = ? ORDER BY date_visited DESC',
          [patientId],
          (_, { rows }) => {
            const visits = rows._array.map(visit => ({
              ...visit,
              vitals: JSON.parse(visit.vitals || '{}')
            }));
            resolve(visits);
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  // Vaccination operations
  static async saveVaccination(vaccineData) {
    const vaccine = {
      vaccine_id: vaccineData.vaccine_id || uuidv4(),
      patient_id: vaccineData.patient_id,
      vaccine_name: vaccineData.vaccine_name,
      due_date: vaccineData.due_date,
      administered_date: vaccineData.administered_date,
      status: vaccineData.status || 'due',
      synced: 0
    };

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `INSERT OR REPLACE INTO vaccinations 
           (vaccine_id, patient_id, vaccine_name, due_date, administered_date, status, synced) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [vaccine.vaccine_id, vaccine.patient_id, vaccine.vaccine_name, 
           vaccine.due_date, vaccine.administered_date, vaccine.status, vaccine.synced],
          (_, result) => resolve(vaccine),
          (_, error) => reject(error)
        );
      });
    });
  }

  static async getVaccinations(patientId) {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM vaccinations WHERE patient_id = ? ORDER BY due_date',
          [patientId],
          (_, { rows }) => resolve(rows._array),
          (_, error) => reject(error)
        );
      });
    });
  }

  static async getDueVaccinations() {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT v.*, p.name as patient_name 
           FROM vaccinations v 
           JOIN patients p ON v.patient_id = p.patient_id 
           WHERE v.status = 'due' AND v.due_date <= date('now', '+7 days')
           ORDER BY v.due_date`,
          [],
          (_, { rows }) => resolve(rows._array),
          (_, error) => reject(error)
        );
      });
    });
  }

  // Sync operations
  static async getUnsyncedData() {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        // Get unsynced patients
        tx.executeSql(
          'SELECT * FROM patients',
          [],
          (_, { rows: patients }) => {
            // Get unsynced visits
            tx.executeSql(
              'SELECT * FROM visits WHERE synced = 0',
              [],
              (_, { rows: visits }) => {
                // Get unsynced vaccinations
                tx.executeSql(
                  'SELECT * FROM vaccinations WHERE synced = 0',
                  [],
                  (_, { rows: vaccinations }) => {
                    resolve({
                      patients: patients._array,
                      visits: visits._array.map(visit => ({
                        ...visit,
                        vitals: JSON.parse(visit.vitals || '{}')
                      })),
                      vaccinations: vaccinations._array
                    });
                  },
                  (_, error) => reject(error)
                );
              },
              (_, error) => reject(error)
            );
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  static async markAsSynced(table, ids) {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        const placeholders = ids.map(() => '?').join(',');
        tx.executeSql(
          `UPDATE ${table} SET synced = 1 WHERE ${table.slice(0, -1)}_id IN (${placeholders})`,
          ids,
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      });
    });
  }

  static async logSync(itemsCount, status = 'success') {
    const syncLog = {
      sync_id: uuidv4(),
      date: new Date().toISOString(),
      items_synced_count: itemsCount,
      status
    };

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO sync_log (sync_id, date, items_synced_count, status) 
           VALUES (?, ?, ?, ?)`,
          [syncLog.sync_id, syncLog.date, syncLog.items_synced_count, syncLog.status],
          (_, result) => resolve(syncLog),
          (_, error) => reject(error)
        );
      });
    });
  }

  // Statistics
  static async getStats() {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        const queries = [
          'SELECT COUNT(*) as total_patients FROM patients',
          'SELECT COUNT(*) as total_visits FROM visits',
          'SELECT COUNT(*) as pending_vaccinations FROM vaccinations WHERE status = "due"',
          'SELECT COUNT(*) as unsynced_items FROM visits WHERE synced = 0'
        ];

        let completed = 0;
        const results = {};

        queries.forEach((query, index) => {
          tx.executeSql(
            query,
            [],
            (_, { rows }) => {
              const key = ['total_patients', 'total_visits', 'pending_vaccinations', 'unsynced_items'][index];
              results[key] = rows._array[0][key];
              completed++;
              
              if (completed === queries.length) {
                resolve(results);
              }
            },
            (_, error) => reject(error)
          );
        });
      });
    });
  }
}

export { DatabaseService };
