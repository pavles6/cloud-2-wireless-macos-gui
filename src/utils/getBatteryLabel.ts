import Device from "../device";

export function getBatteryLabel(device: Device) {
  return `Battery: ${device.batteryLevel}% remaining`;
}
