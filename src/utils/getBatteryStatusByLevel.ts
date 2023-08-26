import { trayIconPaths } from "../constants/tray";

export function getBatteryLevelStatus(
  batteryLevel: number
): keyof typeof trayIconPaths {
  if (batteryLevel == -1) {
    return "no-device";
  }

  if (batteryLevel >= 80) {
    return "battery-very-high";
  }

  if (batteryLevel >= 50) {
    return "battery-high";
  }

  if (batteryLevel >= 20) {
    return "battery-medium";
  }

  if (batteryLevel >= 10) {
    return "battery-low";
  }

  return "battery-very-low";
}
