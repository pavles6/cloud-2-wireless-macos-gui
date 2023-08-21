import Device from "../device";

export const labelGetters = new Map();
labelGetters.set(
  "status",
  (device: Device) =>
    `HyperX Cloud II Wireless: ${
      device.isHeadsetOn ? "Connected" : "Not connected"
    }`
);
labelGetters.set(
  "is_mic_connected",
  (device: Device) =>
    `Microphone: ${
      device.isMicConnected === undefined && device.isMuted === undefined
        ? "N/A"
        : `${device.isMuted ? "Muted" : "On"}`
    }`
);
labelGetters.set(
  "battery",
  (device: Device) =>
    `Battery: ${device.batteryLevel}%${device.isCharging ? ", Charging" : ""}`
);

export const trayIconPaths = {
  "no-device": "../assets/icons/no-device/waveform.png",
  "battery-high": "../assets/icons/battery-high/waveform.png",
  "battery-medium": "../assets/icons/battery-medium/waveform.png",
  "battery-low": "../assets/icons/battery-low/waveform.png",
};

export const trayMenuTemplate = [
  {
    label: "",
    type: "normal",
    id: "status",
  },
  { type: "separator" },
  {
    label: "",
    type: "normal",
    id: "battery",
  },
  {
    label: "",
    type: "normal",
    id: "is_mic_connected",
  },
  { type: "separator" },
  {
    label: "Exit",
    type: "normal",
    id: "exit",
    click: null,
    accelerator: "CommandOrControl+Q",
  },
] as unknown[];
