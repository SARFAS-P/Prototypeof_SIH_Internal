import { DatabaseService } from './DatabaseService';

class SyncService {
  static async syncData(token) {
    try {
      // Get all unsynced data
      const unsyncedData = await DatabaseService.getUnsyncedData();
      
      if (unsyncedData.patients.length === 0 && 
          unsyncedData.visits.length === 0 && 
          unsyncedData.vaccinations.length === 0) {
        return { success: true, itemsSynced: 0, message: 'No data to sync' };
      }

      // Prepare sync payload
      const syncPayload = {
        patients: unsyncedData.patients,
        visits: unsyncedData.visits,
        vaccinations: unsyncedData.vaccinations
      };

      // Attempt to sync with server
      const response = await fetch('http://localhost:3000/api/sync/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(syncPayload)
      });

      if (response.ok) {
        const result = await response.json();
        
        // Mark data as synced locally
        if (unsyncedData.patients.length > 0) {
          const patientIds = unsyncedData.patients.map(p => p.patient_id);
          await DatabaseService.markAsSynced('patients', patientIds);
        }
        
        if (unsyncedData.visits.length > 0) {
          const visitIds = unsyncedData.visits.map(v => v.visit_id);
          await DatabaseService.markAsSynced('visits', visitIds);
        }
        
        if (unsyncedData.vaccinations.length > 0) {
          const vaccineIds = unsyncedData.vaccinations.map(v => v.vaccine_id);
          await DatabaseService.markAsSynced('vaccinations', vaccineIds);
        }

        // Log successful sync
        await DatabaseService.logSync(result.items_synced, 'success');

        return {
          success: true,
          itemsSynced: result.items_synced,
          message: 'Sync completed successfully'
        };
      } else {
        const error = await response.json();
        await DatabaseService.logSync(0, 'failed');
        
        return {
          success: false,
          error: error.error || 'Sync failed',
          itemsSynced: 0
        };
      }
    } catch (error) {
      // Network error - data remains unsynced
      await DatabaseService.logSync(0, 'failed');
      
      return {
        success: false,
        error: 'Network error - data saved locally for later sync',
        itemsSynced: 0
      };
    }
  }

  static async getSyncStatus() {
    try {
      const stats = await DatabaseService.getStats();
      return {
        unsyncedItems: stats.unsynced_items || 0,
        totalPatients: stats.total_patients || 0,
        totalVisits: stats.total_visits || 0,
        pendingVaccinations: stats.pending_vaccinations || 0
      };
    } catch (error) {
      return {
        unsyncedItems: 0,
        totalPatients: 0,
        totalVisits: 0,
        pendingVaccinations: 0
      };
    }
  }

  static async forceSyncAll() {
    // Force sync all data regardless of sync status
    try {
      const allData = await DatabaseService.getUnsyncedData();
      
      // Reset sync status for all items
      await DatabaseService.markAsSynced('visits', []);
      await DatabaseService.markAsSynced('vaccinations', []);
      
      // Now sync everything
      return await this.syncData();
    } catch (error) {
      return {
        success: false,
        error: 'Force sync failed',
        itemsSynced: 0
      };
    }
  }
}

export { SyncService };
