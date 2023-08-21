export const HYPER_X_CLOUD_II_WIRELESS_VID = 1008;
export const HYPER_X_CLOUD_II_WIRELESS_PID = 395;

export const BATTERY_LEVEL_INDEX = 7;
export const BATTERY_LEVEL_PREFIX = [6, 255, 187, 2, 0].join();
export const NOW_CHARGING = [6, 255, 187, 3, 1].join();
export const STOPPED_CHARGING = [6, 255, 187, 3, 0].join();
export const NOW_MUTED = [6, 255, 187, 32, 1].join();
export const STOPPED_MUTED = [6, 255, 187, 32, 0].join();
export const NOW_MIC_DISCONNECTED = [6, 255, 187, 8, 0].join();
export const NOW_MIC_CONNECTED = [6, 255, 187, 8, 1].join();
export const POWER_OFF = [100, 3].join();
export const POWER_ON = [100, 1].join();

export const BATTERY_LEVEL_PACKET = new Array(20).fill(0);
BATTERY_LEVEL_PACKET[0] = 6;
BATTERY_LEVEL_PACKET[1] = 255;
BATTERY_LEVEL_PACKET[2] = 187;
BATTERY_LEVEL_PACKET[3] = 2;

export type DeviceEvent =
  | "batteryLevel"
  | "charging"
  | "stoppedCharging"
  | "muted"
  | "stoppedMuted"
  | "micDisconnected"
  | "micConnected"
  | "powerOff"
  | "powerOn";

export const deviceEvents = new Map();

deviceEvents.set(BATTERY_LEVEL_PREFIX, "batteryLevel");
deviceEvents.set(NOW_CHARGING, "charging");
deviceEvents.set(STOPPED_CHARGING, "stoppedCharging");
deviceEvents.set(NOW_MUTED, "muted");
deviceEvents.set(STOPPED_MUTED, "stoppedMuted");
deviceEvents.set(NOW_MIC_DISCONNECTED, "micDisconnected");
deviceEvents.set(NOW_MIC_CONNECTED, "micConnected");
deviceEvents.set(POWER_OFF, "powerOff");
deviceEvents.set(POWER_ON, "powerOn");
