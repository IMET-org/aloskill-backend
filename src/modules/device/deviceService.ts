/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import type { DeviceInfo } from '@/types/deviceSessionStore.js';
import { DeviceFingerprint } from '../../utils/deviceFingerprint.js';
import crypto from 'crypto';

export class DeviceService {
  async trackUserLogin(userId: string, deviceInfo: DeviceInfo, sessionToken: string) {
    const deviceId = DeviceFingerprint.generateDeviceId(deviceInfo);

    // Check if this device already exists for user
    const existingSession = await prisma.userSession.findFirst({
      where: {
        userId,
        deviceId,
      },
    });

    if (existingSession) {
      // Update existing session
      return await prisma.userSession.update({
        where: { id: existingSession.id },
        data: {
          sessionToken: await this.hashToken(sessionToken),
          ipAddress: deviceInfo.ipAddress,
          lastActivity: new Date(),
          isActive: true,
        },
      });
    } else {
      // Create new device session
      return await prisma.userSession.create({
        data: {
          userId,
          deviceId,
          sessionToken: await this.hashToken(sessionToken),
          userAgent: deviceInfo.userAgent,
          ipAddress: deviceInfo.ipAddress,
          deviceType: deviceInfo.deviceType,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          platform: deviceInfo.platform,
          location: deviceInfo.location
            ? `${deviceInfo.location.city}, ${deviceInfo.location.country}`
            : undefined,
          isActive: true,
          lastActivity: new Date(),
        },
      });
    }
  }

  // Get all active devices for a user
  async getUserDevices(userId: string) {
    return await prisma.userSession.findMany({
      where: {
        userId,
        isActive: true,
      },
      orderBy: {
        lastActivity: 'desc',
      },
    });
  }

  // Logout from specific device
  async logoutDevice(userId: string, deviceId: string) {
    return await prisma.userSession.updateMany({
      where: {
        userId,
        deviceId,
      },
      data: {
        isActive: false,
        lastActivity: new Date(),
      },
    });
  }

  // Logout from all devices except current
  async logoutOtherDevices(userId: string, currentDeviceId: string) {
    return await prisma.userSession.updateMany({
      where: {
        userId,
        deviceId: { not: currentDeviceId },
        isActive: true,
      },
      data: {
        isActive: false,
        lastActivity: new Date(),
      },
    });
  }

  // Update last activity timestamp for a user's device
  async updateLastActivity(userId: string, deviceId: string): Promise<void> {
    try {
      await prisma.userSession.updateMany({
        where: {
          userId,
          deviceId,
          isActive: true,
        },
        data: {
          lastActivity: new Date(),
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Error updating last activity:', error);
      // Don't throw error - this is a background operation
    }
  }

  // Mark inactive sessions as expired
  async expireInactiveSessions(maxInactiveMinutes = 30): Promise<{ expiredCount: number }> {
    const cutoffTime = new Date();
    cutoffTime.setMinutes(cutoffTime.getMinutes() - maxInactiveMinutes);

    const result = await prisma.userSession.updateMany({
      where: {
        isActive: true,
        lastActivity: { lt: cutoffTime },
      },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    console.log(`📄 Expired ${result.count} inactive sessions`);
    return { expiredCount: result.count };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
