import cron from 'node-cron';
import { DeviceService } from '@/modules/device/deviceService.js';

const deviceService = new DeviceService();

cron.schedule('0 * * * *', async () => {
  // Every hour
  console.log('🕒 Checking for inactive sessions...');

  const result = await deviceService.expireInactiveSessions(60);

  if (result.expiredCount > 0) {
    console.log(`🔒 Expired ${result.expiredCount} inactive sessions`);
  }
});

// Every minute
cron.schedule('* * * * *', () => { ''; });

// Every hour
cron.schedule('0 * * * *', () => {'';});

// Every 6 hours
cron.schedule('0 */6 * * *', () => {'';});

// Daily at 3 AM
cron.schedule('0 3 * * *', () => {'';});

// Every Sunday at 2 AM
cron.schedule('0 2 * * 0', () => { ''; });
