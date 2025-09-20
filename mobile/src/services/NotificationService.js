import * as Notifications from 'expo-notifications';
import { DatabaseService } from './DatabaseService';

class NotificationService {
  static async init() {
    // Request permissions
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Notification permission not granted');
      return;
    }

    // Schedule periodic checks for due vaccinations
    this.scheduleVaccinationReminders();
  }

  static async scheduleVaccinationReminders() {
    try {
      // Cancel existing notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Get due vaccinations
      const dueVaccinations = await DatabaseService.getDueVaccinations();
      
      // Schedule notifications for each due vaccination
      for (const vaccine of dueVaccinations) {
        const dueDate = new Date(vaccine.due_date);
        const now = new Date();
        
        // Only schedule if due date is in the future
        if (dueDate > now) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Vaccination Due',
              body: `${vaccine.patient_name} - ${vaccine.vaccine_name} is due on ${dueDate.toLocaleDateString()}`,
              data: {
                patientId: vaccine.patient_id,
                vaccineId: vaccine.vaccine_id
              }
            },
            trigger: {
              date: dueDate
            }
          });
        }
      }

      // Schedule daily reminder check
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Daily Health Check',
          body: 'Check for due vaccinations and upcoming visits'
        },
        trigger: {
          hour: 9,
          minute: 0,
          repeats: true
        }
      });

    } catch (error) {
      console.log('Error scheduling notifications:', error);
    }
  }

  static async scheduleVisitReminder(patientName, visitDate) {
    try {
      const visitDateTime = new Date(visitDate);
      
      // Schedule reminder 1 day before
      const reminderDate = new Date(visitDateTime);
      reminderDate.setDate(reminderDate.getDate() - 1);
      
      if (reminderDate > new Date()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Visit Reminder',
            body: `${patientName} has an upcoming visit tomorrow`,
            data: {
              type: 'visit_reminder',
              visitDate: visitDate
            }
          },
          trigger: {
            date: reminderDate
          }
        });
      }
    } catch (error) {
      console.log('Error scheduling visit reminder:', error);
    }
  }

  static async showImmediateNotification(title, body, data = {}) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data
        },
        trigger: null // Show immediately
      });
    } catch (error) {
      console.log('Error showing notification:', error);
    }
  }

  static async getNotificationHistory() {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      return notifications;
    } catch (error) {
      console.log('Error getting notification history:', error);
      return [];
    }
  }

  static async cancelNotification(notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.log('Error canceling notification:', error);
    }
  }

  static async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.log('Error canceling all notifications:', error);
    }
  }
}

export { NotificationService };
